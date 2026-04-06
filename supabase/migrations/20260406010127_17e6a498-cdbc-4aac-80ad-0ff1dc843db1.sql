-- Remove duplicate SELECT policies on user_roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;

-- Remove duplicate equipe_guilherme policies on credit_repair_requests
DROP POLICY IF EXISTS "equipe_guilherme can view credit repair requests" ON public.credit_repair_requests;
DROP POLICY IF EXISTS "equipe_guilherme can update credit repair requests" ON public.credit_repair_requests;

-- Remove duplicate equipe_guilherme policies on fiscal_analysis_requests
DROP POLICY IF EXISTS "equipe_guilherme can view fiscal analysis requests" ON public.fiscal_analysis_requests;
DROP POLICY IF EXISTS "equipe_guilherme can update fiscal analysis requests" ON public.fiscal_analysis_requests;

-- Remove no-op PERMISSIVE 'Block anonymous' policies (they don't actually block anything)
DROP POLICY IF EXISTS "Block anonymous access to ai_chat_messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Block anonymous access to autonomo_financial_goals" ON public.autonomo_financial_goals;
DROP POLICY IF EXISTS "Block anonymous access to autonomo_profiles" ON public.autonomo_profiles;
DROP POLICY IF EXISTS "Block anonymous access to autonomos_simulations" ON public.autonomos_simulations;
DROP POLICY IF EXISTS "Block anonymous access to payments" ON public.payments;
DROP POLICY IF EXISTS "Block anonymous access to subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Block anonymous access to service_notifications" ON public.service_notifications;
DROP POLICY IF EXISTS "Block anonymous access to support_messages" ON public.support_messages;
DROP POLICY IF EXISTS "Block anonymous access to support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Block anonymous access to tax_autopilot" ON public.tax_autopilot;
DROP POLICY IF EXISTS "Block anonymous access to tax_autopilot_alerts" ON public.tax_autopilot_alerts;
DROP POLICY IF EXISTS "Block anonymous access to tax_simulations" ON public.tax_simulations;
DROP POLICY IF EXISTS "Block anonymous access to partner_withdrawal_requests" ON public.partner_withdrawal_requests;

-- Remove duplicate INSERT on affiliate_coupon_uses
DROP POLICY IF EXISTS "Users can insert own coupon uses" ON public.affiliate_coupon_uses;