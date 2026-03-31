
-- 1. Fix audit_logs: drop bypassable service_role policy, replace with admin-only
DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.audit_logs;

CREATE POLICY "Admins can manage audit logs"
ON public.audit_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Fix financial_partners: add RESTRICTIVE policy blocking non-authenticated access
ALTER TABLE public.financial_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block anonymous access to financial_partners"
ON public.financial_partners
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- 3. Add INSERT policy for ir_ai_declarations
CREATE POLICY "Users can insert own IR declarations"
ON public.ir_ai_declarations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
