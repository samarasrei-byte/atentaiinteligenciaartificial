-- Add missing DELETE policy for storage - users can delete their own IR documents
CREATE POLICY "Users delete own IR docs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'ir-ai-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add admin SELECT policy for storage (admin needs to view docs in admin panel)
CREATE POLICY "Admin view all IR docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'ir-ai-documents' AND public.has_role(auth.uid(), 'admin'::app_role));