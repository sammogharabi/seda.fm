-- AlterTable
ALTER TABLE "dj_sessions" ADD COLUMN     "is_private" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE INDEX "dj_sessions_is_private_idx" ON "dj_sessions"("is_private");
