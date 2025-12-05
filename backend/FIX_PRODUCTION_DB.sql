-- ============================================================
-- COPY AND PASTE THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR
-- ============================================================
-- Open: https://supabase.com/dashboard/project/chqwoddtrzlzdzylrvtx/sql/new
-- Select ALL text below and click "Run"
-- ============================================================

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token_expires_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "user_type" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "muted_until" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_verification_token_key" ON "users"("email_verification_token");

-- Verify columns were added (you should see 5 rows)
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
AND column_name IN ('email_verified', 'email_verification_token', 'email_verification_token_expires_at', 'user_type', 'muted_until');
