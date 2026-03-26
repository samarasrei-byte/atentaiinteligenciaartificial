ALTER TABLE public.ir_ai_declarations 
ADD COLUMN IF NOT EXISTS malha_fina_risk text DEFAULT 'baixo',
ADD COLUMN IF NOT EXISTS malha_fina_reasons text[] DEFAULT '{}'::text[];