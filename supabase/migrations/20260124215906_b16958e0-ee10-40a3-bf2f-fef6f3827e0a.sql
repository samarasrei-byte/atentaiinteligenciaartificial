-- Create affiliate coupons table
CREATE TABLE public.affiliate_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  max_uses integer, -- null = unlimited
  current_uses integer DEFAULT 0,
  applicable_services text[] DEFAULT ARRAY[]::text[], -- empty = all services
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_percent_discount CHECK (
    discount_type != 'percent' OR (discount_value > 0 AND discount_value <= 100)
  )
);

-- Enable RLS
ALTER TABLE public.affiliate_coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Affiliates can view their own coupons"
ON public.affiliate_coupons
FOR SELECT
USING (
  affiliate_id IN (
    SELECT id FROM affiliates WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Affiliates can create their own coupons"
ON public.affiliate_coupons
FOR INSERT
WITH CHECK (
  affiliate_id IN (
    SELECT id FROM affiliates WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Affiliates can update their own coupons"
ON public.affiliate_coupons
FOR UPDATE
USING (
  affiliate_id IN (
    SELECT id FROM affiliates WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Affiliates can delete their own coupons"
ON public.affiliate_coupons
FOR DELETE
USING (
  affiliate_id IN (
    SELECT id FROM affiliates WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all coupons"
ON public.affiliate_coupons
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Public can validate coupons (read-only for validation)
CREATE POLICY "Anyone can validate active coupons"
ON public.affiliate_coupons
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create coupon usage tracking table
CREATE TABLE public.affiliate_coupon_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES affiliate_coupons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid,
  user_email text NOT NULL,
  service_type text NOT NULL,
  original_amount_cents integer NOT NULL,
  discount_amount_cents integer NOT NULL,
  final_amount_cents integer NOT NULL,
  stripe_session_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_coupon_uses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupon uses
CREATE POLICY "Affiliates can view usage of their coupons"
ON public.affiliate_coupon_uses
FOR SELECT
USING (
  coupon_id IN (
    SELECT ac.id FROM affiliate_coupons ac
    JOIN affiliates a ON a.id = ac.affiliate_id
    WHERE a.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all coupon uses"
ON public.affiliate_coupon_uses
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert coupon uses"
ON public.affiliate_coupon_uses
FOR INSERT
WITH CHECK (true);

-- Function to validate and use affiliate coupon
CREATE OR REPLACE FUNCTION public.validate_affiliate_coupon(
  p_code text,
  p_service_type text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon affiliate_coupons%ROWTYPE;
  v_affiliate affiliates%ROWTYPE;
BEGIN
  -- Find the coupon
  SELECT * INTO v_coupon
  FROM affiliate_coupons
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR current_uses < max_uses);
  
  IF v_coupon.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Cupom inválido ou expirado'
    );
  END IF;
  
  -- Check service applicability
  IF array_length(v_coupon.applicable_services, 1) > 0 
     AND p_service_type IS NOT NULL 
     AND NOT (p_service_type = ANY(v_coupon.applicable_services)) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Cupom não aplicável a este serviço'
    );
  END IF;
  
  -- Get affiliate info
  SELECT * INTO v_affiliate
  FROM affiliates
  WHERE id = v_coupon.affiliate_id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'affiliate_id', v_coupon.affiliate_id,
    'affiliate_name', v_affiliate.full_name,
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'code', v_coupon.code
  );
END;
$$;

-- Function to apply coupon (increment usage)
CREATE OR REPLACE FUNCTION public.apply_affiliate_coupon(
  p_coupon_id uuid,
  p_user_email text,
  p_service_type text,
  p_original_amount_cents integer,
  p_discount_amount_cents integer,
  p_stripe_session_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment usage count
  UPDATE affiliate_coupons
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE id = p_coupon_id;
  
  -- Record the usage
  INSERT INTO affiliate_coupon_uses (
    coupon_id,
    user_email,
    service_type,
    original_amount_cents,
    discount_amount_cents,
    final_amount_cents,
    stripe_session_id
  ) VALUES (
    p_coupon_id,
    p_user_email,
    p_service_type,
    p_original_amount_cents,
    p_discount_amount_cents,
    p_original_amount_cents - p_discount_amount_cents,
    p_stripe_session_id
  );
  
  RETURN true;
END;
$$;

-- Create index for faster lookups
CREATE INDEX idx_affiliate_coupons_code ON affiliate_coupons(UPPER(code));
CREATE INDEX idx_affiliate_coupons_affiliate ON affiliate_coupons(affiliate_id);
CREATE INDEX idx_affiliate_coupon_uses_coupon ON affiliate_coupon_uses(coupon_id);