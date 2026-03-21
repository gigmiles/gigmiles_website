-- After setting up Stripe, also run: supabase_stripe.sql
-- ─── Member Number System ────────────────────────────────────────────────────
-- Run this in Supabase SQL Editor

-- 1. Add member_number column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS member_number INTEGER;

-- 2. Create sequence starting at 1
CREATE SEQUENCE IF NOT EXISTS member_number_seq START 1;

-- 3. Function to assign member number on insert
CREATE OR REPLACE FUNCTION public.assign_member_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_number IS NULL THEN
    NEW.member_number := nextval('member_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger: fires before each new profile row
DROP TRIGGER IF EXISTS assign_member_number_trigger ON public.profiles;
CREATE TRIGGER assign_member_number_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_member_number();

-- 5. Founding member flag (auto-computed, stored)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN GENERATED ALWAYS AS (member_number <= 500) STORED;

-- 6. Backfill existing users (assigns numbers in signup order)
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.profiles
  WHERE member_number IS NULL
)
UPDATE public.profiles p
SET member_number = o.rn
FROM ordered o
WHERE p.id = o.id;

-- Verify
SELECT COUNT(*) as total_members,
       COUNT(CASE WHEN is_founding_member THEN 1 END) as founding_members
FROM public.profiles;
