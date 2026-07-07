
-- 1. Fix chat-attachments storage: require owner folder path
DROP POLICY IF EXISTS "Authenticated users can view chat attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;

CREATE POLICY "Users view own chat attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users upload own chat attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins keep full access
CREATE POLICY "Admins manage all chat attachments"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'chat-attachments' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'chat-attachments' AND public.has_role(auth.uid(), 'admin'));

-- 2. Fix partner_invitations: remove public listing, expose only via token-scoped RPC
DROP POLICY IF EXISTS "Anon can read pending invitations" ON public.partner_invitations;
DROP POLICY IF EXISTS "Anyone can read valid invitations by token" ON public.partner_invitations;
DROP POLICY IF EXISTS "Users can accept pending invitations with email match" ON public.partner_invitations;

-- Require email match unconditionally (no null bypass)
CREATE POLICY "Users accept invitations matching their email"
  ON public.partner_invitations FOR UPDATE TO authenticated
  USING (
    status = 'pending'
    AND expires_at > now()
    AND email IS NOT NULL
    AND lower(email) = lower(auth.email())
  )
  WITH CHECK (auth.uid() = accepted_by);

-- Secure token lookup (returns single invitation only if token matches)
CREATE OR REPLACE FUNCTION public.get_partner_invitation_by_token(_token uuid)
RETURNS TABLE (
  id uuid,
  partner_id uuid,
  email text,
  status text,
  expires_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, partner_id, email, status, expires_at, created_at
  FROM public.partner_invitations
  WHERE invitation_token = _token
    AND status = 'pending'
    AND expires_at > now()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_partner_invitation_by_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_partner_invitation_by_token(uuid) TO anon, authenticated;
