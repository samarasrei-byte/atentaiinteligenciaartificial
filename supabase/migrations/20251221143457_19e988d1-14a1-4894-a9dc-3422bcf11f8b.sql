-- Create company type enum
CREATE TYPE public.company_type AS ENUM (
  'mei',
  'me', 
  'epp',
  'ltda',
  'eireli',
  'sa_fechada',
  'sa_aberta',
  'cooperativa'
);

-- Create tax regime enum
CREATE TYPE public.tax_regime AS ENUM (
  'simples_nacional',
  'lucro_presumido',
  'lucro_real',
  'lucro_arbitrado'
);

-- Create sector enum
CREATE TYPE public.company_sector AS ENUM (
  'comercio',
  'servicos',
  'industria',
  'agronegocio',
  'tecnologia',
  'saude',
  'educacao',
  'construcao',
  'transporte',
  'alimentacao',
  'outro'
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Basic Info
  company_name TEXT NOT NULL,
  trade_name TEXT,
  cnpj TEXT,
  
  -- Type and Regime
  company_type public.company_type NOT NULL,
  tax_regime public.tax_regime NOT NULL,
  sector public.company_sector NOT NULL,
  
  -- Financial Info
  monthly_revenue_cents BIGINT NOT NULL DEFAULT 0,
  annual_revenue_cents BIGINT NOT NULL DEFAULT 0,
  employee_count INTEGER NOT NULL DEFAULT 0,
  
  -- Address
  state TEXT,
  city TEXT,
  
  -- Details
  main_activity TEXT,
  secondary_activities TEXT[],
  foundation_date DATE,
  
  -- Status
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own company"
ON public.companies
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company"
ON public.companies
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company"
ON public.companies
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all companies"
ON public.companies
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();