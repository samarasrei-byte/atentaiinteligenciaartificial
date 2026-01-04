-- Create fiscal analysis requests table
CREATE TABLE public.fiscal_analysis_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  partner_id UUID REFERENCES public.credit_repair_partners(id),
  
  -- Client info (for guests)
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  
  -- Company info
  cnpj TEXT NOT NULL,
  company_name TEXT NOT NULL,
  tax_regime TEXT NOT NULL, -- simples_nacional, lucro_presumido, lucro_real
  cnae_code TEXT,
  annual_revenue_cents BIGINT DEFAULT 0,
  
  -- Analysis details
  guide_type TEXT, -- das, darf, etc.
  guide_value_cents BIGINT DEFAULT 0,
  guide_document_url TEXT,
  analysis_period_start DATE,
  analysis_period_end DATE,
  notes TEXT,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending', -- pending, analyzing, risk_detected, approved, report_ready, payment_pending, completed, cancelled
  risk_detected BOOLEAN DEFAULT false,
  risk_description TEXT,
  
  -- Results
  identified_value_cents BIGINT DEFAULT 0,
  service_fee_cents BIGINT DEFAULT 0, -- 50% of identified value
  report_url TEXT,
  new_guide_url TEXT,
  
  -- Payment
  payment_status TEXT DEFAULT 'pending', -- pending, paid
  stripe_session_id TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Contador/Admin who processed
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fiscal_analysis_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own fiscal requests"
ON public.fiscal_analysis_requests
FOR SELECT
USING (
  user_id = auth.uid() OR
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Users can create fiscal requests"
ON public.fiscal_analysis_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all fiscal requests"
ON public.fiscal_analysis_requests
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update fiscal requests"
ON public.fiscal_analysis_requests
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Partners can view assigned fiscal requests"
ON public.fiscal_analysis_requests
FOR SELECT
USING (
  partner_id IN (
    SELECT partner_id FROM public.credit_repair_partner_users WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Partners can update assigned fiscal requests"
ON public.fiscal_analysis_requests
FOR UPDATE
USING (
  partner_id IN (
    SELECT partner_id FROM public.credit_repair_partner_users WHERE user_id = auth.uid()
  )
);

-- Updated at trigger
CREATE TRIGGER update_fiscal_analysis_requests_updated_at
BEFORE UPDATE ON public.fiscal_analysis_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.fiscal_analysis_requests;

-- Create storage bucket for fiscal documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('fiscal-documents', 'fiscal-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for fiscal documents
CREATE POLICY "Users can upload fiscal documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fiscal-documents');

CREATE POLICY "Users can view their own fiscal documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'fiscal-documents' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR
   EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'contador')))
);

CREATE POLICY "Admins can manage fiscal documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'fiscal-documents' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);