
-- IR AI declarations table
CREATE TABLE public.ir_ai_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fiscal_year INTEGER NOT NULL DEFAULT (EXTRACT(YEAR FROM CURRENT_DATE) - 1)::INTEGER,
  declaration_type TEXT NOT NULL DEFAULT 'simples' CHECK (declaration_type IN ('simples', 'completo')),
  status TEXT NOT NULL DEFAULT 'pending_documents' CHECK (status IN ('pending_documents', 'processing', 'ai_analysis', 'review', 'completed', 'error')),
  full_name TEXT,
  cpf TEXT,
  total_income_cents BIGINT DEFAULT 0,
  total_deductions_cents BIGINT DEFAULT 0,
  tax_due_cents BIGINT DEFAULT 0,
  refund_cents BIGINT DEFAULT 0,
  ai_analysis JSONB,
  ai_confidence_percent INTEGER,
  human_reviewed BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- IR AI documents table
CREATE TABLE public.ir_ai_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_id UUID NOT NULL REFERENCES public.ir_ai_declarations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'other' CHECK (document_type IN ('informe_rendimentos', 'comprovante_medico', 'comprovante_educacao', 'recibo_aluguel', 'nota_corretagem', 'darf', 'other')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  ai_extracted_data JSONB,
  ai_status TEXT DEFAULT 'pending' CHECK (ai_status IN ('pending', 'processing', 'extracted', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ir_ai_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ir_ai_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for declarations
CREATE POLICY "Users can view own declarations"
  ON public.ir_ai_declarations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own declarations"
  ON public.ir_ai_declarations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own declarations"
  ON public.ir_ai_declarations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for documents
CREATE POLICY "Users can view own documents"
  ON public.ir_ai_documents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON public.ir_ai_documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON public.ir_ai_documents FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Admin can see all
CREATE POLICY "Admin can view all declarations"
  ON public.ir_ai_declarations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can view all documents"
  ON public.ir_ai_documents FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for IR documents
INSERT INTO storage.buckets (id, name, public) VALUES ('ir-ai-documents', 'ir-ai-documents', false);

-- Storage RLS
CREATE POLICY "Users upload own IR docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ir-ai-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own IR docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'ir-ai-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Trigger for updated_at
CREATE TRIGGER update_ir_ai_declarations_updated_at
  BEFORE UPDATE ON public.ir_ai_declarations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
