
-- Tabela de leads da mentoria Cartas Contempladas
CREATE TABLE public.mentoria_cartas_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  carta_type TEXT NOT NULL,
  credit_range TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','won','lost')),
  source TEXT DEFAULT 'mentoria_landing',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentoria_cartas_leads TO authenticated;
GRANT INSERT ON public.mentoria_cartas_leads TO anon;
GRANT ALL ON public.mentoria_cartas_leads TO service_role;

ALTER TABLE public.mentoria_cartas_leads ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode criar um lead
CREATE POLICY "Anyone can insert mentoria leads"
  ON public.mentoria_cartas_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Apenas admins podem visualizar
CREATE POLICY "Admins can view mentoria leads"
  ON public.mentoria_cartas_leads
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Apenas admins podem atualizar
CREATE POLICY "Admins can update mentoria leads"
  ON public.mentoria_cartas_leads
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Apenas admins podem excluir
CREATE POLICY "Admins can delete mentoria leads"
  ON public.mentoria_cartas_leads
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger de updated_at
CREATE TRIGGER update_mentoria_cartas_leads_updated_at
  BEFORE UPDATE ON public.mentoria_cartas_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX idx_mentoria_cartas_leads_created_at ON public.mentoria_cartas_leads(created_at DESC);
CREATE INDEX idx_mentoria_cartas_leads_status ON public.mentoria_cartas_leads(status);
