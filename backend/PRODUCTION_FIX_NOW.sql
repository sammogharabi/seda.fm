-- ============================================================
-- SEDA Production Database Fix
-- Run this SQL in your Supabase SQL Editor
-- ============================================================
--
-- IMPORTANT: Make sure you are in the CORRECT Supabase project:
-- Project ID: chqwoddtrzlzdzylrvtx
-- URL: https://supabase.com/dashboard/project/chqwoddtrzlzdzylrvtx/sql/new
--
-- This will add the missing columns to the users table.
-- ============================================================

-- Step 1: Check if columns exist (run this first to see current state)
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Add missing columns (run this after checking Step 1)
-- If email_verified already exists, these will do nothing (IF NOT EXISTS)

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token_expires_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "user_type" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "muted_until" TIMESTAMP(3);

-- Step 3: Create unique index on verification token
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_verification_token_key"
ON "users"("email_verification_token");

-- Step 4: Verify the changes (run this to confirm columns were added)
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
AND column_name IN ('email_verified', 'email_verification_token', 'email_verification_token_expires_at', 'user_type', 'muted_until')
ORDER BY column_name;

-- Expected output after Step 4:
-- email_verified                       | boolean
-- email_verification_token             | text
-- email_verification_token_expires_at  | timestamp without time zone
-- muted_until                          | timestamp without time zone
-- user_type                            | text
