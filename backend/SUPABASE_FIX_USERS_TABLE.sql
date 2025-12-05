-- =====================================================
-- FIX USERS TABLE - Add missing columns
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add missing columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token_expires_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "user_type" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "muted_until" TIMESTAMP(3);

-- Create unique index for email verification token if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_verification_token_key" ON "users"("email_verification_token");

-- Verify the columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;
