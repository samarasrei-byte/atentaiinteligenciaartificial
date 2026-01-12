import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestUserConfig {
  email: string;
  password: string;
  full_name: string;
  role: 'contador' | 'autonomo' | 'user';
  plan_type?: string;
  isPartner?: boolean;
}

// Generate a cryptographically secure random password
function generateSecurePassword(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Check environment - block in production
    const environment = Deno.env.get("ENVIRONMENT") || "production";
    if (environment === "production") {
      console.log("create-test-users blocked: production environment");
      return new Response(
        JSON.stringify({ error: "This function is not available in production" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // SECURITY: Require admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log("create-test-users blocked: no authorization header");
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !authUser) {
      console.log("create-test-users blocked: invalid token");
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Verify admin role using secure RPC
    const { data: isAdmin, error: roleError } = await supabaseClient.rpc('has_role', {
      _user_id: authUser.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.log(`create-test-users blocked: user ${authUser.id} is not admin`);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    console.log(`create-test-users: authorized by admin ${authUser.id}`);

    // Generate secure passwords for test users
    const testUsers: TestUserConfig[] = [
      {
        email: "contadorteste@atentai.com.br",
        password: generateSecurePassword(),
        full_name: "Contador Teste",
        role: "contador",
        plan_type: "premium",
      },
      {
        email: "autonomoteste@atentai.com.br",
        password: generateSecurePassword(),
        full_name: "Autônomo Teste",
        role: "autonomo",
        plan_type: "premium",
      },
      {
        email: "empresateste@atentai.com.br",
        password: generateSecurePassword(),
        full_name: "Empresa Teste",
        role: "user",
        plan_type: "premium",
      },
      {
        email: "parceiroteste@atentai.com.br",
        password: generateSecurePassword(),
        full_name: "Parceiro Teste",
        role: "user",
        plan_type: "premium",
        isPartner: true,
      },
    ];

    const results: Array<{ email: string; status: string; userId?: string; tempPassword?: string }> = [];

    for (const testUser of testUsers) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseClient.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === testUser.email);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        
        // For partner, ensure partner setup exists
        if (testUser.isPartner) {
          const { data: existingPartnerLink } = await supabaseClient
            .from('credit_repair_partner_users')
            .select('id, partner_id')
            .eq('user_id', userId)
            .single();
          
          if (!existingPartnerLink) {
            // Create partner company
            const { data: partnerData } = await supabaseClient
              .from('credit_repair_partners')
              .insert({
                company_name: 'Parceiro Teste LTDA',
                trade_name: 'Parceiro Teste',
                contact_person: testUser.full_name,
                email: testUser.email,
                phone: '(11) 99999-9999',
                commission_percent: 15,
                is_active: true,
                status: 'active',
              })
              .select()
              .single();

            if (partnerData) {
              await supabaseClient
                .from('credit_repair_partner_users')
                .insert({
                  partner_id: partnerData.id,
                  user_id: userId,
                  role: 'admin',
                  is_primary: true,
                });
              results.push({ email: testUser.email, status: "partner_created", userId });
              continue;
            }
          }
        }
        
        results.push({ email: testUser.email, status: "already_exists", userId });
        continue;
      }

      // Create user with secure generated password
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: { full_name: testUser.full_name },
      });

      if (createError) {
        results.push({ email: testUser.email, status: `error: ${createError.message}` });
        continue;
      }

      userId = newUser.user.id;

      // Create profile
      await supabaseClient.from('profiles').upsert({
        user_id: userId,
        full_name: testUser.full_name,
        email: testUser.email,
      });

      // Assign role
      await supabaseClient.from('user_roles').insert({
        user_id: userId,
        role: testUser.role,
      });

      // Create free test subscription (10 years, no Stripe, no charges)
      const tenYearsFromNow = new Date();
      tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);

      await supabaseClient.from('subscriptions').insert({
        user_id: userId,
        status: 'active',
        plan_type: testUser.plan_type || 'premium',
        price_cents: 0,
        current_period_start: new Date().toISOString(),
        current_period_end: tenYearsFromNow.toISOString(),
        stripe_customer_id: null,
        stripe_subscription_id: null,
      });

      // Special handling for contador - create contador profile
      if (testUser.role === 'contador') {
        await supabaseClient.from('contador_profiles').upsert({
          user_id: userId,
          crc_number: 'CRC-TEST-123456',
          specialty: 'Reforma Tributária LC 214/2025',
          bio: 'Contador de teste para validação do sistema',
          hourly_rate_cents: 15000,
          available: true,
          rating: 5,
          total_consultations: 0,
        });
      }

      // Special handling for autonomo - create autonomo profile
      if (testUser.role === 'autonomo') {
        await supabaseClient.from('autonomo_profiles').upsert({
          user_id: userId,
          profession: 'Desenvolvedor de Software',
          profession_category: 'tecnologia',
          current_regime: 'pf',
          monthly_revenue_average_cents: 1200000,
          state: 'SP',
          city: 'São Paulo',
        });
      }

      // Special handling for parceiro - create partner
      if (testUser.isPartner) {
        const { data: partnerData } = await supabaseClient
          .from('credit_repair_partners')
          .insert({
            company_name: 'Parceiro Teste LTDA',
            trade_name: 'Parceiro Teste',
            contact_person: testUser.full_name,
            email: testUser.email,
            phone: '(11) 99999-9999',
            commission_percent: 15,
            is_active: true,
            status: 'active',
          })
          .select()
          .single();

        if (partnerData) {
          await supabaseClient
            .from('credit_repair_partner_users')
            .insert({
              partner_id: partnerData.id,
              user_id: userId,
              role: 'admin',
              is_primary: true,
            });
        }
      }

      // Return generated password so admin can set it up properly
      results.push({ 
        email: testUser.email, 
        status: "created", 
        userId,
        tempPassword: testUser.password // Admin will need to communicate this securely
      });
    }

    console.log(`create-test-users completed: ${results.length} users processed`);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error('create-test-users error:', error);
    return new Response(JSON.stringify({ error: "An internal error occurred" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
