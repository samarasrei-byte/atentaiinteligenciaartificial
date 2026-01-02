-- Create table for tracking user cashback
CREATE TABLE public.user_cashback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_year TEXT NOT NULL, -- Format: YYYY-MM
  services_used INTEGER NOT NULL DEFAULT 0,
  cashback_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  cashback_amount_cents INTEGER NOT NULL DEFAULT 0,
  total_spent_cents INTEGER NOT NULL DEFAULT 0,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE public.user_cashback ENABLE ROW LEVEL SECURITY;

-- Users can view their own cashback
CREATE POLICY "Users can view their own cashback"
ON public.user_cashback
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own cashback records
CREATE POLICY "Users can insert their own cashback"
ON public.user_cashback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own cashback (to claim it)
CREATE POLICY "Users can update their own cashback"
ON public.user_cashback
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_cashback_updated_at
BEFORE UPDATE ON public.user_cashback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();