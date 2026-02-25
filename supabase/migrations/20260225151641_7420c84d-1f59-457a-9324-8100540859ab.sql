
-- Tabela principal de apresentações comerciais
CREATE TABLE public.sales_presentations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT 'contador_fiscal',
  
  -- Textos personalizáveis
  headline TEXT NOT NULL DEFAULT 'Como o Atentai pode transformar seu escritório em uma operação 3x mais produtiva',
  subheadline TEXT NOT NULL DEFAULT 'Automatize processos, reduza erros e aumente a produtividade da sua equipe contábil.',
  
  -- Métricas personalizáveis (JSON)
  metrics JSONB NOT NULL DEFAULT '{
    "tasks_automated": 1500,
    "hours_saved": 320,
    "productivity_increase": 67,
    "clients_impacted": 200,
    "active_agents": 12
  }'::jsonb,
  
  -- ROI personalizado
  roi_data JSONB NOT NULL DEFAULT '{
    "monthly_hours_saved": 40,
    "hourly_rate_brl": 150,
    "annual_projection_multiplier": 12
  }'::jsonb,
  
  -- Cases de sucesso personalizados
  testimonials JSONB NOT NULL DEFAULT '[
    {"name": "Maria Santos", "company": "Santos Contabilidade", "text": "Reduzimos 60% do retrabalho em 3 meses.", "metric": "60% menos retrabalho"},
    {"name": "Carlos Lima", "company": "Lima & Associados", "text": "A produtividade da equipe triplicou.", "metric": "3x mais produtivo"},
    {"name": "Ana Oliveira", "company": "Oliveira BPO", "text": "Economizamos 40h por mês em processos manuais.", "metric": "40h/mês economizadas"}
  ]'::jsonb,
  
  -- Seções ativáveis
  sections_config JSONB NOT NULL DEFAULT '{
    "hero": true,
    "what_is": true,
    "features": true,
    "social_proof": true,
    "pain_points": true,
    "transformation": true,
    "roi": true,
    "demo": true,
    "testimonials": true,
    "cta": true
  }'::jsonb,
  
  -- CTA config
  cta_whatsapp TEXT DEFAULT '',
  cta_calendar_link TEXT DEFAULT '',
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales_presentations ENABLE ROW LEVEL SECURITY;

-- Admin pode tudo
CREATE POLICY "Admins can manage presentations"
  ON public.sales_presentations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Público pode ver apresentações ativas
CREATE POLICY "Anyone can view active presentations"
  ON public.sales_presentations FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Índice para busca por slug
CREATE INDEX idx_sales_presentations_slug ON public.sales_presentations (slug);
CREATE INDEX idx_sales_presentations_active ON public.sales_presentations (is_active);

-- Trigger updated_at
CREATE TRIGGER update_sales_presentations_updated_at
  BEFORE UPDATE ON public.sales_presentations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
