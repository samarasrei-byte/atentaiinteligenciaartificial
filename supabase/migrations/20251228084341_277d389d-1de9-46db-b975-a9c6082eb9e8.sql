-- Create table for IR (Income Tax) requests
CREATE TABLE public.ir_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contador_id UUID,
  
  -- Request details
  ir_type TEXT NOT NULL DEFAULT 'simples', -- 'simples' or 'completo'
  fiscal_year INTEGER NOT NULL,
  
  -- Personal data
  full_name TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  phone TEXT,
  
  -- Financial data
  has_investments BOOLEAN DEFAULT false,
  has_rental_income BOOLEAN DEFAULT false,
  has_foreign_income BOOLEAN DEFAULT false,
  income_sources_count INTEGER DEFAULT 1,
  notes TEXT,
  
  -- Pricing
  base_price_cents INTEGER NOT NULL DEFAULT 15000,
  final_price_cents INTEGER NOT NULL DEFAULT 15000,
  discount_applied BOOLEAN DEFAULT false,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, in_progress, documents_pending, completed, cancelled
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, refunded
  stripe_session_id TEXT,
  
  -- Document delivery
  document_url TEXT,
  declaration_receipt_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.ir_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Block anonymous access to ir_requests"
  ON public.ir_requests
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own IR requests"
  ON public.ir_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own IR requests"
  ON public.ir_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests"
  ON public.ir_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('pending', 'documents_pending'));

CREATE POLICY "Contadores can view assigned IR requests"
  ON public.ir_requests
  FOR SELECT
  USING (auth.uid() = contador_id);

CREATE POLICY "Contadores can update assigned IR requests"
  ON public.ir_requests
  FOR UPDATE
  USING (auth.uid() = contador_id);

CREATE POLICY "Admins can manage all IR requests"
  ON public.ir_requests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_ir_requests_updated_at
  BEFORE UPDATE ON public.ir_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();