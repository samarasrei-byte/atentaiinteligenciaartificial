
-- Table to store DRE document uploads and AI analyses
CREATE TABLE public.dre_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uploaded_by UUID NOT NULL,
  client_name TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  period_label TEXT,
  raw_text TEXT,
  ai_summary TEXT,
  ai_kpis JSONB,
  ai_recommendations TEXT,
  ai_full_analysis TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dre_analyses ENABLE ROW LEVEL SECURITY;

-- Only admin/contador can access
CREATE POLICY "Admin and contador can view DRE analyses"
  ON public.dre_analyses FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contador')
  );

CREATE POLICY "Admin and contador can insert DRE analyses"
  ON public.dre_analyses FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contador'))
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Admin and contador can update DRE analyses"
  ON public.dre_analyses FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contador')
  );

CREATE POLICY "Admin and contador can delete DRE analyses"
  ON public.dre_analyses FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contador')
  );

-- Trigger for updated_at
CREATE TRIGGER update_dre_analyses_updated_at
  BEFORE UPDATE ON public.dre_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for DRE documents
INSERT INTO storage.buckets (id, name, public) VALUES ('dre-documents', 'dre-documents', false);

-- Storage policies - only admin/contador
CREATE POLICY "Admin/contador can upload DRE docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dre-documents'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contador'))
  );

CREATE POLICY "Admin/contador can view DRE docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'dre-documents'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contador'))
  );

CREATE POLICY "Admin/contador can delete DRE docs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dre-documents'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contador'))
  );
