
-- Fix overly permissive RLS policy for affiliate_leads
DROP POLICY IF EXISTS "Anyone can create leads" ON public.affiliate_leads;

-- Create a more secure policy - leads must reference a valid affiliate
CREATE POLICY "Leads can be created with valid affiliate reference"
  ON public.affiliate_leads FOR INSERT
  WITH CHECK (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE is_active = true)
  );

-- Fix overly permissive policy for affiliate_service_activations
DROP POLICY IF EXISTS "Affiliates can manage their activations" ON public.affiliate_service_activations;

CREATE POLICY "Affiliates can insert their activations"
  ON public.affiliate_service_activations FOR INSERT
  WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can update their activations"
  ON public.affiliate_service_activations FOR UPDATE
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can delete their activations"
  ON public.affiliate_service_activations FOR DELETE
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Add admin policies for service activations
CREATE POLICY "Admins can manage all activations"
  ON public.affiliate_service_activations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
