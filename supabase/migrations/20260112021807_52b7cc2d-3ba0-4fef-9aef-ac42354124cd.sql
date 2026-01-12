
-- Affiliates table
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  state TEXT,
  company_name TEXT,
  affiliate_code TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  whatsapp_number TEXT,
  pix_key TEXT,
  pix_key_type TEXT,
  bank_name TEXT,
  bank_agency TEXT,
  bank_account TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate services (which services affiliate can sell)
CREATE TABLE public.affiliate_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  benefits TEXT[],
  commission_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  base_price_cents INTEGER,
  is_active BOOLEAN DEFAULT true,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate-Service activation (which services each affiliate has enabled)
CREATE TABLE public.affiliate_service_activations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.affiliate_services(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(affiliate_id, service_id)
);

-- Affiliate leads
CREATE TABLE public.affiliate_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.affiliate_services(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  cnpj TEXT,
  tax_regime TEXT,
  annual_revenue_cents BIGINT,
  state TEXT,
  segment TEXT,
  has_restrictions BOOLEAN,
  has_audited_before BOOLEAN,
  status TEXT NOT NULL DEFAULT 'new',
  potential_value_cents BIGINT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  notes TEXT,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate commissions
CREATE TABLE public.affiliate_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.affiliate_leads(id),
  service_id UUID REFERENCES public.affiliate_services(id),
  total_value_cents INTEGER NOT NULL,
  affiliate_value_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate withdrawals
CREATE TABLE public.affiliate_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  net_amount_cents INTEGER NOT NULL,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_service_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliates
CREATE POLICY "Users can view their own affiliate profile"
  ON public.affiliates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate profile"
  ON public.affiliates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create affiliate profile"
  ON public.affiliates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliates"
  ON public.affiliates FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all affiliates"
  ON public.affiliates FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for services (public read)
CREATE POLICY "Anyone can view active services"
  ON public.affiliate_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON public.affiliate_services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for service activations
CREATE POLICY "Affiliates can view their activations"
  ON public.affiliate_service_activations FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can manage their activations"
  ON public.affiliate_service_activations FOR ALL
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- RLS Policies for leads
CREATE POLICY "Affiliates can view their leads"
  ON public.affiliate_leads FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can create leads"
  ON public.affiliate_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
  ON public.affiliate_leads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all leads"
  ON public.affiliate_leads FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for commissions
CREATE POLICY "Affiliates can view their commissions"
  ON public.affiliate_commissions FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all commissions"
  ON public.affiliate_commissions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for withdrawals
CREATE POLICY "Affiliates can view their withdrawals"
  ON public.affiliate_withdrawals FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can create withdrawals"
  ON public.affiliate_withdrawals FOR INSERT
  WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all withdrawals"
  ON public.affiliate_withdrawals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add affiliate role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'affiliate';

-- Insert default services
INSERT INTO public.affiliate_services (name, slug, description, benefits, commission_percent, icon) VALUES
('Limpa Nome Empresarial', 'limpa-nome', 'Regularização de pendências fiscais e restrições empresariais', ARRAY['Remoção de protestos', 'Regularização de débitos', 'Limpeza de score empresarial'], 15.00, 'Shield'),
('Inteligência Fiscal', 'inteligencia-fiscal', 'Análise avançada de dados fiscais com IA', ARRAY['Identificação de oportunidades', 'Redução de riscos', 'Otimização tributária'], 12.00, 'Brain'),
('Recuperação Tributária', 'recuperacao-tributaria', 'Recuperação de créditos e impostos pagos indevidamente', ARRAY['Análise de 5 anos retroativos', 'Identificação de créditos', 'Recuperação administrativa'], 20.00, 'TrendingUp'),
('Auditoria Fiscal Completa', 'auditoria-fiscal', 'Revisão completa de toda estrutura fiscal da empresa', ARRAY['Análise de conformidade', 'Identificação de riscos', 'Relatório detalhado'], 18.00, 'FileSearch'),
('Regularização Fiscal', 'regularizacao-fiscal', 'Regularização de pendências junto aos órgãos fiscais', ARRAY['Parcelamento de débitos', 'Negociação com fisco', 'Acompanhamento processual'], 12.00, 'FileCheck'),
('Planejamento Tributário', 'planejamento-tributario', 'Estruturação fiscal otimizada para sua empresa', ARRAY['Análise de regime', 'Simulações comparativas', 'Plano de ação'], 15.00, 'Calculator'),
('Recuperação de Créditos INSS', 'recuperacao-inss', 'Recuperação de contribuições previdenciárias pagas a maior', ARRAY['Análise de folha', 'Identificação de créditos', 'Recuperação administrativa'], 18.00, 'Wallet'),
('Consultoria Empresarial', 'consultoria-empresarial', 'Consultoria estratégica para gestão fiscal', ARRAY['Análise personalizada', 'Suporte contínuo', 'Estratégias de crescimento'], 10.00, 'Users'),
('Análise de Risco Fiscal', 'analise-risco', 'Avaliação completa de riscos tributários', ARRAY['Mapeamento de riscos', 'Plano de mitigação', 'Monitoramento contínuo'], 12.00, 'AlertTriangle'),
('BPO Financeiro', 'bpo-financeiro', 'Terceirização completa do departamento financeiro', ARRAY['Gestão de contas', 'Relatórios gerenciais', 'Controle de fluxo'], 10.00, 'Building');

-- Create triggers for updated_at
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_services_updated_at
  BEFORE UPDATE ON public.affiliate_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_leads_updated_at
  BEFORE UPDATE ON public.affiliate_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_commissions_updated_at
  BEFORE UPDATE ON public.affiliate_commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_withdrawals_updated_at
  BEFORE UPDATE ON public.affiliate_withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
