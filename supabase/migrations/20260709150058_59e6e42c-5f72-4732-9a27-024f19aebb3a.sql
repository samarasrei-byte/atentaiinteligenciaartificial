DROP POLICY IF EXISTS "Users can accept invitations for themselves" ON public.credit_repair_partner_users;

CREATE POLICY "Users can accept valid invitations for themselves"
ON public.credit_repair_partner_users
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND is_primary IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM public.partner_invitations pi
    WHERE pi.partner_id = credit_repair_partner_users.partner_id
      AND pi.status = 'pending'
      AND pi.expires_at > now()
      AND pi.email IS NOT NULL
      AND lower(pi.email) = lower(auth.email())
  )
);