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
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const adminUser = userData.user;
    if (!adminUser?.email) throw new Error("User not authenticated");
    logStep("Admin user authenticated", { userId: adminUser.id });

    // Check if admin
    const { data: roleData, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: adminUser.id, _role: 'admin' });

    if (roleError || !roleData) {
      throw new Error("Unauthorized: Admin role required");
    }
    logStep("Admin role verified");

    const { email, password, full_name, partner_id, role, is_primary } = await req.json();

    if (!email || !password || !full_name || !partner_id) {
      throw new Error("Missing required fields: email, password, full_name, partner_id");
    }

    // Create user with Supabase Auth
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) throw new Error(`Error creating user: ${createError.message}`);
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

    if (linkError) throw new Error(`Error linking user to partner: ${linkError.message}`);
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
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
