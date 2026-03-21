-- ─── Stripe Subscription Fields ──────────────────────────────────────────────
-- Run in Supabase SQL Editor after setting up Stripe

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free'
  CHECK (subscription_status IN ('free', 'trialing', 'active', 'past_due', 'canceled', 'founding')),
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
  CHECK (subscription_tier IN ('free', 'monthly', 'annual', 'founding')),
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_sub ON public.profiles(stripe_subscription_id);

-- Function: set founding status for first 500 members
CREATE OR REPLACE FUNCTION public.set_founding_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_number IS NOT NULL AND NEW.member_number <= 500 THEN
    NEW.subscription_status := 'founding';
    NEW.subscription_tier := 'founding';
    NEW.subscription_expires_at := NOW() + INTERVAL '1 year';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_founding_subscription_trigger ON public.profiles;
CREATE TRIGGER set_founding_subscription_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_founding_subscription();

-- View: active subscribers
CREATE OR REPLACE VIEW public.active_subscribers AS
SELECT id, full_name, subscription_status, subscription_tier, subscription_expires_at, member_number
FROM public.profiles
WHERE subscription_status IN ('active', 'trialing', 'founding')
  AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW());
