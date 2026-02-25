
-- ============================================
-- CAPASSI MULTI-TENANT SCHEMA
-- ============================================

-- ENUMS
CREATE TYPE public.capassi_org_type AS ENUM ('single', 'franchise', 'matriz');
CREATE TYPE public.capassi_company_type AS ENUM ('matriz', 'filial');
CREATE TYPE public.capassi_membership_role AS ENUM ('super_admin', 'org_admin', 'branch_admin', 'viewer');
CREATE TYPE public.capassi_transaction_type AS ENUM ('receita', 'despesa');
CREATE TYPE public.capassi_transaction_category AS ENUM ('vendas', 'servicos', 'recorrente', 'outros_receita', 'pessoal', 'marketing', 'tecnologia', 'infraestrutura', 'impostos', 'financeiro', 'administrativo', 'outros_despesa');
CREATE TYPE public.capassi_transaction_status AS ENUM ('pago', 'pendente', 'atrasado', 'cancelado');
CREATE TYPE public.capassi_payment_method AS ENUM ('pix', 'boleto', 'cartao_credito', 'cartao_debito', 'transferencia', 'dinheiro');
CREATE TYPE public.capassi_recurrence AS ENUM ('unico', 'mensal', 'trimestral', 'anual');
CREATE TYPE public.capassi_client_segment AS ENUM ('tecnologia', 'varejo', 'servicos', 'industria', 'saude', 'educacao', 'financeiro', 'construcao', 'agronegocio', 'outros');
CREATE TYPE public.capassi_client_status AS ENUM ('ativo', 'inativo');
CREATE TYPE public.capassi_alert_severity AS ENUM ('critico', 'alto', 'medio', 'baixo');
CREATE TYPE public.capassi_alert_category AS ENUM ('fluxo_caixa', 'inadimplencia', 'margem', 'orcamento', 'liquidez', 'endividamento');
CREATE TYPE public.capassi_br_state AS ENUM ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO');

-- ============================================
-- 1. ORGANIZATIONS
-- ============================================
CREATE TABLE public.capassi_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.capassi_org_type NOT NULL DEFAULT 'single',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capassi_organizations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. COMPANIES
-- ============================================
CREATE TABLE public.capassi_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.capassi_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  type public.capassi_company_type NOT NULL DEFAULT 'filial',
  segment TEXT,
  city TEXT,
  state public.capassi_br_state,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capassi_companies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. MEMBERSHIPS
-- ============================================
CREATE TABLE public.capassi_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.capassi_organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.capassi_companies(id) ON DELETE SET NULL,
  role public.capassi_membership_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id, company_id)
);
ALTER TABLE public.capassi_memberships ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. TRANSACTIONS
-- ============================================
CREATE TABLE public.capassi_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.capassi_organizations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.capassi_companies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount_cents BIGINT NOT NULL DEFAULT 0,
  type public.capassi_transaction_type NOT NULL,
  category public.capassi_transaction_category NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.capassi_transaction_status NOT NULL DEFAULT 'pendente',
  payment_method public.capassi_payment_method,
  recurrence public.capassi_recurrence NOT NULL DEFAULT 'unico',
  client_supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capassi_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CLIENTS
-- ============================================
CREATE TABLE public.capassi_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.capassi_organizations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.capassi_companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  segment public.capassi_client_segment,
  status public.capassi_client_status NOT NULL DEFAULT 'ativo',
  city TEXT,
  state TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capassi_clients ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. FINANCIAL ALERTS
-- ============================================
CREATE TABLE public.capassi_financial_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.capassi_organizations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.capassi_companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity public.capassi_alert_severity NOT NULL,
  category public.capassi_alert_category NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_required BOOLEAN NOT NULL DEFAULT false,
  related_amount_cents BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capassi_financial_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. BUDGET GOALS
-- ============================================
CREATE TABLE public.capassi_budget_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.capassi_organizations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.capassi_companies(id) ON DELETE CASCADE,
  category public.capassi_transaction_category NOT NULL,
  month TEXT NOT NULL,
  budget_amount_cents BIGINT NOT NULL DEFAULT 0,
  revenue_goal_cents BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, company_id, category, month)
);
ALTER TABLE public.capassi_budget_goals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. AUDIT LOGS
-- ============================================
CREATE TABLE public.capassi_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.capassi_organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.capassi_companies(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capassi_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================

-- Check if user is member of an org
CREATE OR REPLACE FUNCTION public.is_capassi_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.capassi_memberships
    WHERE user_id = _user_id AND organization_id = _org_id
  )
$$;

-- Get all org IDs for a user
CREATE OR REPLACE FUNCTION public.get_capassi_org_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT DISTINCT organization_id FROM public.capassi_memberships WHERE user_id = _user_id
$$;

-- Check if user has master access (equipe_cesar or admin)
CREATE OR REPLACE FUNCTION public.has_capassi_master_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('equipe_cesar', 'admin')
  )
$$;

-- ============================================
-- RLS POLICIES
-- ============================================

