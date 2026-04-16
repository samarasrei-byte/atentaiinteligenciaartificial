// QA Environment Setup
// One-shot endpoint to provision the test account with admin powers,
// reset its password, confirm its email, and ensure free-test mechanisms exist.
// Safe by design: only acts on the whitelisted QA email.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const QA_EMAIL = "teste@atentai.com.br";
const QA_PASSWORD = "Teste@2026!";
const QA_FULL_NAME = "QA Test User";

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[SETUP-QA] ${step}${details ? " " + JSON.stringify(details) : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    log("Starting QA environment provisioning");

    // 1. Find or create QA user
    const { data: existing } = await admin.auth.admin.getUserByEmail(QA_EMAIL);
    let userId: string;

    if (existing?.user) {
      userId = existing.user.id;
      log("QA user exists, resetting password + confirming email", { userId });
      await admin.auth.admin.updateUserById(userId, {
        password: QA_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: QA_FULL_NAME },
      });
    } else {
      log("QA user not found, creating new");
      const { data: created, error: createErr } = await admin.auth.admin
        .createUser({
          email: QA_EMAIL,
          password: QA_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: QA_FULL_NAME },
        });
      if (createErr || !created.user) {
        throw new Error(`Failed to create QA user: ${createErr?.message}`);
      }
      userId = created.user.id;
    }

    // 2. Ensure profile
    await admin.from("profiles").upsert(
      { user_id: userId, full_name: QA_FULL_NAME, email: QA_EMAIL },
      { onConflict: "user_id" },
    );

    // 3. Ensure roles: admin + user + contador (so user can also see contador panel)
    const roles: Array<"admin" | "user" | "contador"> = ["admin", "user", "contador"];
    for (const role of roles) {
      await admin.from("user_roles").upsert(
        { user_id: userId, role },
        { onConflict: "user_id,role", ignoreDuplicates: true },
      );
    }

    // 4. Free 10-year subscription so the user has full access
    const tenYears = new Date();
    tenYears.setFullYear(tenYears.getFullYear() + 10);
    await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        status: "active",
        plan_type: "premium",
        price_cents: 0,
        current_period_start: new Date().toISOString(),
        current_period_end: tenYears.toISOString(),
      },
      { onConflict: "user_id" },
    );

    // 5. Ensure contador profile exists (so contador panel works)
    await admin.from("contador_profiles").upsert(
      {
        user_id: userId,
        crc_number: "CRC-QA-TEST",
        specialty: "QA - Auditoria UX",
        bio: "Conta de QA com acesso completo (admin + contador + user)",
        hourly_rate_cents: 0,
        available: true,
        rating: 5,
      },
      { onConflict: "user_id" },
    );

    log("QA environment ready", { userId, email: QA_EMAIL });

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Ambiente de QA pronto.",
        credentials: {
          email: QA_EMAIL,
          password: QA_PASSWORD,
          roles: ["admin", "user", "contador"],
        },
        userId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    console.error("[SETUP-QA] error", err);
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
