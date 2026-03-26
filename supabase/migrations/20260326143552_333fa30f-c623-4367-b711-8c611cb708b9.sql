
ALTER TABLE public.ir_ai_declarations 
ADD COLUMN IF NOT EXISTS checklist_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_dependents boolean,
ADD COLUMN IF NOT EXISTS dependents_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS dependents_info jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS has_assets boolean,
ADD COLUMN IF NOT EXISTS assets_info jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS has_private_pension boolean,
ADD COLUMN IF NOT EXISTS pension_type text,
ADD COLUMN IF NOT EXISTS pension_annual_cents bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_exempt_income boolean,
ADD COLUMN IF NOT EXISTS exempt_income_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS had_carne_leao boolean,
ADD COLUMN IF NOT EXISTS multiple_income_sources boolean,
ADD COLUMN IF NOT EXISTS sold_assets boolean,
ADD COLUMN IF NOT EXISTS has_crypto boolean,
ADD COLUMN IF NOT EXISTS checklist_answers jsonb DEFAULT '{}'::jsonb;
