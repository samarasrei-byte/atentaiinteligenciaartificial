
-- ============================================
-- FIX: Add SELECT policies for 'contador' role
-- on all tables used by César's BI Dashboard
-- ============================================

-- 1. payments - BI Dashboard reads payment data for revenue stats
CREATE POLICY "Contador can view all payments for BI"
ON public.payments FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'contador'::app_role));

-- 2. subscriptions - BI Dashboard reads subscription counts
CREATE POLICY "Contador can view all subscriptions for BI"
ON public.subscriptions FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'contador'::app_role));

-- 3. financial_costs - BI Dashboard reads expense data
CREATE POLICY "Contador can view financial costs"
ON public.financial_costs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'contador'::app_role));

-- 4. financial_revenues - BI Dashboard reads revenue data
CREATE POLICY "Contador can view financial revenues"
ON public.financial_revenues FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'contador'::app_role));

-- 5. fiscal_analysis_requests - BI Inbox shows fiscal requests
CREATE POLICY "Contador can view all fiscal requests for BI"
ON public.fiscal_analysis_requests FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'contador'::app_role));

-- 6. ir_requests - BI Inbox shows IR requests (existing policy only shows assigned)
CREATE POLICY "Contador can view all IR requests for BI"
ON public.ir_requests FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'contador'::app_role));

-- 7. certificate_requests - BI Inbox shows certificate requests
CREATE POLICY "Contador can view all certificate requests for BI"
ON public.certificate_requests FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'contador'::app_role));

-- 8. company_opening_requests - BI Inbox shows company opening requests
CREATE POLICY "Contador can view all company opening requests for BI"
ON public.company_opening_requests FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'contador'::app_role));

-- 9. credit_repair_requests - BI Dashboard counts for service distribution
CREATE POLICY "Contador can view all credit repair requests for BI"
ON public.credit_repair_requests FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'contador'::app_role));
