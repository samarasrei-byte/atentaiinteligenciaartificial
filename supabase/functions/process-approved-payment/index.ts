import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[PROCESS-APPROVED] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// Service → specialist mapping
const SERVICE_SPECIALIST: Record<string, { chatType: string; specialist: string }> = {
  'credit_repair_pf': { chatType: 'guilherme', specialist: 'Guilherme' },
  'credit_repair_pj': { chatType: 'guilherme', specialist: 'Guilherme' },
  'credit_repair': { chatType: 'guilherme', specialist: 'Guilherme' },
  'contador_premium': { chatType: 'guilherme', specialist: 'Guilherme' },
  'abertura_empresa': { chatType: 'guilherme', specialist: 'Guilherme' },
  'analise_fiscal': { chatType: 'guilherme', specialist: 'Guilherme' },
  'ir_simples': { chatType: 'ia', specialist: 'Contador IA' },
  'ir_completo': { chatType: 'ia', specialist: 'Contador IA' },
  'certificate': { chatType: 'cesar', specialist: 'César' },
  'clarity': { chatType: 'cesar', specialist: 'César' },
  'control': { chatType: 'cesar', specialist: 'César' },
  'bi_contabilidade': { chatType: 'cesar', specialist: 'César' },
  // Platform subscriptions - no specialist chat needed
  'simulator': { chatType: 'guilherme', specialist: 'Guilherme' },
  'autonomo': { chatType: 'guilherme', specialist: 'Guilherme' },
  'premium': { chatType: 'guilherme', specialist: 'Guilherme' },
};

