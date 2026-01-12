import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
  serviceType: z.enum(['ir', 'credit_repair', 'certificate', 'company_opening']),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  fullName: z.string().min(2, "Nome muito curto").max(200, "Nome muito longo"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos").optional().nullable(),
  phone: z.string().regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos").optional().nullable(),
  // IR-specific fields
  irType: z.enum(['simples', 'completo']).optional(),
  fiscalYear: z.number().min(2000).max(2100).optional(),
  hasInvestments: z.boolean().optional(),
  hasRentalIncome: z.boolean().optional(),
  hasForeignIncome: z.boolean().optional(),
  incomeSourcesCount: z.number().min(0).max(100).optional(),
  // Credit repair fields
  debtAmountCents: z.number().min(0).max(1000000000).optional(), // Max R$ 10M
  debtDescription: z.string().max(500, "Descrição muito longa").optional().nullable(),
  creditors: z.array(z.string().max(100)).max(50).optional(),
  bureausSelected: z.array(z.string().max(50)).max(10).optional(),
  // Certificate fields
  certificateType: z.string().max(100).optional(),
  notes: z.string().max(1000, "Notas muito longas").optional().nullable(),
  // Company opening fields
  companyType: z.enum(['mei', 'me', 'ltda']).optional(),
  profession: z.string().max(100, "Profissão muito longa").optional().nullable(),
  annualRevenue: z.number().min(0).max(10000000).optional(), // Max R$ 10M
  monthlyExpenses: z.number().min(0).max(1000000).optional(), // Max R$ 1M
  hasEmployees: z.union([z.boolean(), z.literal('yes'), z.literal('no')]).optional(),
  wantsPartner: z.union([z.boolean(), z.literal('yes'), z.literal('no')]).optional(),
  currentSituation: z.string().max(200).optional().nullable(),
  recommendedRegime: z.string().max(50).optional().nullable(),
  recommendationReasons: z.array(z.string().max(200)).max(20).optional(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
});

// Helper to sanitize string inputs
const sanitizeString = (str: string | null | undefined): string | null => {
  if (!str) return null;
  return str.trim().slice(0, 1000); // Extra safety limit
};

