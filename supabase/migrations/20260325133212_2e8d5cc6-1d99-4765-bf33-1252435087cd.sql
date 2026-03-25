-- Add missing DELETE policies for ir_ai_documents (user can delete their own docs)
CREATE POLICY "Users can delete own documents"
ON public.ir_ai_documents
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add missing DELETE policy for ir_ai_declarations
CREATE POLICY "Users can delete own declarations"
ON public.ir_ai_declarations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admin can view all ir_ai_documents (already exists for SELECT, but let's add for completeness)
-- Admin delete policy for documents
CREATE POLICY "Admin can delete all documents"
ON public.ir_ai_documents
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin update policy for declarations (to change status from admin panel)
CREATE POLICY "Admin can update all declarations"
ON public.ir_ai_declarations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for ir_ai_declarations so admin can see updates live
ALTER PUBLICATION supabase_realtime ADD TABLE public.ir_ai_declarations;