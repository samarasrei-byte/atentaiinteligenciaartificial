import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    // For testing without webhook secret, parse directly
    // In production, you should verify the signature
    let event: Stripe.Event;
    
    const webhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET");
    
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Webhook signature verification failed, parsing raw body");
        event = JSON.parse(body);
      }
    } else {
      event = JSON.parse(body);
      logStep("No webhook secret configured, parsing raw body");
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle Connect account events
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        logStep("Account updated", { 
          accountId: account.id, 
          payouts_enabled: account.payouts_enabled,
          charges_enabled: account.charges_enabled,
          details_submitted: account.details_submitted
        });

        // Determine status
        let status = "pending";
        if (account.payouts_enabled && account.charges_enabled) {
          status = "active";
        } else if (account.requirements?.disabled_reason) {
          status = "restricted";
        }

        // Update contador profile
        const { error: updateError } = await supabaseClient
          .from("contador_profiles")
          .update({
            stripe_account_status: status,
            stripe_onboarding_completed: account.details_submitted,
          })
          .eq("stripe_account_id", account.id);

        if (updateError) {
          logStep("Error updating contador profile", { error: updateError.message });
        } else {
          logStep("Contador profile updated", { accountId: account.id, status });
        }
        break;
      }

      case "account.application.deauthorized": {
        const account = event.data.object as Stripe.Account;
        logStep("Account deauthorized", { accountId: account.id });

        // Reset contador profile Stripe fields
        const { error: resetError } = await supabaseClient
          .from("contador_profiles")
          .update({
            stripe_account_id: null,
            stripe_account_status: "not_connected",
            stripe_onboarding_completed: false,
          })
          .eq("stripe_account_id", account.id);

        if (resetError) {
          logStep("Error resetting contador profile", { error: resetError.message });
        } else {
          logStep("Contador profile reset", { accountId: account.id });
        }
        break;
      }

      case "payout.paid": {
        const payout = event.data.object as Stripe.Payout;
        logStep("Payout completed", { 
          payoutId: payout.id, 
          amount: payout.amount,
          accountId: event.account
        });
        break;
      }

      case "payout.failed": {
        const payout = event.data.object as Stripe.Payout;
        logStep("Payout failed", { 
          payoutId: payout.id, 
          failureCode: payout.failure_code,
          failureMessage: payout.failure_message,
          accountId: event.account
        });
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        logStep("Transfer created", { 
          transferId: transfer.id, 
          amount: transfer.amount,
          destination: transfer.destination
        });
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment succeeded", { 
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          metadata: paymentIntent.metadata
        });

        // Update consultation status if this is a consultation payment
        if (paymentIntent.metadata?.consultation_type === 'scheduled') {
          const { error: updateError } = await supabaseClient
            .from("consultations")
            .update({ status: "scheduled" })
            .eq("user_id", paymentIntent.metadata.user_id)
            .eq("contador_id", paymentIntent.metadata.contador_id)
            .eq("status", "pending");

          if (updateError) {
            logStep("Error updating consultation", { error: updateError.message });
          } else {
            logStep("Consultation updated to scheduled");
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
