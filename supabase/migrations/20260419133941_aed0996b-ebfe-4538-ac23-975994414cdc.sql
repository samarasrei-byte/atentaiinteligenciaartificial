-- Enum para regime tributário PJ
CREATE TYPE public.ir_pj_company_type AS ENUM ('mei', 'simples_nacional', 'lucro_presumido', 'lucro_real');
CREATE TYPE public.ir_pj_risk_level AS ENUM ('baixo', 'medio', 'alto');

-- Tabela principal
CREATE TABLE public.ir_pj_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Step 1
  current_company_type public.ir_pj_company_type NOT NULL,
  base_year INTEGER NOT NULL,
  
  -- Step 2
  annual_revenue_cents BIGINT NOT NULL DEFAULT 0,
  cnae_code TEXT,
  cnae_description TEXT,
  has_payroll BOOLEAN NOT NULL DEFAULT false,
  payroll_monthly_cents BIGINT DEFAULT 0,
  estimated_bank_movement_cents BIGINT DEFAULT 0,
  
  -- Step 3 (checklist)
  documents_checklist JSONB DEFAULT '{}'::jsonb,
  
  -- Step 4 + 5 (output)
  recommended_regime public.ir_pj_company_type,
  recommendation_reason TEXT,
  alternatives JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  malha_fina_score public.ir_pj_risk_level,
  ai_analysis JSONB,
  
  status TEXT NOT NULL DEFAULT 'draft',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ir_pj_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own ir_pj simulations"
ON public.ir_pj_simulations FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own ir_pj simulations"
ON public.ir_pj_simulations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own ir_pj simulations"
ON public.ir_pj_simulations FOR UPDATE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users delete own ir_pj simulations"
ON public.ir_pj_simulations FOR DELETE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_ir_pj_simulations_updated_at
BEFORE UPDATE ON public.ir_pj_simulations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_ir_pj_simulations_user ON public.ir_pj_simulations(user_id, created_at DESC);