// Service configurations
const SERVICE_CONFIGS = {
  ir_simples: {
    name: 'Declaração IR Simples',
    description: 'Declaração de Imposto de Renda - Modalidade Simples',
    basePriceCents: 15000,
    discountPercent: 20,
  },
  ir_completo: {
    name: 'Declaração IR Completo',
    description: 'Declaração de Imposto de Renda - Modalidade Completa',
    basePriceCents: 29900,
    discountPercent: 20,
  },
  credit_repair: {
    name: 'Limpa Nome Completo',
    description: 'Regularização em 8 plataformas: SPC, Serasa, SCPC, Boa Vista, Quod, Cenprot, Registrato, CADIN',
    basePriceCents: 97000,
    discountPercent: 15,
  },
  certificate: {
    name: 'Certidão',
    description: 'Emissão de Certidão',
    basePriceCents: 8000,
    discountPercent: 10,
  },
  company_opening_mei: {
    name: 'Abertura de MEI',
    description: 'Abertura de Microempreendedor Individual com acompanhamento completo',
    basePriceCents: 15000,
    discountPercent: 15,
  },
  company_opening_me: {
    name: 'Abertura de ME/LTDA',
    description: 'Abertura de Microempresa ou LTDA com análise tributária',
    basePriceCents: 49900,
    discountPercent: 15,
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
    // Validate and parse input
    let validatedData;
    try {
      validatedData = requestSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        // Log full details server-side, return safe message to client
        const errors = validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        logStep("Validation failed", { errors });
        // Return user-friendly message without internal path details
        const userErrors = validationError.errors.map(e => e.message).join(', ');
        throw new Error(`Dados inválidos: ${userErrors}`);
      }
      throw validationError;
    }

    const { 
      serviceType, 
      email, 
      fullName, 
      cpf, 
      phone,
      irType,
      fiscalYear,
      hasInvestments,
      hasRentalIncome,
      hasForeignIncome,
      incomeSourcesCount,
      debtAmountCents,
      debtDescription,
      creditors,
      bureausSelected,
      certificateType,
      notes,
      companyType,
      profession,
      annualRevenue,
      monthlyExpenses,
      hasEmployees,
      wantsPartner,
      currentSituation,
      recommendedRegime,
      recommendationReasons,
      city,
      state,
    } = validatedData;

    logStep("Request validated", { serviceType, email: email.substring(0, 3) + '***' });

    // Check if user already exists
    let userId: string | null = null;
    let isExistingUser = false;
    
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const foundUser = existingUser?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      userId = foundUser.id;
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
    const serviceConfig = SERVICE_CONFIGS[serviceKey as keyof typeof SERVICE_CONFIGS];
    
    if (!serviceConfig) {
      throw new Error("Tipo de serviço inválido");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if subscriber for discount
    let isSubscriber = false;
    if (isExistingUser) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customers.data[0].id,
          status: "active",
          limit: 1,
        });
        isSubscriber = subscriptions.data.length > 0;
      }
    }

    // Calculate price
    const basePriceCents = serviceConfig.basePriceCents;
    const discountCents = isSubscriber ? Math.round(basePriceCents * (serviceConfig.discountPercent / 100)) : 0;
    const finalPriceCents = basePriceCents - discountCents;

    logStep("Price calculation", { basePriceCents, discountCents, finalPriceCents, isSubscriber });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create temporary record based on service type
    let requestId: string;
    
    if (serviceType === 'ir') {
      const { data: request, error } = await supabaseAdmin
        .from('ir_requests')
        .insert({
          user_id: userId || '00000000-0000-0000-0000-000000000000', // Placeholder for guest
          ir_type: irType,
          fiscal_year: fiscalYear || new Date().getFullYear() - 1,
          full_name: fullName,
          cpf: cpf,
          email: email,
          phone: phone,
          has_investments: hasInvestments,
          has_rental_income: hasRentalIncome,
          has_foreign_income: hasForeignIncome,
          income_sources_count: incomeSourcesCount,
          notes: notes,
          base_price_cents: basePriceCents,
          final_price_cents: finalPriceCents,
          discount_applied: isSubscriber,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      requestId = request.id;
      
    } else if (serviceType === 'credit_repair') {
      // Find active partner to assign the request
      let partnerId: string | null = null;
      const { data: activePartner } = await supabaseAdmin
        .from('credit_repair_partners')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (activePartner) {
        partnerId = activePartner.id;
        logStep("Active partner found", { partnerId });
      }

      const { data: request, error } = await supabaseAdmin
        .from('credit_repair_requests')
        .insert({
          user_id: userId || '00000000-0000-0000-0000-000000000000',
          full_name: fullName,
          cpf: cpf,
          email: email,
          phone: phone,
          debt_amount_cents: debtAmountCents || 0,
          debt_description: debtDescription,
          creditors: creditors || [],
          bureaus_selected: bureausSelected || ['spc', 'serasa', 'scpc', 'boa_vista'],
          service_price_cents: basePriceCents,
          final_price_cents: finalPriceCents,
          discount_applied: isSubscriber,
          payment_status: 'pending',
          partner_id: partnerId, // Auto-assign to active partner
        })
        .select()
        .single();

      if (error) throw error;
      requestId = request.id;
      logStep("Credit repair request created", { requestId, partnerId });
      
    } else if (serviceType === 'certificate') {
      const { data: request, error } = await supabaseAdmin
        .from('certificate_requests')
        .insert({
          user_id: userId || '00000000-0000-0000-0000-000000000000',
          certificate_type: certificateType || 'certidao_negativa',
          amount_cents: finalPriceCents,
          notes: notes,
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
          cpf: cpf,
          email: email,
          phone: phone,
          profession: profession,
          annual_revenue_cents: Math.round((annualRevenue || 0) * 100),
          monthly_expenses_cents: Math.round((monthlyExpenses || 0) * 100),
          has_employees: hasEmployees === true || hasEmployees === 'yes',
          wants_partner: wantsPartner === true || wantsPartner === 'yes',
          current_situation: currentSituation,
          city: city,
          state: state,
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
      logStep("Company opening request created", { requestId, companyType });
    } else {
      throw new Error("Tipo de serviço não suportado");
    }

    logStep("Request created", { requestId, serviceType });

    const origin = req.headers.get("origin") || "https://atent.ai";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: serviceConfig.name + (isSubscriber ? ' (Desconto Assinante)' : ''),
              description: serviceConfig.description,
            },
            unit_amount: finalPriceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${origin}/payment-success?type=${serviceType}&request_id=${requestId}&guest=true`,
      cancel_url: `${origin}/${
        serviceType === 'ir' ? 'ir' 
        : serviceType === 'credit_repair' ? 'limpa-nome' 
        : serviceType === 'company_opening' ? 'abertura-empresa'
        : 'certidoes'
      }?cancelled=true`,
      metadata: {
        request_id: requestId,
        service_type: serviceType,
        email: email,
        full_name: fullName,
        cpf: cpf || '',
        phone: phone || '',
        is_guest: (!isExistingUser).toString(),
        user_id: userId || '',
        company_type: companyType || '',
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Update request with session ID - company_opening doesn't have stripe_session_id column by default
    if (serviceType !== 'company_opening') {
      const tableName = serviceType === 'ir' ? 'ir_requests' 
        : serviceType === 'credit_repair' ? 'credit_repair_requests' 
        : 'certificate_requests';

      await supabaseAdmin
        .from(tableName)
        .update({ stripe_session_id: session.id })
        .eq('id', requestId);
    } else {
      // Update company_opening_requests payment_status
      await supabaseAdmin
        .from('company_opening_requests')
        .update({ payment_status: 'processing' })
        .eq('id', requestId);
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      isExistingUser,
      isSubscriber,
      originalPrice: basePriceCents,
      discount: discountCents,
      finalPrice: finalPriceCents,
    }), {
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // Determine if error is user-facing (validation) or internal
    const isValidationError = errorMessage.startsWith('Dados inválidos:') || 
                               errorMessage === 'Tipo de serviço inválido' ||
                               errorMessage === 'Tipo de serviço não suportado';
    
    // Return validation errors to user, but sanitize internal errors
    const clientMessage = isValidationError 
      ? errorMessage 
      : 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.';
    
    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" },
      status: isValidationError ? 400 : 500,
    });
  }
});
