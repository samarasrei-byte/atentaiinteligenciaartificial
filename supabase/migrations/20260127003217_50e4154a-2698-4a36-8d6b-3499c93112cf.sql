-- Fix RLS policy that incorrectly accesses auth.users directly
-- This causes "permission denied for table users" error

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view their own fiscal requests" ON public.fiscal_analysis_requests;

-- Create corrected policy using auth.email() function instead of querying auth.users
CREATE POLICY "Users can view their own fiscal requests"
ON public.fiscal_analysis_requests
FOR SELECT
USING (
  user_id = auth.uid() OR
  email = auth.email()
);