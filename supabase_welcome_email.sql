-- Add welcome_email_sent flag to profiles
-- Run this once in Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent boolean NOT NULL DEFAULT false;
