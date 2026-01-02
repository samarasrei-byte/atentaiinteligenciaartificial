import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CASHBACK-NOTIFICATION] ${step}${detailsStr}`);
};

interface NotificationRequest {
  type: 'new_level' | 'expiring_soon' | 'level_change';
  userId: string;
  cashbackData?: {
    percent: number;
    amount_cents: number;
    expires_at?: string;
    month_year?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { type, userId, cashbackData }: NotificationRequest = await req.json();
    logStep("Request received", { type, userId });

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get user email from profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile?.email) {
      logStep("Profile not found", { userId, error: profileError?.message });
      throw new Error("User profile not found");
    }

    logStep("User profile found", { email: profile.email, name: profile.full_name });

    let subject = '';
    let htmlContent = '';
    const userName = profile.full_name || 'Cliente';
    const formattedAmount = cashbackData?.amount_cents 
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cashbackData.amount_cents / 100)
      : 'R$ 0,00';

    switch (type) {
      case 'new_level':
        subject = `🎉 Parabéns! Você atingiu ${cashbackData?.percent}% de cashback!`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://atentai.com.br/logo-atentai.png" alt="Atent Aí" style="max-width: 150px;">
            </div>
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 16px; text-align: center; color: white; margin-bottom: 20px;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px;">🎉 Novo Nível de Cashback!</h1>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">Parabéns, ${userName}!</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
              <p style="margin: 0 0 15px 0;">Você utilizou múltiplos serviços este mês e atingiu um novo nível de cashback!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #10b981;">
                <p style="margin: 0; color: #666; font-size: 14px;">Seu cashback atual</p>
                <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; color: #10b981;">${cashbackData?.percent}%</p>
                <p style="margin: 10px 0 0 0; color: #333; font-size: 18px;">Valor acumulado: <strong>${formattedAmount}</strong></p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://atentai.com.br/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Ver Meu Cashback
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
              <p>Atent Aí - Simplificando a Reforma Tributária</p>
              <p>São Paulo, Vila Lobos</p>
            </div>
          </body>
          </html>
        `;
        break;

      case 'expiring_soon':
        const expirationDate = cashbackData?.expires_at 
          ? new Date(cashbackData.expires_at).toLocaleDateString('pt-BR')
          : 'em breve';
        
        subject = `⚠️ Seu cashback de ${formattedAmount} expira ${expirationDate}!`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://atentai.com.br/logo-atentai.png" alt="Atent Aí" style="max-width: 150px;">
            </div>
            
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 16px; text-align: center; color: white; margin-bottom: 20px;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px;">⚠️ Cashback Expirando!</h1>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">Não perca seu crédito, ${userName}!</p>
            </div>
            
            <div style="background: #fffbeb; padding: 25px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #fcd34d;">
              <p style="margin: 0 0 15px 0;">Você tem cashback disponível que expira em breve. Use-o na sua próxima compra de serviço!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 14px;">Cashback disponível</p>
                <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; color: #f59e0b;">${formattedAmount}</p>
                <p style="margin: 10px 0 0 0; color: #dc2626; font-size: 14px; font-weight: 600;">
                  ⏰ Expira em: ${expirationDate}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://atentai.com.br/dashboard" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Usar Meu Cashback Agora
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
              <p>Atent Aí - Simplificando a Reforma Tributária</p>
              <p>São Paulo, Vila Lobos</p>
            </div>
          </body>
          </html>
        `;
        break;

      case 'level_change':
        subject = `📈 Seu cashback aumentou para ${cashbackData?.percent}%!`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://atentai.com.br/logo-atentai.png" alt="Atent Aí" style="max-width: 150px;">
            </div>
            
            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; border-radius: 16px; text-align: center; color: white; margin-bottom: 20px;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px;">📈 Nível Aumentado!</h1>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">Continue assim, ${userName}!</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
              <p style="margin: 0 0 15px 0;">Excelente! Ao usar mais serviços, seu percentual de cashback aumentou!</p>
              
              <div style="display: flex; justify-content: center; align-items: center; gap: 20px; flex-wrap: wrap;">
                <div style="background: white; padding: 15px 25px; border-radius: 8px; text-align: center;">
                  <p style="margin: 0; color: #666; font-size: 12px;">Novo nível</p>
                  <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #6366f1;">${cashbackData?.percent}%</p>
                </div>
                <div style="background: white; padding: 15px 25px; border-radius: 8px; text-align: center;">
                  <p style="margin: 0; color: #666; font-size: 12px;">Acumulado</p>
                  <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #10b981;">${formattedAmount}</p>
                </div>
              </div>
            </div>
            
            <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <p style="margin: 0; color: #059669; font-size: 14px;">
                💡 <strong>Dica:</strong> Use 5 serviços diferentes para atingir o máximo de 20% de cashback!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://atentai.com.br/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Ver Serviços Disponíveis
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
              <p>Atent Aí - Simplificando a Reforma Tributária</p>
              <p>São Paulo, Vila Lobos</p>
            </div>
          </body>
          </html>
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    // Send email
    logStep("Sending email", { to: profile.email, subject });
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Atent Aí <noreply@atentai.com.br>",
      to: [profile.email],
      subject,
      html: htmlContent,
    });

    if (emailError) {
      logStep("Email send error", { error: emailError });
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    logStep("Email sent successfully", { emailId: emailData?.id });

    // Also create in-app notification
    await supabaseClient
      .from('service_notifications')
      .insert({
        user_id: userId,
        title: subject.replace(/^[🎉⚠️📈]\s*/, ''),
        message: type === 'new_level' 
          ? `Você atingiu ${cashbackData?.percent}% de cashback! Valor acumulado: ${formattedAmount}`
          : type === 'expiring_soon'
          ? `Seu cashback de ${formattedAmount} expira em breve. Use-o na próxima compra!`
          : `Seu cashback aumentou para ${cashbackData?.percent}%! Continue usando os serviços.`,
        notification_type: 'cashback',
        service_type: 'cashback',
        metadata: cashbackData,
      });

    logStep("In-app notification created");

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailData?.id,
        message: 'Notification sent successfully'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
