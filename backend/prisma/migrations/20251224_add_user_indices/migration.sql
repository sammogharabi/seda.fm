-- Add performance indices to User table
CREATE INDEX IF NOT EXISTS "users_emailVerified_idx" ON "users"("emailVerified");
CREATE INDEX IF NOT EXISTS "users_createdAt_idx" ON "users"("createdAt");
