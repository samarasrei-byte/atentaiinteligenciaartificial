import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PARTNER-USER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header");
      return new Response(JSON.stringify({ error: "Autenticação necessária" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      logStep("Authentication failed", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Autenticação inválida" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const adminUser = userData.user;
    logStep("Admin user authenticated", { userId: adminUser.id });

    // Check if admin
    const { data: roleData, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: adminUser.id, _role: 'admin' });

    if (roleError || !roleData) {
      logStep("Unauthorized access attempt", { userId: adminUser.id });
      return new Response(JSON.stringify({ error: "Acesso não autorizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }
    logStep("Admin role verified");

    const { email, password, full_name, partner_id, role, is_primary } = await req.json();

    if (!email || !password || !full_name || !partner_id) {
      return new Response(JSON.stringify({ error: "Preencha todos os campos obrigatórios" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create user with Supabase Auth
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) {
      logStep("User creation failed", { error: createError.message });
      // Check for specific error types to provide better UX
      const isEmailTaken = createError.message?.includes('already registered') || 
                           createError.message?.includes('already exists');
      return new Response(JSON.stringify({ 
        error: isEmailTaken ? "Este email já está cadastrado" : "Erro ao criar usuário. Tente novamente." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: isEmailTaken ? 409 : 500,
      });
    }
    logStep("User created", { userId: newUser.user.id });

    // Update profile with full name
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ full_name, email })
      .eq('user_id', newUser.user.id);

    if (profileError) {
      logStep("Profile update error (non-fatal)", { error: profileError.message });
    }

    // Link user to partner
    const { error: linkError } = await supabaseClient
      .from('credit_repair_partner_users')
      .insert({
        partner_id,
        user_id: newUser.user.id,
        role: role || 'operator',
        is_primary: is_primary || false,
      });

    if (linkError) {
      logStep("Failed to link user to partner", { error: linkError.message });
      // User was created but linking failed - this is a partial failure
      return new Response(JSON.stringify({ 
        error: "Usuário criado, mas houve um erro ao vincular ao parceiro. Entre em contato com o suporte.",
        user_id: newUser.user.id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    logStep("User linked to partner", { partnerId: partner_id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user.id,
        message: "User created and linked to partner successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    // Return generic error message to client, keep details in server logs
    return new Response(JSON.stringify({ error: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