-- ORGANIZATIONS
CREATE POLICY "capassi_org_select" ON public.capassi_organizations FOR SELECT TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_org_insert" ON public.capassi_organizations FOR INSERT TO authenticated
  WITH CHECK (public.has_capassi_master_access(auth.uid()) OR auth.uid() = created_by);
CREATE POLICY "capassi_org_update" ON public.capassi_organizations FOR UPDATE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_org_delete" ON public.capassi_organizations FOR DELETE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()));

-- COMPANIES
CREATE POLICY "capassi_company_select" ON public.capassi_companies FOR SELECT TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_company_insert" ON public.capassi_companies FOR INSERT TO authenticated
  WITH CHECK (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_company_update" ON public.capassi_companies FOR UPDATE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_company_delete" ON public.capassi_companies FOR DELETE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()));

-- MEMBERSHIPS
CREATE POLICY "capassi_membership_select" ON public.capassi_memberships FOR SELECT TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_membership_insert" ON public.capassi_memberships FOR INSERT TO authenticated
  WITH CHECK (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_membership_update" ON public.capassi_memberships FOR UPDATE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_membership_delete" ON public.capassi_memberships FOR DELETE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()));

-- TRANSACTIONS
CREATE POLICY "capassi_tx_select" ON public.capassi_transactions FOR SELECT TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_tx_insert" ON public.capassi_transactions FOR INSERT TO authenticated
  WITH CHECK (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_tx_update" ON public.capassi_transactions FOR UPDATE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_tx_delete" ON public.capassi_transactions FOR DELETE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()));

-- CLIENTS
CREATE POLICY "capassi_client_select" ON public.capassi_clients FOR SELECT TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_client_insert" ON public.capassi_clients FOR INSERT TO authenticated
  WITH CHECK (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_client_update" ON public.capassi_clients FOR UPDATE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_client_delete" ON public.capassi_clients FOR DELETE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()));

-- FINANCIAL ALERTS
CREATE POLICY "capassi_alert_select" ON public.capassi_financial_alerts FOR SELECT TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_alert_insert" ON public.capassi_financial_alerts FOR INSERT TO authenticated
  WITH CHECK (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_alert_update" ON public.capassi_financial_alerts FOR UPDATE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));

-- BUDGET GOALS
CREATE POLICY "capassi_budget_select" ON public.capassi_budget_goals FOR SELECT TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_budget_insert" ON public.capassi_budget_goals FOR INSERT TO authenticated
  WITH CHECK (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_budget_update" ON public.capassi_budget_goals FOR UPDATE TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));

-- AUDIT LOGS (read-only for members, full for master)
CREATE POLICY "capassi_audit_select" ON public.capassi_audit_logs FOR SELECT TO authenticated
  USING (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));
CREATE POLICY "capassi_audit_insert" ON public.capassi_audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.has_capassi_master_access(auth.uid()) OR organization_id IN (SELECT public.get_capassi_org_ids(auth.uid())));

-- ============================================
-- TRIGGERS: auto updated_at
-- ============================================
CREATE TRIGGER update_capassi_organizations_updated_at BEFORE UPDATE ON public.capassi_organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capassi_companies_updated_at BEFORE UPDATE ON public.capassi_companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capassi_memberships_updated_at BEFORE UPDATE ON public.capassi_memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capassi_transactions_updated_at BEFORE UPDATE ON public.capassi_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capassi_clients_updated_at BEFORE UPDATE ON public.capassi_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capassi_financial_alerts_updated_at BEFORE UPDATE ON public.capassi_financial_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capassi_budget_goals_updated_at BEFORE UPDATE ON public.capassi_budget_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- AUTO-CREATE MEMBERSHIP ON ORG CREATION
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_create_capassi_membership()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.capassi_memberships (user_id, organization_id, role)
  VALUES (NEW.created_by, NEW.id, 'super_admin');
  RETURN NEW;
END;
$$;

CREATE TRIGGER capassi_auto_membership AFTER INSERT ON public.capassi_organizations
FOR EACH ROW EXECUTE FUNCTION public.auto_create_capassi_membership();

-- INDEXES
CREATE INDEX idx_capassi_companies_org ON public.capassi_companies(organization_id);
CREATE INDEX idx_capassi_memberships_user ON public.capassi_memberships(user_id);
CREATE INDEX idx_capassi_memberships_org ON public.capassi_memberships(organization_id);
CREATE INDEX idx_capassi_transactions_org ON public.capassi_transactions(organization_id);
CREATE INDEX idx_capassi_transactions_company ON public.capassi_transactions(company_id);
CREATE INDEX idx_capassi_transactions_date ON public.capassi_transactions(date);
CREATE INDEX idx_capassi_clients_org ON public.capassi_clients(organization_id);
CREATE INDEX idx_capassi_alerts_org ON public.capassi_financial_alerts(organization_id);
CREATE INDEX idx_capassi_budget_org ON public.capassi_budget_goals(organization_id);
CREATE INDEX idx_capassi_audit_org ON public.capassi_audit_logs(organization_id);
