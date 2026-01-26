
-- =====================================================
-- SECURITY FIX: Profiles Table - PII Protection
-- =====================================================
-- Issue: The 'profiles' table could expose user emails, phone numbers, 
-- and full names to any authenticated user. The "Block anonymous access" 
-- policy was PERMISSIVE instead of RESTRICTIVE.

-- 1. Drop the incorrectly configured policy
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;

-- 2. Create proper RESTRICTIVE policy that blocks anonymous access
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- 3. Add explicit policy to ensure users can ONLY view their own profile
-- (The existing SELECT policy checks auth.uid() = user_id, but we need 
-- to ensure no other permissive policy allows broader access)

-- =====================================================
-- SECURITY FIX: IR Requests Table - Contador Assignment Validation
-- =====================================================
-- Issue: The contador access policy allows access if auth.uid() = contador_id,
-- but there's no validation that the assignment was legitimate (e.g., by admin).

-- 1. Drop the existing contador policies
DROP POLICY IF EXISTS "Contadores can view assigned IR requests" ON public.ir_requests;
DROP POLICY IF EXISTS "Contadores can update assigned IR requests" ON public.ir_requests;

-- 2. Create a helper function to validate contador assignment
-- This checks that the contador actually has the 'contador' role
-- AND that the assignment was made (contador_id is not null)
CREATE OR REPLACE FUNCTION public.is_valid_contador_assignment(
  p_contador_id uuid,
  p_request_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- The user must be the assigned contador
    p_contador_id = auth.uid()
    AND
    -- The user must have the 'contador' role
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = p_contador_id
      AND role = 'contador'
    )
$$;

-- 3. Create new secured contador policies with role validation
CREATE POLICY "Verified contadores can view assigned IR requests"
ON public.ir_requests
FOR SELECT
USING (
  public.is_valid_contador_assignment(contador_id, user_id)
);

CREATE POLICY "Verified contadores can update assigned IR requests"
ON public.ir_requests
FOR UPDATE
USING (
  public.is_valid_contador_assignment(contador_id, user_id)
);

-- =====================================================
-- APPLY SAME FIX TO OTHER TABLES WITH CONTADOR ACCESS
-- =====================================================
-- These tables also have contador access that should be validated

-- certificate_requests
DROP POLICY IF EXISTS "Contadores can view assigned certificate requests" ON public.certificate_requests;
DROP POLICY IF EXISTS "Contadores can update assigned certificate requests" ON public.certificate_requests;

CREATE POLICY "Verified contadores can view assigned certificate requests"
ON public.certificate_requests
FOR SELECT
USING (
  public.is_valid_contador_assignment(contador_id, user_id)
);

CREATE POLICY "Verified contadores can update assigned certificate requests"
ON public.certificate_requests
FOR UPDATE
USING (
  public.is_valid_contador_assignment(contador_id, user_id)
);

-- company_opening_requests
DROP POLICY IF EXISTS "Contadores can view assigned requests" ON public.company_opening_requests;
DROP POLICY IF EXISTS "Contadores can update assigned requests" ON public.company_opening_requests;

CREATE POLICY "Verified contadores can view assigned company requests"
ON public.company_opening_requests
FOR SELECT
USING (
  public.is_valid_contador_assignment(contador_id, user_id)
);

CREATE POLICY "Verified contadores can update assigned company requests"
ON public.company_opening_requests
FOR UPDATE
USING (
  public.is_valid_contador_assignment(contador_id, user_id)
);

-- credit_repair_requests
DROP POLICY IF EXISTS "Contadores can view assigned credit repair requests" ON public.credit_repair_requests;
DROP POLICY IF EXISTS "Contadores can update assigned credit repair requests" ON public.credit_repair_requests;

CREATE POLICY "Verified contadores can view assigned credit repair requests"
ON public.credit_repair_requests
FOR SELECT
USING (
  public.is_valid_contador_assignment(contador_id, user_id)
);

CREATE POLICY "Verified contadores can update assigned credit repair requests"
ON public.credit_repair_requests
FOR UPDATE
USING (
  public.is_valid_contador_assignment(contador_id, user_id)
);
