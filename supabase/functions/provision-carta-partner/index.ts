import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARTNER_EMAIL = "parceiro@atentai.com.br";
const PARTNER_PASSWORD = "Atentaí2026";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Idempotent: try to find; else create
    const { data: found } = await admin.auth.admin.getUserByEmail(PARTNER_EMAIL);
    let userId = found?.user?.id;

    if (!userId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: PARTNER_EMAIL,
        password: PARTNER_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "Parceiro Validador Cartas" },
      });
      if (createErr) throw createErr;
      userId = created.user?.id;
    } else {
      // Ensure password is the expected one (reset every time we provision to keep in sync)
      await admin.auth.admin.updateUserById(userId, { password: PARTNER_PASSWORD, email_confirm: true });
    }

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("provision-carta-partner error:", error);
    return new Response(JSON.stringify({ error: String(error?.message ?? error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
