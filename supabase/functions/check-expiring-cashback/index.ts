import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExpiringCashback {
  id: string;
  user_id: string;
  cashback_amount_cents: number;
  expires_at: string;
  email?: string;
  full_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[CHECK-EXPIRING-CASHBACK] Function started");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("[CHECK-EXPIRING-CASHBACK] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Find cashbacks expiring in 7 days or less
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    console.log("[CHECK-EXPIRING-CASHBACK] Checking for expiring cashbacks...");

    // Get all cashbacks that are expiring soon and haven't been fully used
    const { data: expiringCashbacks, error: fetchError } = await supabase
      .from('user_cashback')
      .select('id, user_id, cashback_amount_cents, expires_at')
      .eq('is_claimed', true)
      .gt('cashback_amount_cents', 0)
      .not('expires_at', 'is', null)
      .lte('expires_at', sevenDaysFromNow.toISOString())
      .gt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error("[CHECK-EXPIRING-CASHBACK] Error fetching cashbacks:", fetchError);
      throw fetchError;
    }

    console.log(`[CHECK-EXPIRING-CASHBACK] Found ${expiringCashbacks?.length || 0} expiring cashbacks`);

    if (!expiringCashbacks || expiringCashbacks.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No expiring cashbacks found",
          processed: 0 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user emails for notifications
    const userIds = [...new Set(expiringCashbacks.map(c => c.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name')
      .in('user_id', userIds);

    if (profilesError) {
      console.error("[CHECK-EXPIRING-CASHBACK] Error fetching profiles:", profilesError);
    }

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    let emailsSent = 0;
    let notificationsSent = 0;

    for (const cashback of expiringCashbacks) {
      const profile = profileMap.get(cashback.user_id);
      const expiresAt = new Date(cashback.expires_at);
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine urgency level
      let urgencyLevel: 'low' | 'medium' | 'high';
      let subject: string;
      
      if (daysUntilExpiry <= 1) {
        urgencyLevel = 'high';
        subject = '🚨 Último dia! Seu cashback expira amanhã!';
      } else if (daysUntilExpiry <= 3) {
        urgencyLevel = 'medium';
        subject = `⚠️ Atenção! Seu cashback expira em ${daysUntilExpiry} dias`;
      } else {
        urgencyLevel = 'low';
        subject = `💰 Lembrete: Seu cashback expira em ${daysUntilExpiry} dias`;
      }

      const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(cashback.cashback_amount_cents / 100);

      const formattedDate = expiresAt.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      // Create in-app notification
      const { error: notifError } = await supabase
        .from('service_notifications')
        .insert({
          user_id: cashback.user_id,
          title: subject,
          message: `Você tem ${formattedAmount} de cashback que expira em ${formattedDate}. Use agora para não perder!`,
          notification_type: 'cashback_expiring',
          service_type: 'cashback',
          metadata: {
            cashback_id: cashback.id,
            amount_cents: cashback.cashback_amount_cents,
            expires_at: cashback.expires_at,
            days_until_expiry: daysUntilExpiry,
            urgency: urgencyLevel
          }
        });

      if (notifError) {
        console.error(`[CHECK-EXPIRING-CASHBACK] Error creating notification for user ${cashback.user_id}:`, notifError);
      } else {
        notificationsSent++;
      }

      // Send email if user has email
      if (profile?.email) {
        try {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">
                    ${urgencyLevel === 'high' ? '🚨' : urgencyLevel === 'medium' ? '⚠️' : '💰'} 
                    Seu Cashback Está Expirando!
                  </h1>
                </div>
                
                <div style="padding: 30px;">
                  <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                    Olá${profile.full_name ? `, ${profile.full_name}` : ''}! 👋
                  </p>
                  
                  <div style="background-color: ${urgencyLevel === 'high' ? '#fef2f2' : urgencyLevel === 'medium' ? '#fffbeb' : '#f0fdf4'}; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                    <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Você tem</p>
                    <p style="color: ${urgencyLevel === 'high' ? '#dc2626' : urgencyLevel === 'medium' ? '#d97706' : '#16a34a'}; font-size: 32px; font-weight: bold; margin: 0;">
                      ${formattedAmount}
                    </p>
                    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">de cashback disponível</p>
                  </div>
                  
                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <p style="color: #374151; margin: 0; font-size: 14px;">
                      <strong>⏰ Expira em:</strong> ${formattedDate}
                      ${daysUntilExpiry <= 1 ? '<span style="color: #dc2626;"> (Amanhã!)</span>' : ` (${daysUntilExpiry} dias)`}
                    </p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 25px;">
                    Não deixe seu cashback expirar! Use-o como desconto na sua próxima compra de serviço na plataforma AtentAI.
                  </p>
                  
                  <div style="text-align: center;">
                    <a href="https://atentai.com.br/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Usar Meu Cashback Agora
                    </a>
                  </div>
                </div>
                
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    AtentAI - Inteligência Tributária<br>
                    Este email foi enviado automaticamente. Não responda a este email.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `;

          await resend.emails.send({
            from: "AtentAI <noreply@atentai.com.br>",
            to: [profile.email],
            subject: subject,
            html: emailHtml,
          });

          emailsSent++;
          console.log(`[CHECK-EXPIRING-CASHBACK] Email sent to ${profile.email}`);
        } catch (emailError) {
          console.error(`[CHECK-EXPIRING-CASHBACK] Error sending email to ${profile.email}:`, emailError);
        }
      }
    }

    console.log(`[CHECK-EXPIRING-CASHBACK] Completed: ${emailsSent} emails, ${notificationsSent} notifications sent`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${expiringCashbacks.length} expiring cashbacks`,
        emailsSent,
        notificationsSent,
        processed: expiringCashbacks.length
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[CHECK-EXPIRING-CASHBACK] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
