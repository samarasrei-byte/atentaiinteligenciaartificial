
-- Fix the remaining overly permissive policy on fiscal_analysis_requests
DROP POLICY IF EXISTS "Users can create fiscal requests" ON public.fiscal_analysis_requests;

-- Create a secure policy that allows authenticated users or guests with proper data
CREATE POLICY "Authenticated users can create fiscal requests"
  ON public.fiscal_analysis_requests FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
    (auth.uid() IS NULL AND user_id IS NULL)
  );
