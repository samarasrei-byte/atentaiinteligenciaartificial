import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[SIMULATE-PAYMENT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// Service → specialist mapping (same as process-approved-payment)
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

function getWelcomeMessage(serviceType: string, serviceName: string, userName: string, cpf?: string | null): string {
  const firstName = userName.split(' ')[0] || 'Cliente';
  
  const cpfAlreadyProvided = cpf && cpf.length >= 11;
  const limpaNomePfNextSteps = cpfAlreadyProvided
    ? `Já temos seu CPF registrado (${cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4')}) ✅\n\nPara darmos início ao processo, preciso apenas de:\n📝 Um breve contexto sobre a restrição\n📄 Documentos que tiver disponíveis`
    : `Para darmos início ao processo, preciso que me envie:\n📄 Seu CPF\n📝 Um breve contexto sobre a restrição`;

  const messages: Record<string, string> = {
    'credit_repair_pf': `[SIMULAÇÃO DE TESTE] Pagamento confirmado ✅\nSeu serviço **Limpa Nome Pessoa Física** já está ativo.\n\nOlá, ${firstName}! 👋\nEste é seu canal direto com o especialista responsável.\n\n${limpaNomePfNextSteps}\n\nEstou à disposição para ajudar! 🤝`,
    'credit_repair_pj': `[SIMULAÇÃO DE TESTE] Pagamento confirmado ✅\nSeu serviço **Limpa Nome Empresa (CNPJ)** já está ativo.\n\nOlá, ${firstName}! 👋\nPara iniciarmos, preciso que me envie:\n📄 CNPJ da empresa\n📝 Porte da empresa e breve contexto\n\nVamos resolver isso juntos! 🤝`,
  };

  return messages[serviceType] || `[SIMULAÇÃO DE TESTE] Pagamento confirmado ✅\nSeu serviço **${serviceName}** já está ativo.\n\nEste é seu canal direto com o especialista responsável.\nEstamos à disposição para ajudar! 🤝`;
}

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
    log("Function started - TEST MODE (no real payment verification)");

    const { serviceType, serviceName, email, fullName, phone, metadata } = await req.json();

    if (!serviceType || !email) {
      throw new Error("serviceType and email are required");
    }

    log("Processing simulation", { serviceType, email: email.substring(0, 3) + '***' });

    // 1. Find or create user (same logic as process-approved-payment)
    let userId: string;
    let isNewUser = false;
    let tempPassword: string | null = null;

    // Check auth header
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
        userId = await findOrCreateUser();
      }
    } else {
      userId = await findOrCreateUser();
    }

    async function findOrCreateUser(): Promise<string> {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const foundUser = existingUsers?.users?.find(
        (u: any) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (foundUser) {
        log("Existing user found", { userId: foundUser.id });
        return foundUser.id;
      }

      tempPassword = generatePassword();
      isNewUser = true;

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || '',
          phone: phone || '',
          created_via: 'test_simulation',
          service_type: serviceType,
        },
      });

      if (createError) throw new Error(`Erro ao criar conta: ${createError.message}`);

      await supabaseAdmin.from('profiles').upsert({
        user_id: newUser.user.id,
        full_name: fullName || '',
        email: email.toLowerCase(),
        phone: phone || '',
      }, { onConflict: 'user_id' });

      log("New user created", { userId: newUser.user.id });
      return newUser.user.id;
    }

    // 2. Link service
    const specialist = SERVICE_SPECIALIST[serviceType] || { chatType: 'guilherme', specialist: 'Guilherme' };

    if (serviceType === 'credit_repair_pf' || serviceType === 'credit_repair_pj' || serviceType === 'credit_repair') {
      const { data: newReq } = await supabaseAdmin.from('credit_repair_requests').insert({
        user_id: userId,
        full_name: fullName || 'Teste Simulação',
        email,
        phone,
        debt_amount_cents: 0,
        service_price_cents: serviceType === 'credit_repair_pj' ? 128000 : 82450,
        final_price_cents: serviceType === 'credit_repair_pj' ? 128000 : 82450,
        payment_status: 'paid',
        payment_confirmed_at: new Date().toISOString(),
        status: 'pending',
      }).select('id').single();
      log("Credit repair request created (TEST)", { requestId: newReq?.id });
    } else if (serviceType === 'clarity' || serviceType === 'control' || serviceType === 'contador_premium') {
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
      log("Subscription created (TEST)", { planType: plan.planType });
    }

    // 3. Fetch CPF if available
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
    }

    // 4. Create welcome chat message
    const welcomeMessage = getWelcomeMessage(serviceType, serviceName || serviceType, fullName || 'Cliente', userCpf);

    await supabaseAdmin.from('user_welcome_chats').upsert({
      user_id: userId,
      chat_type: specialist.chatType,
      message_date: new Date().toISOString().split('T')[0],
      service_context: serviceType,
      message_content: welcomeMessage,
      is_read: false,
    }, { onConflict: 'user_id,chat_type,message_date' });

    log("Welcome chat created (TEST)", { chatType: specialist.chatType });

    // 4. Generate a magic link token for auto-login (works for both new and existing users)
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
    });

    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if (!magicLinkError && magicLinkData?.properties?.hashed_token) {
      // Verify the OTP to get a session
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

    // 5. Build redirect URL
    const serviceParam = serviceType.startsWith('credit_repair') ? 'limpanome' : serviceType;
    const redirectPath = `/chat/${specialist.chatType}?servico=${serviceParam}`;

    log("Simulation complete", { userId, isNewUser, redirectPath });

    return new Response(JSON.stringify({
      success: true,
      userId,
      isNewUser,
      tempPassword: isNewUser ? tempPassword : undefined,
      email: email.toLowerCase(),
      redirectPath,
      specialist: specialist.specialist,
      chatType: specialist.chatType,
      testMode: true,
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
