/*
  Warnings:

  - You are about to drop the column `is_mod` on the `room_memberships` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RoomMemberRole" AS ENUM ('MEMBER', 'ADMIN');

-- AlterTable
ALTER TABLE "room_memberships" DROP COLUMN "is_mod",
ADD COLUMN     "role" "RoomMemberRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "cover_image_url" TEXT,
ADD COLUMN     "genre" TEXT;

-- CreateIndex
CREATE INDEX "dj_sessions_host_id_idx" ON "dj_sessions"("host_id");

-- CreateIndex
CREATE INDEX "dj_sessions_current_dj_id_idx" ON "dj_sessions"("current_dj_id");

-- CreateIndex
CREATE INDEX "rooms_created_by_idx" ON "rooms"("created_by");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dj_sessions" ADD CONSTRAINT "dj_sessions_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dj_sessions" ADD CONSTRAINT "dj_sessions_current_dj_id_fkey" FOREIGN KEY ("current_dj_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
