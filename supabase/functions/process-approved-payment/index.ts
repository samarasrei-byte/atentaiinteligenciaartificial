import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
  'analise_fiscal': { chatType: 'guilherme', specialist: 'Guilherme' },
  'clarity': { chatType: 'cesar', specialist: 'César' },
  'control': { chatType: 'cesar', specialist: 'César' },
  'ir_simples': { chatType: 'cesar', specialist: 'César' },
  'ir_completo': { chatType: 'cesar', specialist: 'César' },
  'bi_contabilidade': { chatType: 'cesar', specialist: 'César' },
};

// Service → welcome message
function getWelcomeMessage(serviceType: string, serviceName: string, userName: string): string {
  const firstName = userName.split(' ')[0] || 'Cliente';
  
  const messages: Record<string, string> = {
    'credit_repair_pf': `Pagamento confirmado ✅\nSeu serviço **Limpa Nome Pessoa Física** já está ativo.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com o especialista responsável.\n\nPara darmos início ao processo, preciso que me envie:\n📄 Seu CPF\n📝 Um breve contexto sobre a restrição\n\nEstou à disposição para ajudar! 🤝`,
    'credit_repair_pj': `Pagamento confirmado ✅\nSeu serviço **Limpa Nome Empresa (CNPJ)** já está ativo.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com o especialista responsável.\n\nPara iniciarmos, preciso que me envie:\n📄 CNPJ da empresa\n📝 Porte da empresa e breve contexto\n\nVamos resolver isso juntos! 🤝`,
    'contador_premium': `Pagamento confirmado ✅\nSua assinatura **Contador Premium Plus** já está ativa.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com seu contador responsável.\n\nEstou à disposição para qualquer dúvida contábil, fiscal ou tributária. Como posso ajudar? 🤝`,
    'clarity': `Pagamento confirmado ✅\nSeu plano **Atentai Clarity** já está ativo.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com o especialista de BI financeiro.\n\nVamos iniciar seu onboarding financeiro:\n📊 Qual o segmento da sua empresa?\n💰 Faturamento mensal aproximado?\n🎯 Quais métricas são mais importantes para você?\n\nVamos transformar seus dados em decisões! 📈`,
    'control': `Pagamento confirmado ✅\nSeu plano **Atentai Control** já está ativo.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com o especialista de controle financeiro avançado.\n\nVamos iniciar o diagnóstico empresarial:\n🏢 Razão social e CNPJ\n📊 Número de funcionários e faturamento\n🎯 Principais desafios financeiros\n\nJuntos vamos ter controle total! 🚀`,
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
      // Search by email
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const foundUser = existingUsers?.users?.find(
        (u: any) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (foundUser) {
        log("Existing user found by email", { userId: foundUser.id });
        return foundUser.id;
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

      // Ensure profile exists (trigger should handle this, but just in case)
      await supabaseAdmin.from('profiles').upsert({
        user_id: newUser.user.id,
        full_name: fullName || '',
        email: email.toLowerCase(),
        phone: phone || '',
      }, { onConflict: 'user_id' });

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
    } else if (serviceType === 'contador_premium' || serviceType === 'clarity' || serviceType === 'control') {
      // Create/update subscription
      const planMap: Record<string, { planType: string; priceCents: number }> = {
        'contador_premium': { planType: 'contador_premium', priceCents: 19700 },
        'clarity': { planType: 'clarity', priceCents: 149700 },
        'control': { planType: 'control', priceCents: 349700 },
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
    }

    // 4. Create welcome chat message
    const welcomeMessage = getWelcomeMessage(serviceType, serviceName || serviceType, fullName || 'Cliente');

    await supabaseAdmin.from('user_welcome_chats').upsert({
      user_id: userId,
      chat_type: specialist.chatType,
      message_date: new Date().toISOString().split('T')[0],
      service_context: serviceType,
      message_content: welcomeMessage,
      is_read: false,
    }, { onConflict: 'user_id,chat_type,message_date' });

    log("Welcome chat created", { chatType: specialist.chatType });

    // 5. Build redirect URL
    const serviceParam = serviceType === 'credit_repair_pf' || serviceType === 'credit_repair_pj' || serviceType === 'credit_repair'
      ? 'limpanome'
      : serviceType === 'contador_premium'
        ? 'contador-premium'
        : serviceType === 'clarity' || serviceType === 'control'
          ? 'bi-contabilidade'
          : serviceType;

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
