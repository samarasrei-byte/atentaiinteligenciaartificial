-- Add 'autonomo' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'autonomo';

-- Create table for autonomo profiles
CREATE TABLE public.autonomo_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  profession TEXT,
  profession_category TEXT,
  bio TEXT,
  crc_number TEXT,
  monthly_revenue_average_cents BIGINT DEFAULT 0,
  current_regime TEXT DEFAULT 'pf',
  state TEXT,
  city TEXT,
  phone TEXT,
  cpf TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.autonomo_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Block anonymous access to autonomo_profiles"
ON public.autonomo_profiles
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own autonomo profile"
ON public.autonomo_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own autonomo profile"
ON public.autonomo_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own autonomo profile"
ON public.autonomo_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all autonomo profiles"
ON public.autonomo_profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index
CREATE INDEX idx_autonomo_profiles_user_id ON public.autonomo_profiles(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_autonomo_profiles_updated_at
BEFORE UPDATE ON public.autonomo_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();