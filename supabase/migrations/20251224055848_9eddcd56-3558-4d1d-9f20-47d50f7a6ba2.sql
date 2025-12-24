-- Create storage bucket for company opening documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-documents', 'company-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'company-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Contadores can view assigned request documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'company-documents' 
  AND EXISTS (
    SELECT 1 FROM public.company_opening_requests cor
    WHERE cor.contador_id = auth.uid()
    AND cor.user_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Admins can manage all company documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'company-documents' 
  AND has_role(auth.uid(), 'admin')
);

-- Table for tracking uploaded documents
CREATE TABLE public.company_opening_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.company_opening_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Document info
  document_type TEXT NOT NULL, -- 'cpf', 'rg', 'comprovante_residencia', 'iptu', 'contrato_social', 'other'
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_opening_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Block anonymous access to company_opening_documents"
ON public.company_opening_documents
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own documents"
ON public.company_opening_documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents"
ON public.company_opening_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Contadores can view assigned request documents"
ON public.company_opening_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.company_opening_requests cor
    WHERE cor.id = request_id
    AND cor.contador_id = auth.uid()
  )
);

CREATE POLICY "Contadores can update document status"
ON public.company_opening_documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.company_opening_requests cor
    WHERE cor.id = request_id
    AND cor.contador_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all documents"
ON public.company_opening_documents
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add pricing column to company_opening_requests
ALTER TABLE public.company_opening_requests
ADD COLUMN IF NOT EXISTS service_price_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_description TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Trigger for updated_at
CREATE TRIGGER update_company_opening_documents_updated_at
BEFORE UPDATE ON public.company_opening_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();