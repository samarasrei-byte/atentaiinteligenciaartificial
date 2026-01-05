-- Fix unrestricted file upload to fiscal-documents bucket
-- Drop existing vulnerable policies
DROP POLICY IF EXISTS "Users can upload fiscal documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own fiscal documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own fiscal documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own fiscal documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all fiscal documents" ON storage.objects;
DROP POLICY IF EXISTS "Contadores can view assigned fiscal documents" ON storage.objects;

-- Create secure INSERT policy - users can only upload to their own folder
CREATE POLICY "Users can upload their own fiscal documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fiscal-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create secure SELECT policy - users can only view their own files
CREATE POLICY "Users can view their own fiscal documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'fiscal-documents' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'contador')
  )
);

-- Create secure UPDATE policy - users can only update their own files
CREATE POLICY "Users can update their own fiscal documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'fiscal-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'fiscal-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create secure DELETE policy - users can only delete their own files
CREATE POLICY "Users can delete their own fiscal documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fiscal-documents' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    public.has_role(auth.uid(), 'admin')
  )
);