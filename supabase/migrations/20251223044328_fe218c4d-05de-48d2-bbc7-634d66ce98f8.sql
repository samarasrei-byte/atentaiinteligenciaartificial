-- Create table for Tax Autopilot settings and history
CREATE TABLE public.tax_autopilot (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  monthly_revenue_cents BIGINT NOT NULL DEFAULT 0,
  activity_type TEXT NOT NULL DEFAULT 'residential',
  monthly_expenses_cents BIGINT NOT NULL DEFAULT 0,
  current_structure TEXT NOT NULL DEFAULT 'pf',
  accumulated_savings_cents BIGINT NOT NULL DEFAULT 0,
  last_optimization_at TIMESTAMP WITH TIME ZONE,
  last_optimization_description TEXT,
  next_reevaluation_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_autopilot UNIQUE (user_id)
);

-- Create table for autopilot alerts/notifications
CREATE TABLE public.tax_autopilot_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  autopilot_id UUID NOT NULL REFERENCES public.tax_autopilot(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_autopilot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_autopilot_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for tax_autopilot
CREATE POLICY "Users can view their own autopilot settings"
ON public.tax_autopilot FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own autopilot settings"
ON public.tax_autopilot FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own autopilot settings"
ON public.tax_autopilot FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own autopilot settings"
ON public.tax_autopilot FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Block anonymous access to tax_autopilot"
ON public.tax_autopilot FOR ALL
USING (auth.uid() IS NOT NULL);

-- RLS policies for tax_autopilot_alerts
CREATE POLICY "Users can view their own alerts"
ON public.tax_autopilot_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
ON public.tax_autopilot_alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.tax_autopilot_alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
ON public.tax_autopilot_alerts FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Block anonymous access to tax_autopilot_alerts"
ON public.tax_autopilot_alerts FOR ALL
USING (auth.uid() IS NOT NULL);

-- Add updated_at trigger
CREATE TRIGGER update_tax_autopilot_updated_at
BEFORE UPDATE ON public.tax_autopilot
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();