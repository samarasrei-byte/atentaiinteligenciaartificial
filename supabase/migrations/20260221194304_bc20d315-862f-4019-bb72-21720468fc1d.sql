-- Add Mercado Pago subscription ID to subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT;

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_subscription_id ON public.subscriptions(mp_subscription_id) WHERE mp_subscription_id IS NOT NULL;