-- Create function to add special roles for specific email
CREATE OR REPLACE FUNCTION public.assign_special_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the user is the admin email
  IF NEW.email = 'academiadoia@gmail.com' THEN
    -- Add admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Add contador role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'contador')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to assign special roles after user creation
DROP TRIGGER IF EXISTS on_auth_user_special_roles ON auth.users;
CREATE TRIGGER on_auth_user_special_roles
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_special_roles();