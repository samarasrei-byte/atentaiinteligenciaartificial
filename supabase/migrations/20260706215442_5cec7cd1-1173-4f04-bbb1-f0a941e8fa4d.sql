DROP POLICY IF EXISTS "Anyone can insert mentoria leads" ON public.mentoria_cartas_leads;
CREATE POLICY "public_can_insert_mentoria_leads"
ON public.mentoria_cartas_leads
FOR INSERT
TO public
WITH CHECK (true);