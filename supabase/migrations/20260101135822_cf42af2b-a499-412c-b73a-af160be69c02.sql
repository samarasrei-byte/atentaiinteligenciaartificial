-- Create table for credit repair (Limpa Nome) requests
CREATE TABLE public.credit_repair_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contador_id UUID,
  
  -- Client info
  full_name TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  phone TEXT,
  
  -- Service details
  debt_amount_cents BIGINT NOT NULL DEFAULT 0,
  debt_description TEXT,
  creditors TEXT[] DEFAULT '{}',
  bureaus_selected TEXT[] DEFAULT ARRAY['spc', 'serasa', 'scpc', 'boa_vista'],
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  
  -- Pricing
  service_price_cents INTEGER NOT NULL DEFAULT 99900,
  discount_applied BOOLEAN DEFAULT false,
  final_price_cents INTEGER NOT NULL DEFAULT 99900,
  
  -- Stripe
  stripe_session_id TEXT,
  
  -- Notes and docs
  notes TEXT,
  contador_notes TEXT,
  document_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'analyzing', 'in_progress', 'negotiating', 'completed', 'cancelled')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded'))
);

-- Enable Row Level Security
ALTER TABLE public.credit_repair_requests ENABLE ROW LEVEL SECURITY;

-- Block anonymous access
CREATE POLICY "Block anonymous access to credit_repair_requests"
ON public.credit_repair_requests
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Users can create their own requests
CREATE POLICY "Users can create their own credit repair requests"
ON public.credit_repair_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests
CREATE POLICY "Users can view their own credit repair requests"
ON public.credit_repair_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their pending requests
CREATE POLICY "Users can update their pending credit repair requests"
ON public.credit_repair_requests
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Contadores can view assigned requests
CREATE POLICY "Contadores can view assigned credit repair requests"
ON public.credit_repair_requests
FOR SELECT
USING (auth.uid() = contador_id);

-- Contadores can update assigned requests
CREATE POLICY "Contadores can update assigned credit repair requests"
ON public.credit_repair_requests
FOR UPDATE
USING (auth.uid() = contador_id);

-- Admins can manage all requests
CREATE POLICY "Admins can manage all credit repair requests"
ON public.credit_repair_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_credit_repair_requests_updated_at
BEFORE UPDATE ON public.credit_repair_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_credit_repair_user_id ON public.credit_repair_requests(user_id);
CREATE INDEX idx_credit_repair_contador_id ON public.credit_repair_requests(contador_id);
CREATE INDEX idx_credit_repair_status ON public.credit_repair_requests(status);