// Service → welcome message
function getWelcomeMessage(serviceType: string, serviceName: string, userName: string, cpf?: string | null): string {
  const firstName = userName.split(' ')[0] || 'Cliente';
  
  // For Limpa Nome PF: if CPF was already provided in checkout, don't ask again
  const cpfAlreadyProvided = cpf && cpf.length >= 11;
  const limpaNomePfNextSteps = cpfAlreadyProvided
    ? `Já temos seu CPF registrado (${cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4')}) ✅\n\nPara darmos início ao processo, preciso apenas de:\n📝 Um breve contexto sobre a restrição\n📄 Documentos que tiver disponíveis`
    : `Para darmos início ao processo, preciso que me envie:\n📄 Seu CPF\n📝 Um breve contexto sobre a restrição`;

  const messages: Record<string, string> = {
    'credit_repair_pf': `Pagamento confirmado ✅\nSeu serviço **Limpa Nome Pessoa Física** já está ativo.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com o especialista responsável.\n\n${limpaNomePfNextSteps}\n\nEstou à disposição para ajudar! 🤝`,
    'credit_repair_pj': `Pagamento confirmado ✅\nSeu serviço **Limpa Nome Empresa (CNPJ)** já está ativo.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com o especialista responsável.\n\nPara iniciarmos, preciso que me envie:\n📄 CNPJ da empresa\n📝 Porte da empresa e breve contexto\n\nVamos resolver isso juntos! 🤝`,
    'contador_premium': `Pagamento confirmado ✅\nSua assinatura **Contador Premium Plus** já está ativa.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com seu contador responsável.\n\nEstou à disposição para qualquer dúvida contábil, fiscal ou tributária. Como posso ajudar? 🤝`,
    'clarity': `Pagamento confirmado ✅\nSeu plano **Atentai Clarity** já está ativo.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com o especialista de BI financeiro.\n\nVamos iniciar seu onboarding financeiro:\n📊 Qual o segmento da sua empresa?\n💰 Faturamento mensal aproximado?\n🎯 Quais métricas são mais importantes para você?\n\nVamos transformar seus dados em decisões! 📈`,
    'control': `Pagamento confirmado ✅\nSeu plano **Atentai Control** já está ativo.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com o especialista de controle financeiro avançado.\n\nVamos iniciar o diagnóstico empresarial:\n🏢 Razão social e CNPJ\n📊 Número de funcionários e faturamento\n🎯 Principais desafios financeiros\n\nJuntos vamos ter controle total! 🚀`,
    'ir_simples': `Pagamento confirmado ✅\nSeu serviço **Declaração IR Simples** já está ativo.\n\nOlá, ${firstName}! 👋\nSou o José, especialista em Imposto de Renda.\n\nPara iniciarmos sua declaração, preciso de:\n📄 Informe de rendimentos\n📝 Documentos pessoais (CPF, comprovante de endereço)\n\nVamos cuidar do seu IR! 🤝`,
    'ir_completo': `Pagamento confirmado ✅\nSeu serviço **Declaração IR Completo** já está ativo.\n\nOlá, ${firstName}! 👋\nSou o José, especialista em Imposto de Renda.\n\nPara iniciarmos sua declaração, preciso de:\n📄 Informes de rendimentos e investimentos\n📝 Documentos pessoais\n🏠 Comprovantes de bens e direitos\n\nVamos cuidar do seu IR! 🤝`,
    'certificate': `Pagamento confirmado ✅\nSeu serviço **Emissão de Certidão** já está ativo.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com o especialista responsável.\n\nPara emitirmos sua certidão, preciso de:\n📄 CPF ou CNPJ\n📝 Tipo de certidão desejada\n\nVamos providenciar! 🤝`,
    'abertura_empresa': `Pagamento confirmado ✅\nSeu serviço **Abertura de Empresa** já está ativo.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com o especialista responsável.\n\nPara iniciarmos o processo, preciso de:\n📄 Documentos pessoais\n📝 Atividade desejada e nome fantasia\n🏢 Endereço comercial\n\nVamos abrir sua empresa! 🚀`,
    'simulator': `Pagamento confirmado ✅\nSua assinatura **Simulador Tributário** já está ativa.\n\nOlá, ${firstName}! 👋\nAcesse o simulador no menu principal para comparar regimes tributários.\n\nQualquer dúvida, estou à disposição! 🤝`,
    'autonomo': `Pagamento confirmado ✅\nSua assinatura **Plano Autônomo** já está ativa.\n\nOlá, ${firstName}! 👋\nAcesse seu dashboard financeiro no painel do autônomo.\n\nQualquer dúvida, estou à disposição! 🤝`,
    'premium': `Pagamento confirmado ✅\nSua assinatura **AtentAI Premium** já está ativa.\n\nOlá, ${firstName}! 👋\nTodos os recursos premium estão liberados.\n\nQualquer dúvida, estou à disposição! 🤝`,
  };

  return messages[serviceType] || `Pagamento confirmado ✅\nSeu serviço **${serviceName}** já está ativo.\n\nEste é seu canal direto com o especialista responsável.\nEstamos à disposição para ajudar! 🤝`;
}

