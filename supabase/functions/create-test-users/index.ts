import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEST_PASSWORD = "guigo2208";

const testUsers = [
  { email: "contadorteste@atentai.com.br", role: "contador", name: "Contador Teste" },
  { email: "autonomoteste@atentai.com.br", role: "autonomo", name: "Autônomo Teste" },
  { email: "empresateste@atentai.com.br", role: "user", name: "Empresa Teste" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results: { email: string; status: string; error?: string }[] = [];

    for (const testUser of testUsers) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === testUser.email);

        let userId: string;

        if (existingUser) {
          userId = existingUser.id;
          results.push({ email: testUser.email, status: "already_exists" });
        } else {
          // Create user with admin API
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: testUser.email,
            password: TEST_PASSWORD,
            email_confirm: true, // Auto-confirm email
            user_metadata: { full_name: testUser.name }
          });

          if (createError) throw createError;
          userId = newUser.user.id;
          results.push({ email: testUser.email, status: "created" });
        }

        // Ensure role exists
        const { data: existingRole } = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("user_id", userId)
          .eq("role", testUser.role)
          .single();

        if (!existingRole) {
          await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: userId, role: testUser.role });
        }

        // Ensure profile exists
        const { data: existingProfile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (!existingProfile) {
          await supabaseAdmin
            .from("profiles")
            .insert({ 
              user_id: userId, 
              full_name: testUser.name,
              email: testUser.email 
            });
        }

        // Create test subscription (NO Stripe IDs = won't be charged!)
        const { data: existingSub } = await supabaseAdmin
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (!existingSub) {
          const futureDate = new Date();
          futureDate.setFullYear(futureDate.getFullYear() + 10); // 10 years from now

          await supabaseAdmin
            .from("subscriptions")
            .insert({
              user_id: userId,
              plan_type: testUser.role === "contador" ? "atentai" : "atentai",
              status: "active",
              price_cents: 0, // FREE - test account
              current_period_start: new Date().toISOString(),
              current_period_end: futureDate.toISOString(),
              // NO stripe_customer_id or stripe_subscription_id = won't be charged!
            });
        }

        // Create specific profile based on role
        if (testUser.role === "autonomo") {
          const { data: existingAutonomo } = await supabaseAdmin
            .from("autonomo_profiles")
            .select("id")
            .eq("user_id", userId)
            .single();

          if (!existingAutonomo) {
            await supabaseAdmin
              .from("autonomo_profiles")
              .insert({
                user_id: userId,
                profession: "Desenvolvedor",
                profession_category: "tecnologia",
                state: "SP",
                city: "São Paulo"
              });
          }
        }

        if (testUser.role === "contador") {
          const { data: existingContador } = await supabaseAdmin
            .from("contador_profiles")
            .select("id")
            .eq("user_id", userId)
            .single();

          if (!existingContador) {
            await supabaseAdmin
              .from("contador_profiles")
              .insert({
                user_id: userId,
                crc_number: "SP-123456",
                specialty: "Tributário",
                bio: "Contador de teste para desenvolvimento",
                available: true,
                hourly_rate_cents: 15000
              });
          }
        }

      } catch (userError: any) {
        results.push({ 
          email: testUser.email, 
          status: "error", 
          error: userError.message 
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error creating test users:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
