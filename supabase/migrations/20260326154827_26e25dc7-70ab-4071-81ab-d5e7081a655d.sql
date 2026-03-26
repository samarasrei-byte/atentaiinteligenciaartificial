DROP POLICY IF EXISTS "Users can insert own declarations" ON public.ir_ai_declarations;

-- Only service_role (Edge Functions) can create declarations after payment
-- No client-side INSERT is needed anymore
COMMENT ON TABLE public.ir_ai_declarations IS 'Declarations are created only by Edge Functions (service_role) after payment confirmation. No client-side INSERT allowed.';