import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GUEST-SERVICE-PAYMENT] ${step}${detailsStr}`);
};

// Input validation schema
const requestSchema = z.object({
  serviceType: z.enum(['ir', 'credit_repair', 'credit_repair_pf', 'credit_repair_pj', 'certificate', 'company_opening', 'contador_premium', 'clarity', 'control']),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  fullName: z.string().min(2, "Nome muito curto").max(200, "Nome muito longo"),
  cpf: z.string().optional().nullable().transform(val => {
    if (!val || val.trim() === '') return null;
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length !== 11) return null;
    return cleaned;
  }),
  phone: z.string().optional().nullable().transform(val => {
    if (!val || val.trim() === '') return null;
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length < 10 || cleaned.length > 11) return null;
    return cleaned;
  }),
  irType: z.enum(['simples', 'completo']).optional(),
  fiscalYear: z.number().min(2000).max(2100).optional(),
  hasInvestments: z.boolean().optional(),
  hasRentalIncome: z.boolean().optional(),
  hasForeignIncome: z.boolean().optional(),
  incomeSourcesCount: z.number().min(0).max(100).optional(),
  debtAmountCents: z.number().min(0).max(1000000000).optional(),
  debtDescription: z.string().max(500).optional().nullable(),
  creditors: z.array(z.string().max(100)).max(50).optional(),
  bureausSelected: z.array(z.string().max(50)).max(10).optional(),
  certificateType: z.string().max(100).optional(),
  notes: z.string().max(1000).optional().nullable(),
  companyType: z.enum(['mei', 'me', 'ltda']).optional(),
  profession: z.string().max(100).optional().nullable(),
  annualRevenue: z.number().min(0).max(10000000).optional(),
  monthlyExpenses: z.number().min(0).max(1000000).optional(),
  hasEmployees: z.union([z.boolean(), z.literal('yes'), z.literal('no')]).optional(),
  wantsPartner: z.union([z.boolean(), z.literal('yes'), z.literal('no')]).optional(),
  currentSituation: z.string().max(200).optional().nullable(),
  recommendedRegime: z.string().max(50).optional().nullable(),
  recommendationReasons: z.array(z.string().max(200)).max(20).optional(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
});

// Service configurations - OFFICIAL PRICES
const SERVICE_CONFIGS: Record<string, { name: string; description: string; basePriceCents: number }> = {
  ir_simples: {
    name: 'Declaração IR Simples',
    description: 'Declaração de Imposto de Renda - Modalidade Simples',
    basePriceCents: 20000,
  },
  ir_completo: {
    name: 'Declaração IR Completo',
    description: 'Declaração de Imposto de Renda - Modalidade Completa',
    basePriceCents: 42000,
  },
  credit_repair: {
    name: 'Limpa Nome Completo',
    description: 'Regularização em 8 plataformas',
    basePriceCents: 97000,
  },
  credit_repair_pf: {
    name: 'Limpa Nome Pessoa Física',
    description: 'Liminar coletiva para CPF',
    basePriceCents: 78000,
  },
  credit_repair_pj: {
    name: 'Limpa Nome Empresa (CNPJ)',
    description: 'Liminar coletiva para CNPJ',
    basePriceCents: 97000,
  },
  certificate: {
    name: 'Certidão',
    description: 'Emissão de Certidão',
    basePriceCents: 8000,
  },
  company_opening_mei: {
    name: 'Abertura de MEI',
    description: 'Abertura de Microempreendedor Individual',
    basePriceCents: 15000,
  },
  company_opening_me: {
    name: 'Abertura de ME/LTDA',
    description: 'Abertura de Microempresa ou LTDA',
    basePriceCents: 78000,
  },
  contador_premium: {
    name: 'Contador Premium Plus',
    description: 'Assinatura mensal com contador dedicado',
    basePriceCents: 19700,
  },
  clarity: {
    name: 'Atentai Clarity',
    description: 'BI financeiro com supervisão humana',
    basePriceCents: 149700,
  },
  control: {
    name: 'Atentai Control',
    description: 'Controle financeiro avançado',
    basePriceCents: 349700,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const body = await req.json();
    let validatedData;
    try {
      validatedData = requestSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const userErrors = validationError.errors.map(e => e.message).join(', ');
        throw new Error(`Dados inválidos: ${userErrors}`);
      }
      throw validationError;
    }

    const { 
      serviceType, email, fullName, cpf, phone,
      irType, fiscalYear, hasInvestments, hasRentalIncome,
      hasForeignIncome, incomeSourcesCount,
      debtAmountCents, debtDescription, creditors, bureausSelected,
      certificateType, notes,
      companyType, profession, annualRevenue, monthlyExpenses,
      hasEmployees, wantsPartner, currentSituation,
      recommendedRegime, recommendationReasons, city, state,
    } = validatedData;

    logStep("Request validated", { serviceType, email: email.substring(0, 3) + '***' });

    // Check if user already exists - use getUserByEmail (fast) instead of listUsers (slow)
    let userId: string | null = null;
    let isExistingUser = false;
    
    const { data: existingUser, error: lookupError } = await supabaseAdmin.auth.admin.getUserByEmail(email.toLowerCase());
    
    if (!lookupError && existingUser?.user) {
      userId = existingUser.user.id;
      isExistingUser = true;
      logStep("Existing user found", { userId });
    }

    // Get service config
    let serviceKey: string;
    if (serviceType === 'ir') {
      serviceKey = irType === 'simples' ? 'ir_simples' : 'ir_completo';
    } else if (serviceType === 'company_opening') {
      serviceKey = companyType === 'mei' ? 'company_opening_mei' : 'company_opening_me';
    } else {
      serviceKey = serviceType;
    }
    const serviceConfig = SERVICE_CONFIGS[serviceKey];
    
    if (!serviceConfig) {
      throw new Error("Tipo de serviço inválido");
    }

    const finalPriceCents = serviceConfig.basePriceCents;

    logStep("Price", { finalPriceCents });

    // Create record based on service type
    let requestId: string;
    
    if (serviceType === 'ir') {
      const { data: request, error } = await supabaseAdmin
        .from('ir_requests')
        .insert({
          user_id: userId || '00000000-0000-0000-0000-000000000000',
          ir_type: irType,
          fiscal_year: fiscalYear || new Date().getFullYear() - 1,
          full_name: fullName,
          cpf, email, phone,
          has_investments: hasInvestments,
          has_rental_income: hasRentalIncome,
          has_foreign_income: hasForeignIncome,
          income_sources_count: incomeSourcesCount,
          notes,
          base_price_cents: finalPriceCents,
          final_price_cents: finalPriceCents,
          discount_applied: false,
          payment_status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      requestId = request.id;
    } else if (serviceType === 'credit_repair' || serviceType === 'credit_repair_pf' || serviceType === 'credit_repair_pj') {
      let partnerId: string | null = null;
      const { data: activePartner } = await supabaseAdmin
        .from('credit_repair_partners')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();
      if (activePartner) partnerId = activePartner.id;

      const { data: request, error } = await supabaseAdmin
        .from('credit_repair_requests')
        .insert({
          user_id: userId || '00000000-0000-0000-0000-000000000000',
          full_name: fullName,
          cpf, email, phone,
          debt_amount_cents: debtAmountCents || 0,
          debt_description: debtDescription,
          creditors: creditors || [],
          bureaus_selected: bureausSelected || ['spc', 'serasa', 'scpc', 'boa_vista'],
          service_price_cents: finalPriceCents,
          final_price_cents: finalPriceCents,
          discount_applied: false,
          payment_status: 'pending',
          partner_id: partnerId,
        })
        .select()
        .single();
      if (error) throw error;
      requestId = request.id;
    } else if (serviceType === 'certificate') {
      const { data: request, error } = await supabaseAdmin
        .from('certificate_requests')
        .insert({
          user_id: userId || '00000000-0000-0000-0000-000000000000',
          certificate_type: certificateType || 'certidao_negativa',
          amount_cents: finalPriceCents,
          notes,
          payment_status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      requestId = request.id;
    } else if (serviceType === 'company_opening') {
      const { data: request, error } = await supabaseAdmin
        .from('company_opening_requests')
        .insert({
          user_id: userId || '00000000-0000-0000-0000-000000000000',
          full_name: fullName,
          cpf, email, phone,
          profession,
          annual_revenue_cents: Math.round((annualRevenue || 0) * 100),
          monthly_expenses_cents: Math.round((monthlyExpenses || 0) * 100),
          has_employees: hasEmployees === true || hasEmployees === 'yes',
          wants_partner: wantsPartner === true || wantsPartner === 'yes',
          current_situation: currentSituation,
          city, state,
          recommended_regime: recommendedRegime || companyType,
          recommendation_reasons: recommendationReasons || [],
          service_price_cents: finalPriceCents,
          payment_status: 'pending',
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      requestId = request.id;
    } else if (serviceType === 'contador_premium' || serviceType === 'clarity' || serviceType === 'control') {
      // Subscription-type services - no separate request table needed for guest
      // The process-approved-payment function will create the subscription after payment
      requestId = `sub_${serviceType}_${Date.now()}`;
      logStep("Subscription service - will be created after payment", { serviceType });
    } else {
      throw new Error("Tipo de serviço não suportado");
    }

    logStep("Request created", { requestId, serviceType });

    // Return record info for frontend MP checkout
    return new Response(JSON.stringify({ 
      requestId,
      serviceName: serviceConfig.name,
      serviceDescription: serviceConfig.description,
      isExistingUser,
      finalPrice: finalPriceCents,
    }), {
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    const isValidationError = errorMessage.startsWith('Dados inválidos:') || 
                               errorMessage === 'Tipo de serviço inválido' ||
                               errorMessage === 'Tipo de serviço não suportado';
    
    const clientMessage = isValidationError 
      ? errorMessage 
      : 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.';
    
    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      status: isValidationError ? 400 : 500,
    });
  }
});
