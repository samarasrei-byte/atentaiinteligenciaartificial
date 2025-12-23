-- Create table for financial goals for autonomous workers
CREATE TABLE public.autonomo_financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL DEFAULT 'revenue', -- revenue, savings, tax_reduction
  target_value_cents BIGINT NOT NULL,
  current_value_cents BIGINT NOT NULL DEFAULT 0,
  target_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.autonomo_financial_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Block anonymous access to autonomo_financial_goals"
ON public.autonomo_financial_goals
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own goals"
ON public.autonomo_financial_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.autonomo_financial_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.autonomo_financial_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.autonomo_financial_goals
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_autonomo_financial_goals_updated_at
BEFORE UPDATE ON public.autonomo_financial_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();