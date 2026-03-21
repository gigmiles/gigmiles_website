-- ─── Referral System ────────────────────────────────────────────────────────
-- Run this in Supabase SQL Editor

-- 1. Add referral columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code       text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_code    text,
  ADD COLUMN IF NOT EXISTS referral_bonus_days integer NOT NULL DEFAULT 0;

-- 2. Referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bonus_applied boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_id)  -- one referral per new user
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- 3. Function: generate a unique 8-char referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I confusion
  code   text;
  exists boolean;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..8 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    SELECT EXISTS (SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- 4. Function: apply referral bonus (used by both INSERT and UPDATE triggers)
CREATE OR REPLACE FUNCTION apply_referral_bonus(
  new_user_id        uuid,
  p_referred_by_code text,
  OUT success        boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_id uuid;
  bonus_days  integer := 30;
BEGIN
  success := false;

  -- Don't apply if already tracked
  IF EXISTS (SELECT 1 FROM referrals WHERE referred_id = new_user_id) THEN
    RETURN;
  END IF;

  -- Find referrer
  SELECT id INTO referrer_id
    FROM profiles
    WHERE referral_code = p_referred_by_code
      AND id <> new_user_id
    LIMIT 1;

  IF referrer_id IS NULL THEN RETURN; END IF;

  -- Add 30 days to new user
  UPDATE profiles
    SET subscription_expires_at = COALESCE(subscription_expires_at, now()) + (bonus_days || ' days')::interval,
        referral_bonus_days      = referral_bonus_days + bonus_days
    WHERE id = new_user_id;

  -- Add 30 days to referrer
  UPDATE profiles
    SET subscription_expires_at = COALESCE(subscription_expires_at, now()) + (bonus_days || ' days')::interval,
        referral_bonus_days      = referral_bonus_days + bonus_days
    WHERE id = referrer_id;

  -- Record the referral
  INSERT INTO referrals (referrer_id, referred_id, bonus_applied)
    VALUES (referrer_id, new_user_id, true)
    ON CONFLICT (referred_id) DO NOTHING;

  success := true;
END;
$$;

-- 5. Trigger: BEFORE INSERT on profiles → auto-assign referral_code
CREATE OR REPLACE FUNCTION handle_profile_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_insert ON profiles;
CREATE TRIGGER on_profile_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_insert();

-- 6. Trigger: AFTER UPDATE on profiles → apply bonus when referred_by_code is first set
CREATE OR REPLACE FUNCTION handle_profile_referral_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only act when referred_by_code transitions from NULL to a value
  IF OLD.referred_by_code IS NULL AND NEW.referred_by_code IS NOT NULL THEN
    PERFORM apply_referral_bonus(NEW.id, NEW.referred_by_code);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_referral_update ON profiles;
CREATE TRIGGER on_profile_referral_update
  AFTER UPDATE OF referred_by_code ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_referral_update();

-- 7. Backfill referral codes for existing users who don't have one
UPDATE profiles
  SET referral_code = generate_referral_code()
  WHERE referral_code IS NULL;
