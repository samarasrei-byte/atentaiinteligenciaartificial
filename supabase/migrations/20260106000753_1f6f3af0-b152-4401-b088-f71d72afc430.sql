-- Fix Issue 1: Block direct access to rate_limits table
-- Only allow access through SECURITY DEFINER functions (check_rate_limit, cleanup_old_rate_limits)
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

CREATE POLICY "Block all direct access to rate_limits"
ON public.rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

-- Fix Issue 2: Remove test account backdoor from assign_special_roles function
-- Only keep legitimate admin emails, remove teste@atentai.com.br auto-role assignment
CREATE OR REPLACE FUNCTION public.assign_special_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if the user is the admin email
  IF NEW.email = 'academiadoia@gmail.com' OR NEW.email = 'admin@atentai.com.br' THEN
    -- Add admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Add contador role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'contador')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- REMOVED: Test user backdoor that auto-assigned ALL roles
  -- Test accounts should have roles manually assigned by an admin
  -- This prevents privilege escalation if someone registers with teste@atentai.com.br
  
  RETURN NEW;
END;
$function$;