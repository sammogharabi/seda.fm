-- AlterTable
ALTER TABLE "users" 
ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "email_verification_token" TEXT,
ADD COLUMN "email_verification_token_expires_at" TIMESTAMP(3),
ADD COLUMN "user_type" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_verification_token_key" ON "users"("email_verification_token");
