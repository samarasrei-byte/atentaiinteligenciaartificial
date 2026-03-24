
-- NF Customers table
CREATE TABLE public.nf_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  cpf_cnpj TEXT,
  phone TEXT,
  asaas_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NF Charges table
CREATE TABLE public.nf_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.nf_customers(id) ON DELETE CASCADE,
  asaas_charge_id TEXT,
  value_cents BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  billing_type TEXT NOT NULL DEFAULT 'PIX',
  description TEXT,
  due_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '3 days',
  invoice_issued BOOLEAN NOT NULL DEFAULT false,
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  boleto_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NF Invoices table
CREATE TABLE public.nf_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id UUID NOT NULL REFERENCES public.nf_charges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asaas_invoice_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  pdf_url TEXT,
  service_description TEXT,
  value_cents BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NF Webhook logs (idempotency)
CREATE TABLE public.nf_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  payload JSONB,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_type, payment_id)
);

-- Enable RLS
ALTER TABLE public.nf_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nf_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nf_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nf_webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nf_customers
CREATE POLICY "Users can view own customers" ON public.nf_customers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own customers" ON public.nf_customers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own customers" ON public.nf_customers FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- RLS Policies for nf_charges
CREATE POLICY "Users can view own charges" ON public.nf_charges FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own charges" ON public.nf_charges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own charges" ON public.nf_charges FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- RLS Policies for nf_invoices
CREATE POLICY "Users can view own invoices" ON public.nf_invoices FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own invoices" ON public.nf_invoices FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Webhook logs: service role only (no user access needed)
CREATE POLICY "Service role can manage webhook logs" ON public.nf_webhook_logs FOR ALL TO service_role USING (true);

-- Updated at triggers
CREATE TRIGGER update_nf_customers_updated_at BEFORE UPDATE ON public.nf_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nf_charges_updated_at BEFORE UPDATE ON public.nf_charges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nf_invoices_updated_at BEFORE UPDATE ON public.nf_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_nf_customers_user_id ON public.nf_customers(user_id);
CREATE INDEX idx_nf_charges_user_id ON public.nf_charges(user_id);
CREATE INDEX idx_nf_charges_customer_id ON public.nf_charges(customer_id);
CREATE INDEX idx_nf_charges_asaas_id ON public.nf_charges(asaas_charge_id);
CREATE INDEX idx_nf_invoices_charge_id ON public.nf_invoices(charge_id);
CREATE INDEX idx_nf_webhook_logs_payment_id ON public.nf_webhook_logs(payment_id);