// Generate a random password for auto-created accounts
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Send welcome email with credentials to new users
async function sendWelcomeEmail(email: string, fullName: string, tempPassword: string, serviceName: string, specialist: string): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    log("RESEND_API_KEY not configured - skipping welcome email");
    return;
  }

  const resend = new Resend(resendApiKey);
  const firstName = fullName.split(' ')[0] || 'Cliente';
  const loginUrl = 'https://atentaiinteligenciaartificial.lovable.app/login';

  try {
    const { error } = await resend.emails.send({
      from: "AtentAI <noreply@atentai.com.br>",
      to: [email],
      subject: `🎉 Bem-vindo à AtentAI, ${firstName}! Seu ${serviceName} está ativo`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
          
          <!-- Header com marca forte -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #10b981 100%); padding: 40px 24px; text-align: center;">
            <div style="font-size: 32px; font-weight: 800; color: white; letter-spacing: -0.5px; margin-bottom: 4px;">🧠 AtentAI</div>
            <p style="color: #5eead4; font-size: 13px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Inteligência Artificial Contábil</p>
          </div>

          <!-- Badge de confirmação -->
          <div style="text-align: center; margin-top: -20px;">
            <span style="display: inline-block; background: #10b981; color: white; font-weight: bold; font-size: 14px; padding: 10px 28px; border-radius: 24px; box-shadow: 0 4px 14px rgba(16,185,129,0.4);">
              ✅ PAGAMENTO CONFIRMADO
            </span>
          </div>

          <div style="padding: 32px 28px;">
            <h2 style="font-size: 22px; margin: 0 0 6px; color: white;">Olá, ${firstName}! 👋</h2>
            <p style="font-size: 15px; line-height: 1.7; color: #94a3b8; margin: 0 0 24px;">
              Parabéns pela melhor decisão que você poderia tomar. Seu serviço <strong style="color: #5eead4;">${serviceName}</strong> já está 100% ativo e o especialista <strong style="color: white;">${specialist}</strong> está aguardando você no chat para começar agora mesmo.
            </p>

            <!-- O que acontece agora -->
            <div style="background: linear-gradient(135deg, #064e3b, #0f766e); border-radius: 12px; padding: 20px; margin: 0 0 24px;">
              <p style="font-size: 14px; font-weight: 700; color: #5eead4; margin: 0 0 12px;">🚀 O que acontece agora?</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #d1fae5;">1️⃣</td>
                  <td style="padding: 6px 8px; font-size: 14px; color: #d1fae5;">Acesse sua conta com os dados abaixo</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #d1fae5;">2️⃣</td>
                  <td style="padding: 6px 8px; font-size: 14px; color: #d1fae5;">Converse diretamente com <strong>${specialist}</strong> no chat</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #d1fae5;">3️⃣</td>
                  <td style="padding: 6px 8px; font-size: 14px; color: #d1fae5;">Envie seus documentos e acompanhe tudo em tempo real</td>
                </tr>
              </table>
            </div>
            
            <!-- Credenciais -->
            <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 0 0 24px; border: 1px solid #334155;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 14px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">🔐 Seus dados de acesso</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #94a3b8; width: 120px;">E-mail:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: white; font-weight: 600;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #94a3b8;">Senha:</td>
                  <td style="padding: 6px 0;">
                    <code style="background: #334155; padding: 4px 12px; border-radius: 6px; font-size: 14px; color: #5eead4; font-weight: 600; letter-spacing: 0.5px;">${tempPassword}</code>
                  </td>
                </tr>
              </table>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 0 0 28px;">
              <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #06b6d4); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 800; font-size: 17px; box-shadow: 0 6px 20px rgba(16,185,129,0.35); letter-spacing: 0.3px;">
                Acessar minha conta →
              </a>
            </div>

            <p style="font-size: 12px; color: #475569; text-align: center; margin: 0; line-height: 1.6;">
              Após o primeiro acesso, recomendamos alterar sua senha em Configurações.<br>
              Se não foi você que realizou esta compra, ignore este e-mail.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #0c1222; padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="font-size: 11px; color: #475569; margin: 0 0 4px;">AtentAI — Inteligência Artificial Contábil</p>
            <p style="font-size: 11px; color: #334155; margin: 0;">© 2026 AtentAI • São Paulo, SP • contato@atentai.com.br</p>
          </div>
        </div>
      `,
    });

    if (error) {
      log("Welcome email send error (non-blocking)", { error: JSON.stringify(error) });
    } else {
      log("Welcome email sent successfully", { to: email.substring(0, 3) + '***' });
    }
  } catch (err) {
    log("Welcome email exception (non-blocking)", { error: String(err) });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    log("Function started");

    const { paymentId, serviceType, serviceName, email, fullName, phone, requestId, metadata } = await req.json();

    if (!paymentId || !serviceType || !email) {
      throw new Error("paymentId, serviceType and email are required");
    }

    log("Processing", { paymentId, serviceType, email: email.substring(0, 3) + '***' });

    // 1. Verify payment with Mercado Pago
    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${mpToken}` },
    });

    if (!mpRes.ok) throw new Error(`MP verification failed: ${mpRes.status}`);
    const mpData = await mpRes.json();

    if (mpData.status !== 'approved') {
      log("Payment not approved", { status: mpData.status });
      return new Response(JSON.stringify({ 
        error: 'Pagamento ainda não aprovado', 
        status: mpData.status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    log("Payment verified as approved", { mpPaymentId: mpData.id });

    // 2. Find or create user
    let userId: string;
    let isNewUser = false;
    let tempPassword: string | null = null;

    // Check existing auth header first
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const { data: authData } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
      if (authData.user) {
        userId = authData.user.id;
        log("User already authenticated", { userId });
      } else {
        // Auth token invalid, try email lookup
        userId = await findOrCreateUser();
      }
    } else {
      userId = await findOrCreateUser();
    }

    async function findOrCreateUser(): Promise<string> {
      // Use getUserByEmail instead of listing ALL users (much faster)
      const { data: existingUser, error: lookupError } = await supabaseAdmin.auth.admin.getUserByEmail(email.toLowerCase());

      if (!lookupError && existingUser?.user) {
        log("Existing user found by email", { userId: existingUser.user.id });
        return existingUser.user.id;
      }

      // Create new user
      tempPassword = generatePassword();
      isNewUser = true;

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password: tempPassword,
        email_confirm: true, // Auto-confirm since they paid
        user_metadata: {
          full_name: fullName || '',
          phone: phone || '',
          created_via: 'payment',
          service_type: serviceType,
        },
      });

      if (createError) {
        log("Error creating user", { error: createError.message });
        throw new Error(`Erro ao criar conta: ${createError.message}`);
      }

      log("New user created", { userId: newUser.user.id });

      // Ensure profile exists
      await supabaseAdmin.from('profiles').upsert({
        user_id: newUser.user.id,
        full_name: fullName || '',
        email: email.toLowerCase(),
        phone: phone || '',
      }, { onConflict: 'user_id' });

      // Assign 'user' role so DashboardRouter works correctly
      await supabaseAdmin.from('user_roles').upsert({
        user_id: newUser.user.id,
        role: 'user',
      }, { onConflict: 'user_id,role' });
      log("Role 'user' assigned to new user");

      // Send welcome email with credentials via Resend
      await sendWelcomeEmail(
        email.toLowerCase(),
        fullName || 'Cliente',
        tempPassword,
        serviceName || serviceType,
        SERVICE_SPECIALIST[serviceType]?.specialist || 'Guilherme'
      );

      return newUser.user.id;
    }

    // 3. Link service to user based on type
    const specialist = SERVICE_SPECIALIST[serviceType] || { chatType: 'guilherme', specialist: 'Guilherme' };

    if (serviceType === 'credit_repair_pf' || serviceType === 'credit_repair_pj' || serviceType === 'credit_repair') {
      // Update existing request or create new one
      if (requestId) {
        await supabaseAdmin.from('credit_repair_requests').update({
          user_id: userId,
          payment_status: 'paid',
          payment_confirmed_at: new Date().toISOString(),
          status: 'pending',
        }).eq('id', requestId);
        log("Credit repair request linked", { requestId });
      } else {
        const { data: newReq } = await supabaseAdmin.from('credit_repair_requests').insert({
          user_id: userId,
          full_name: fullName || 'Cliente',
          email,
          phone,
          debt_amount_cents: 0,
          service_price_cents: serviceType === 'credit_repair_pj' ? 128000 : 82450,
          final_price_cents: serviceType === 'credit_repair_pj' ? 128000 : 82450,
          payment_status: 'paid',
          payment_confirmed_at: new Date().toISOString(),
          status: 'pending',
        }).select('id').single();
        log("Credit repair request created", { requestId: newReq?.id });
      }
    } else if (['contador_premium', 'clarity', 'control', 'simulator', 'autonomo', 'premium'].includes(serviceType)) {
      // Create/update subscription for ALL subscription-based plans
      const planMap: Record<string, { planType: string; priceCents: number }> = {
        'contador_premium': { planType: 'contador_premium', priceCents: 19899 },
        'clarity': { planType: 'clarity', priceCents: 149700 },
        'control': { planType: 'control', priceCents: 349700 },
        'simulator': { planType: 'simulator', priceCents: 3999 },
        'autonomo': { planType: 'autonomo', priceCents: 6500 },
        'premium': { planType: 'premium', priceCents: 9800 },
      };
      const plan = planMap[serviceType];
      
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        plan_type: plan.planType,
        price_cents: plan.priceCents,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
      }, { onConflict: 'user_id' });

      log("Subscription created/updated", { planType: plan.planType });
    } else if (serviceType === 'ir_simples' || serviceType === 'ir_completo') {
      // IR services - create AI declaration automatically
      const declarationType = serviceType === 'ir_completo' ? 'completa' : 'simplificada';
      const { data: newDecl } = await supabaseAdmin.from('ir_ai_declarations').insert({
        user_id: userId,
        tax_year: new Date().getFullYear() - 1,
        declaration_type: declarationType,
        status: 'draft',
      }).select('id').single();
      log("IR AI declaration created", { declarationId: newDecl?.id, type: declarationType });
    } else if (serviceType === 'certificate') {
      // Certificate services - create a record for tracking
      log("Certificate service paid", { serviceType, userId });
    } else if (serviceType === 'abertura_empresa') {
      // Company opening - update payment status if requestId exists
      if (requestId) {
        await supabaseAdmin.from('company_opening_requests').update({
          payment_status: 'paid',
          status_updated_at: new Date().toISOString(),
        }).eq('id', requestId);
        log("Company opening request updated", { requestId });
      }
      log("Company opening service paid", { serviceType, userId });
    }

    // 4. Fetch CPF if available (for Limpa Nome, already captured in checkout)
    let userCpf: string | null = null;
    if (serviceType === 'credit_repair_pf' || serviceType === 'credit_repair_pj' || serviceType === 'credit_repair') {
      const { data: reqData } = await supabaseAdmin
        .from('credit_repair_requests')
        .select('cpf')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      userCpf = reqData?.cpf || null;
      log("CPF lookup", { hasCpf: !!userCpf });
    }

    // 5. Create welcome chat message
    const welcomeMessage = getWelcomeMessage(serviceType, serviceName || serviceType, fullName || 'Cliente', userCpf);

    await supabaseAdmin.from('user_welcome_chats').upsert({
      user_id: userId,
      chat_type: specialist.chatType,
      message_date: new Date().toISOString().split('T')[0],
      service_context: serviceType,
      message_content: welcomeMessage,
      is_read: false,
    }, { onConflict: 'user_id,chat_type,message_date' });

    log("Welcome chat created", { chatType: specialist.chatType });

    // 5. Generate session for auto-login (works for both new and existing users)
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
    });

    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if (!magicLinkError && magicLinkData?.properties?.hashed_token) {
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
        type: 'magiclink',
        token_hash: magicLinkData.properties.hashed_token,
      });
      if (!sessionError && sessionData?.session) {
        accessToken = sessionData.session.access_token;
        refreshToken = sessionData.session.refresh_token;
        log("Session generated for auto-login");
      } else {
        log("Could not generate session", { error: sessionError?.message });
      }
    }

    // 6. Build redirect URL
    const serviceParam = serviceType === 'credit_repair_pf' || serviceType === 'credit_repair_pj' || serviceType === 'credit_repair'
      ? 'limpanome'
      : serviceType === 'contador_premium'
        ? 'contador-premium'
        : serviceType === 'clarity' || serviceType === 'control'
          ? 'bi-contabilidade'
          : serviceType;

    // Redirect to user panel with chat tab auto-opened (instead of standalone chat page)
    const redirectPath = `/chat/${specialist.chatType}?servico=${serviceParam}`;

    log("Process complete", { userId, isNewUser, redirectPath });

    return new Response(JSON.stringify({
      success: true,
      userId,
      isNewUser,
      tempPassword: isNewUser ? tempPassword : undefined,
      email: email.toLowerCase(),
      redirectPath,
      specialist: specialist.specialist,
      chatType: specialist.chatType,
      accessToken,
      refreshToken,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
