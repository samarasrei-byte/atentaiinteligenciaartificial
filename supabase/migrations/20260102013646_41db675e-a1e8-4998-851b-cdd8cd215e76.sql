-- Update the assign_special_roles function to include test user with all roles
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
  
  -- Test user gets ALL roles for testing purposes
  IF NEW.email = 'teste@atentai.com.br' THEN
    -- Add all roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'contador')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'autonomo')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;