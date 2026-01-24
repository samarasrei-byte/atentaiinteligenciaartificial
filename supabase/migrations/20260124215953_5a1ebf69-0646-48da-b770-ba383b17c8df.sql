-- Fix permissive RLS policy for affiliate_coupon_uses INSERT
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert coupon uses" ON public.affiliate_coupon_uses;

-- Create a more restrictive policy that allows inserts only for authenticated users
-- or through the security definer function (which bypasses RLS)
CREATE POLICY "Authenticated users can record coupon usage"
ON public.affiliate_coupon_uses
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL OR 
  current_setting('role', true) = 'service_role'
);