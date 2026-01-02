import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GUEST-PAYMENT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    let event: Stripe.Event;
    
    const webhookSecret = Deno.env.get("STRIPE_GUEST_WEBHOOK_SECRET");
    
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Webhook signature verification failed, parsing raw body");
        event = JSON.parse(body);
      }
    } else {
      event = JSON.parse(body);
      logStep("No webhook secret configured, parsing raw body");
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle checkout session completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      logStep("Checkout session completed", { 
        sessionId: session.id,
        paymentStatus: session.payment_status,
        metadata: session.metadata
      });

      if (session.payment_status === "paid") {
        const metadata = session.metadata || {};
        const { 
          request_id, 
          service_type, 
          email, 
          full_name, 
          cpf, 
          phone, 
          is_guest, 
          user_id 
        } = metadata;

        let finalUserId = user_id;
        let accountCreated = false;
        let tempPassword = '';

        // If guest user, create account
        if (is_guest === 'true' && email && !user_id) {
          // Generate temporary password
          tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
          
          // Create user account
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              full_name: full_name,
              created_from: 'guest_checkout',
              first_service: service_type,
              needs_onboarding: true, // Flag for post-payment onboarding
            },
          });

          if (createError) {
            logStep("Error creating user", { error: createError.message });
            // User might already exist
            const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
            if (existingUser) {
              finalUserId = existingUser.id;
              logStep("Found existing user", { userId: finalUserId });
            }
          } else if (newUser.user) {
            finalUserId = newUser.user.id;
            accountCreated = true;
            logStep("User created", { userId: finalUserId });

            // Create profile
            await supabaseAdmin
              .from('profiles')
              .upsert({
                user_id: finalUserId,
                full_name: full_name,
                email: email,
                phone: phone,
              });

            // Add user role
            await supabaseAdmin
              .from('user_roles')
              .insert({
                user_id: finalUserId,
                role: 'user',
              });
          }
        }

        // Update request with real user_id and payment status
        if (finalUserId && request_id) {
          const tableName = service_type === 'ir' ? 'ir_requests' 
            : service_type === 'credit_repair' ? 'credit_repair_requests' 
            : 'certificate_requests';

          await supabaseAdmin
            .from(tableName)
            .update({ 
              user_id: finalUserId,
              payment_status: 'paid',
              status: 'pending',
            })
            .eq('id', request_id);

          logStep("Request updated", { requestId: request_id, userId: finalUserId });

          // Create a notification for the user
          await supabaseAdmin
            .from('service_notifications')
            .insert({
              user_id: finalUserId,
              title: 'Pagamento confirmado! ✅',
              message: `Seu pedido de ${service_type === 'ir' ? 'Declaração de IR' : service_type === 'credit_repair' ? 'Limpa Nome' : 'Certidão'} foi recebido e está em análise.`,
              notification_type: 'payment_confirmed',
              service_type: service_type,
              metadata: { request_id, payment_session: session.id },
            });
        }

        // Send email with account info if new account created
        if (accountCreated && tempPassword) {
          const resendKey = Deno.env.get("RESEND_API_KEY");
          if (resendKey) {
            const resend = new Resend(resendKey);

            const serviceNames: Record<string, string> = {
              ir: 'Declaração de IR',
              credit_repair: 'Limpa Nome',
              certificate: 'Certidão',
            };

            const serviceName = serviceNames[service_type] || 'Serviço';
            const origin = "https://atent.ai";

            await resend.emails.send({
              from: "AtentAI <noreply@atent.ai>",
              to: [email],
              subject: `Pagamento Confirmado - ${serviceName} - AtentAI`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                    .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
                    .step-number { background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; }
                    .footer { text-align: center; margin-top: 20px; color: #888; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Pagamento Confirmado! ✅</h1>
                    </div>
                    <div class="content">
                      <h2>Olá, ${full_name}!</h2>
                      <p>Seu pagamento para <strong>${serviceName}</strong> foi confirmado com sucesso.</p>
                      
                      <div class="credentials">
                        <p><strong>📧 Email:</strong> ${email}</p>
                        <p><strong>🔐 Senha temporária:</strong> ${tempPassword}</p>
                      </div>
                      
                      <p>⚠️ <strong>Importante:</strong> Por segurança, altere sua senha no primeiro acesso.</p>
                      
                      <div class="steps">
                        <h3>Próximos Passos:</h3>
                        <div class="step">
                          <div class="step-number">1</div>
                          <div>
                            <strong>Complete seu cadastro</strong><br>
                            Acesse sua conta e complete suas informações para personalizarmos seu atendimento.
                          </div>
                        </div>
                        <div class="step">
                          <div class="step-number">2</div>
                          <div>
                            <strong>Aguarde contato</strong><br>
                            Um contador especializado entrará em contato em até 24h úteis.
                          </div>
                        </div>
                        <div class="step">
                          <div class="step-number">3</div>
                          <div>
                            <strong>Acompanhe online</strong><br>
                            Veja o status do seu pedido em tempo real pelo painel.
                          </div>
                        </div>
                      </div>
                      
                      <a href="${origin}/payment-success?type=${service_type}&request_id=${request_id}&guest=true&onboarding=true" class="button">Acessar Minha Conta</a>
                    </div>
                    <div class="footer">
                      <p>AtentAI - Contabilidade Inteligente</p>
                      <p>Dúvidas? Responda este email.</p>
                    </div>
                  </div>
                </body>
                </html>
              `,
            });

            logStep("Welcome email sent", { email });
          }
        }
      }
    }

    // Handle payment intent succeeded (for more real-time updates)
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      logStep("Payment intent succeeded", { 
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        metadata: paymentIntent.metadata
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
