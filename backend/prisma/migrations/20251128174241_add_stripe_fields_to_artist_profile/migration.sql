-- AlterTable
ALTER TABLE "artist_profiles" ADD COLUMN     "stripe_account_id" TEXT,
ADD COLUMN     "stripe_account_status" TEXT;

-- CreateIndex
CREATE INDEX "artist_profiles_stripe_account_id_idx" ON "artist_profiles"("stripe_account_id");
