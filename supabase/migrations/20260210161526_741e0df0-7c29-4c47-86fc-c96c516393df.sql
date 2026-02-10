
-- Fix: Change the "Block anonymous access to company_opening_requests" policy from PERMISSIVE to RESTRICTIVE
-- Currently PERMISSIVE, which means ANY authenticated user can access ALL rows (OR'd with other policies)
-- Making it RESTRICTIVE means it acts as an AND gate - users must be authenticated AND pass another policy

DROP POLICY "Block anonymous access to company_opening_requests" ON public.company_opening_requests;

CREATE POLICY "Block anonymous access to company_opening_requests"
ON public.company_opening_requests
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);
