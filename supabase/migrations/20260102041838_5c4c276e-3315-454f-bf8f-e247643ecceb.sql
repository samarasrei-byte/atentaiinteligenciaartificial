-- Create withdrawal_requests table for partners (similar to contadores)
CREATE TABLE IF NOT EXISTS public.partner_withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.credit_repair_partners(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  amount_cents INTEGER NOT NULL,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_withdrawal_requests
CREATE POLICY "Block anonymous access to partner_withdrawal_requests"
ON public.partner_withdrawal_requests
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Partner users can view their partner withdrawals"
ON public.partner_withdrawal_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.credit_repair_partner_users pu
    WHERE pu.partner_id = partner_withdrawal_requests.partner_id
    AND pu.user_id = auth.uid()
  )
);

CREATE POLICY "Partner users can create withdrawals"
ON public.partner_withdrawal_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.credit_repair_partner_users pu
    WHERE pu.partner_id = partner_withdrawal_requests.partner_id
    AND pu.user_id = auth.uid()
  )
  AND auth.uid() = requested_by
);

CREATE POLICY "Admins can manage all partner withdrawals"
ON public.partner_withdrawal_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_partner_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.partner_withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();