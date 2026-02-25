
-- Auto-assign equipe_cesar role to César's email
CREATE OR REPLACE FUNCTION public.assign_special_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  
  -- Auto-assign equipe_cesar role for César
  IF NEW.email = 'cesas@atentai.com.br' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'equipe_cesar')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;
