-- Tabela de empresas parceiras Limpa Nome
CREATE TABLE public.credit_repair_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  trade_name TEXT,
  cnpj TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  contact_person TEXT NOT NULL,
  commission_percent NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  status TEXT NOT NULL DEFAULT 'pending',
  is_active BOOLEAN NOT NULL DEFAULT false,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_revenue_cents BIGINT NOT NULL DEFAULT 0,
  stripe_account_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de usuários das empresas parceiras
CREATE TABLE public.credit_repair_partner_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.credit_repair_partners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partner_id, user_id)
);

-- Adicionar partner_id à tabela de credit_repair_requests
ALTER TABLE public.credit_repair_requests
ADD COLUMN partner_id UUID REFERENCES public.credit_repair_partners(id);

-- Enable RLS
ALTER TABLE public.credit_repair_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_repair_partner_users ENABLE ROW LEVEL SECURITY;

-- Policies para credit_repair_partners
CREATE POLICY "Block anonymous access to credit_repair_partners"
ON public.credit_repair_partners FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all partners"
ON public.credit_repair_partners FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partner users can view their partner"
ON public.credit_repair_partners FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.credit_repair_partner_users pu
    WHERE pu.partner_id = id AND pu.user_id = auth.uid()
  )
);

CREATE POLICY "Primary partner users can update their partner"
ON public.credit_repair_partners FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.credit_repair_partner_users pu
    WHERE pu.partner_id = id AND pu.user_id = auth.uid() AND pu.is_primary = true
  )
);

-- Policies para credit_repair_partner_users
CREATE POLICY "Block anonymous access to credit_repair_partner_users"
ON public.credit_repair_partner_users FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all partner users"
ON public.credit_repair_partner_users FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own partner user record"
ON public.credit_repair_partner_users FOR SELECT
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_credit_repair_partners_updated_at
BEFORE UPDATE ON public.credit_repair_partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_repair_partners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_repair_partner_users;