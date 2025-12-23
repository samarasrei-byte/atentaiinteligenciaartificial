-- Create table for autonomous professional simulations history
CREATE TABLE public.autonomos_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profession TEXT NOT NULL,
  profession_category TEXT NOT NULL,
  monthly_revenue_cents BIGINT NOT NULL,
  monthly_expenses_cents BIGINT NOT NULL DEFAULT 0,
  state TEXT NOT NULL,
  city TEXT,
  recommendation TEXT NOT NULL,
  pf_tax_cents BIGINT NOT NULL,
  mei_tax_cents BIGINT,
  me_simples_tax_cents BIGINT,
  lucro_presumido_tax_cents BIGINT,
  annual_savings_cents BIGINT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.autonomos_simulations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Block anonymous access to autonomos_simulations"
ON public.autonomos_simulations
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own simulations"
ON public.autonomos_simulations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own simulations"
ON public.autonomos_simulations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own simulations"
ON public.autonomos_simulations
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_autonomos_simulations_user_id ON public.autonomos_simulations(user_id);
CREATE INDEX idx_autonomos_simulations_created_at ON public.autonomos_simulations(created_at DESC);