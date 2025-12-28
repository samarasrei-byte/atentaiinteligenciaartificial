-- Add Stripe Connect fields to contador_profiles
ALTER TABLE public.contador_profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.contador_profiles.stripe_account_id IS 'Stripe Connect account ID for receiving payments';
COMMENT ON COLUMN public.contador_profiles.stripe_account_status IS 'Status of Stripe Connect account: not_connected, pending, active, restricted';
COMMENT ON COLUMN public.contador_profiles.stripe_onboarding_completed IS 'Whether the Stripe Connect onboarding is complete';