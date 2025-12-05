-- AlterTable
ALTER TABLE "dj_sessions" ADD COLUMN     "genre" TEXT NOT NULL DEFAULT 'Other',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "dj_sessions_genre_idx" ON "dj_sessions"("genre");
