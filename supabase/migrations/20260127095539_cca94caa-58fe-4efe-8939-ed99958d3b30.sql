-- =====================================================
-- Security Fixes for Warning-Level Issues
-- =====================================================

-- ===========================================
-- FIX 1: Hardcoded Admin Emails (hardcoded_admin_emails)
-- Change auto-assign to only work for first admin (bootstrap mode)
-- ===========================================

CREATE OR REPLACE FUNCTION public.assign_special_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  admin_count int;
BEGIN
  -- Only auto-assign admin role if NO admins exist yet (bootstrap mode)
  SELECT COUNT(*) INTO admin_count 
  FROM public.user_roles 
  WHERE role = 'admin';
  
  -- Only bootstrap the very first admin account
  IF admin_count = 0 AND NEW.email = 'admin@atentai.com.br' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'contador')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- Future admins must be manually assigned by existing admins
  -- No automatic role assignment for any other email
  
  RETURN NEW;
END;
$function$;

-- ===========================================
-- FIX 2: Partner Invitations Weak Acceptance (partner_invitations_weak_acceptance)
-- Add email verification to the UPDATE policy
-- ===========================================

-- Drop old policy
DROP POLICY IF EXISTS "Users can accept pending invitations" ON public.partner_invitations;

-- Create new policy with email verification
CREATE POLICY "Users can accept pending invitations with email match"
ON public.partner_invitations
FOR UPDATE
TO authenticated
USING (
  status = 'pending' 
  AND expires_at > now()
  -- Require email to match if invitation has an email set
  AND (
    email IS NULL 
    OR LOWER(email) = LOWER(auth.email())
  )
)
WITH CHECK (
  auth.uid() = accepted_by
);

-- ===========================================
-- FIX 3: Contador Profiles Exposure (contador_profiles_available_exposure)
-- Create a safe view that hides sensitive Stripe info
-- ===========================================

-- Create a public view that excludes sensitive Stripe information
CREATE OR REPLACE VIEW public.contador_profiles_public
WITH (security_invoker = on)
AS
SELECT 
  id,
  user_id,
  crc_number,
  specialty,
  bio,
  hourly_rate_cents,
  available,
  rating,
  total_consultations,
  created_at,
  updated_at
  -- Excluded: stripe_account_id, stripe_account_status, stripe_onboarding_completed
FROM public.contador_profiles
WHERE available = true;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.contador_profiles_public TO authenticated;

-- Update RLS policy to restrict direct table access for general users
-- Only contador owners and admins can see full table details
DROP POLICY IF EXISTS "Authenticated users can view available contador profiles" ON public.contador_profiles;

-- Admins can see everything
CREATE POLICY "Admins can view all contador profiles"
ON public.contador_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Contadores can view/manage their own profile
CREATE POLICY "Contadores can view their own profile"
ON public.contador_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can view basic info of contadores they have active consultations with
-- Using valid enum values: pending, scheduled, completed, cancelled
CREATE POLICY "Users can view contador profiles for their consultations"
ON public.contador_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.contador_id = contador_profiles.user_id
    AND c.user_id = auth.uid()
    AND c.status IN ('pending', 'scheduled')
  )
);

-- ===========================================
-- FIX 4: Validate is_valid_contador_assignment function (contador_assignment_function_risk)
-- Ensure the function properly validates role and assignment
-- ===========================================

CREATE OR REPLACE FUNCTION public.is_valid_contador_assignment(p_contador_id uuid, p_request_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    -- The authenticated user must match the contador_id parameter
    p_contador_id = auth.uid()
    AND
    -- The user must have the 'contador' role in the user_roles table
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = p_contador_id
      AND role = 'contador'
    )
    AND
    -- Ensure the contador is different from the request user (prevent self-assignment access)
    p_contador_id != p_request_user_id
$function$;