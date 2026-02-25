
-- 1. Add master access policies for capassi_chat_messages (equipe_cesar/admin bypass)
CREATE POLICY "Master users can view all chat messages"
  ON public.capassi_chat_messages FOR SELECT
  TO authenticated
  USING (public.has_capassi_master_access(auth.uid()));

CREATE POLICY "Master users can insert chat messages"
  ON public.capassi_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (public.has_capassi_master_access(auth.uid()));

CREATE POLICY "Master users can update chat messages"
  ON public.capassi_chat_messages FOR UPDATE
  TO authenticated
  USING (public.has_capassi_master_access(auth.uid()));

-- 2. Auto-create capassi_membership for César when he creates an org
-- The trigger auto_create_capassi_membership already exists, so we just need to ensure
-- César has a membership for any existing orgs he created
INSERT INTO public.capassi_memberships (user_id, organization_id, role)
SELECT o.created_by, o.id, 'super_admin'
FROM public.capassi_organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.capassi_memberships m 
  WHERE m.user_id = o.created_by AND m.organization_id = o.id
);
