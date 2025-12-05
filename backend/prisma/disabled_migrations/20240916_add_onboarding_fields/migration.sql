-- Add onboarding fields to profiles table
ALTER TABLE "profiles"
ADD COLUMN "genres" TEXT[] DEFAULT '{}',
ADD COLUMN "genres_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "genres_completed_at" TIMESTAMP(3);

-- Add index for efficient queries on genres_completed
CREATE INDEX "profiles_genres_completed_idx" ON "profiles"("genres_completed");