-- ===========================================
-- SEDA Production: Add Missing Columns
-- Run in Supabase SQL Editor
-- ===========================================

-- Add email_verified column to users table
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- Add verification_token column if missing
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "verification_token" TEXT;

-- Add verification_token_expires column if missing
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "verification_token_expires" TIMESTAMP(3);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
