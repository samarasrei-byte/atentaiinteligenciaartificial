-- Add explicit policies to block anonymous access to sensitive tables

-- profiles: Add explicit check for authenticated users
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
USING (auth.uid() IS NOT NULL);

-- companies: Block anonymous access
DROP POLICY IF EXISTS "Block anonymous access to companies" ON public.companies;
CREATE POLICY "Block anonymous access to companies"
ON public.companies
FOR ALL
USING (auth.uid() IS NOT NULL);

-- consultations: Block anonymous access
DROP POLICY IF EXISTS "Block anonymous access to consultations" ON public.consultations;
CREATE POLICY "Block anonymous access to consultations"
ON public.consultations
FOR ALL
USING (auth.uid() IS NOT NULL);

-- payments: Block anonymous access
DROP POLICY IF EXISTS "Block anonymous access to payments" ON public.payments;
CREATE POLICY "Block anonymous access to payments"
ON public.payments
FOR ALL
USING (auth.uid() IS NOT NULL);

-- subscriptions: Block anonymous access
DROP POLICY IF EXISTS "Block anonymous access to subscriptions" ON public.subscriptions;
CREATE POLICY "Block anonymous access to subscriptions"
ON public.subscriptions
FOR ALL
USING (auth.uid() IS NOT NULL);

-- ai_chat_messages: Block anonymous access
DROP POLICY IF EXISTS "Block anonymous access to ai_chat_messages" ON public.ai_chat_messages;
CREATE POLICY "Block anonymous access to ai_chat_messages"
ON public.ai_chat_messages
FOR ALL
USING (auth.uid() IS NOT NULL);

-- tax_simulations: Block anonymous access
DROP POLICY IF EXISTS "Block anonymous access to tax_simulations" ON public.tax_simulations;
CREATE POLICY "Block anonymous access to tax_simulations"
ON public.tax_simulations
FOR ALL
USING (auth.uid() IS NOT NULL);

-- daily_question_usage: Block anonymous access
DROP POLICY IF EXISTS "Block anonymous access to daily_question_usage" ON public.daily_question_usage;
CREATE POLICY "Block anonymous access to daily_question_usage"
ON public.daily_question_usage
FOR ALL
USING (auth.uid() IS NOT NULL);

-- user_roles: Block anonymous access
DROP POLICY IF EXISTS "Block anonymous access to user_roles" ON public.user_roles;
CREATE POLICY "Block anonymous access to user_roles"
ON public.user_roles
FOR ALL
USING (auth.uid() IS NOT NULL);