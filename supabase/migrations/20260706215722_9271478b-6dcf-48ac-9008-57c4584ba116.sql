DROP POLICY IF EXISTS "public_can_insert_mentoria_leads" ON public.mentoria_cartas_leads;
CREATE POLICY "anon_auth_can_insert_mentoria_leads"
ON public.mentoria_cartas_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
GRANT INSERT ON public.mentoria_cartas_leads TO anon, authenticated;
NOTIFY pgrst, 'reload schema';