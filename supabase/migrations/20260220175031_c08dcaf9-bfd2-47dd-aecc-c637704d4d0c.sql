
-- Allow equipe_guilherme to SELECT credit_repair_requests
CREATE POLICY "equipe_guilherme can view credit repair requests"
ON public.credit_repair_requests
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

-- Allow equipe_guilherme to UPDATE credit_repair_requests
CREATE POLICY "equipe_guilherme can update credit repair requests"
ON public.credit_repair_requests
FOR UPDATE
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

-- Allow equipe_guilherme to SELECT credit_repair_history
CREATE POLICY "equipe_guilherme can view credit repair history"
ON public.credit_repair_history
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

-- Allow equipe_guilherme to INSERT credit_repair_history
CREATE POLICY "equipe_guilherme can insert credit repair history"
ON public.credit_repair_history
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'equipe_guilherme'::app_role));

-- Allow equipe_guilherme to SELECT fiscal_analysis_requests
CREATE POLICY "equipe_guilherme can view fiscal analysis requests"
ON public.fiscal_analysis_requests
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

-- Allow equipe_guilherme to UPDATE fiscal_analysis_requests
CREATE POLICY "equipe_guilherme can update fiscal analysis requests"
ON public.fiscal_analysis_requests
FOR UPDATE
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

-- Allow equipe_guilherme to SELECT financial tables
CREATE POLICY "equipe_guilherme can view financial costs"
ON public.financial_costs
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

CREATE POLICY "equipe_guilherme can view financial revenues"
ON public.financial_revenues
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

CREATE POLICY "equipe_guilherme can view payments"
ON public.payments
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

CREATE POLICY "equipe_guilherme can view subscriptions"
ON public.subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

CREATE POLICY "equipe_guilherme can view financial partners"
ON public.financial_partners
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

CREATE POLICY "equipe_guilherme can view financial split rules"
ON public.financial_split_rules
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

-- Allow equipe_guilherme to SELECT profiles (for names)
CREATE POLICY "equipe_guilherme can view profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

-- Allow equipe_guilherme to SELECT company_opening_documents
CREATE POLICY "equipe_guilherme can view documents"
ON public.company_opening_documents
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

-- Allow equipe_guilherme to SELECT consultations (for metrics)
CREATE POLICY "equipe_guilherme can view consultations"
ON public.consultations
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));

-- Allow equipe_guilherme to SELECT credit_repair_partners (for metrics)
CREATE POLICY "equipe_guilherme can view partners"
ON public.credit_repair_partners
FOR SELECT
USING (has_role(auth.uid(), 'equipe_guilherme'::app_role));
