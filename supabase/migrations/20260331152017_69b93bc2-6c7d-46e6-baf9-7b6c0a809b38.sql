
-- 1. DROP the overly permissive ALL policy on user_roles
DROP POLICY IF EXISTS "Block anonymous access to user_roles" ON public.user_roles;

-- 2. Allow authenticated users to READ their own roles only
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Allow admins to read all roles
CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Only admins can insert roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Only admins can update roles
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Fix audit_logs: drop overly permissive policy
DROP POLICY IF EXISTS "Block anonymous access to audit_logs" ON public.audit_logs;

-- 8. Users can only read their own audit logs
CREATE POLICY "Users can read own audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 9. Fix affiliate_coupon_uses: drop overly permissive insert
DROP POLICY IF EXISTS "Authenticated users can insert coupon uses" ON public.affiliate_coupon_uses;

-- 10. Restrict coupon uses insert to match user's own ID
CREATE POLICY "Users can insert own coupon uses"
ON public.affiliate_coupon_uses
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
