-- =============================================
-- MÓDULO FINANCEIRO - TABELAS COMPLEMENTARES
-- =============================================

-- 1. Tabela de Regras de Divisão (Split Rules) - se não existir
CREATE TABLE IF NOT EXISTS public.financial_split_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  service_category text NOT NULL,
  percentage numeric(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_until date,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Tabela de Receitas Consolidadas
CREATE TABLE IF NOT EXISTS public.financial_revenues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  service_slug text NOT NULL,
  plan_name text,
  revenue_type text NOT NULL DEFAULT 'one_time',
  amount_cents bigint NOT NULL DEFAULT 0,
  revenue_date date NOT NULL DEFAULT CURRENT_DATE,
  source text NOT NULL DEFAULT 'admin',
  stripe_payment_id text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Adicionar colunas à financial_costs
ALTER TABLE public.financial_costs 
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'operational',
  ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_period text;

-- 4. Adicionar colunas à financial_partners se não existirem
ALTER TABLE public.financial_partners 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- 5. Enable RLS
ALTER TABLE public.financial_split_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_revenues ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Admins can manage split rules" ON public.financial_split_rules;
CREATE POLICY "Admins can manage split rules"
ON public.financial_split_rules FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage financial revenues" ON public.financial_revenues;
CREATE POLICY "Admins can manage financial revenues"
ON public.financial_revenues FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 7. Função para calcular divisão societária
CREATE OR REPLACE FUNCTION public.calculate_partner_share(
  p_service_category text,
  p_amount_cents bigint,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  partner_id uuid,
  partner_name text,
  percentage numeric,
  share_cents bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fp.id,
    fp.name,
    fsr.percentage,
    ROUND((p_amount_cents * fsr.percentage / 100))::bigint
  FROM public.financial_partners fp
  JOIN public.financial_split_rules fsr ON fsr.partner_id = fp.id
  WHERE fsr.service_category = p_service_category
    AND fsr.is_active = true
    AND fsr.effective_from <= p_date
    AND (fsr.effective_until IS NULL OR fsr.effective_until >= p_date)
  ORDER BY fp.display_order;
END;
$$;

-- 8. Triggers
DROP TRIGGER IF EXISTS update_financial_split_rules_updated_at ON public.financial_split_rules;
CREATE TRIGGER update_financial_split_rules_updated_at
  BEFORE UPDATE ON public.financial_split_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_revenues_updated_at ON public.financial_revenues;
CREATE TRIGGER update_financial_revenues_updated_at
  BEFORE UPDATE ON public.financial_revenues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();