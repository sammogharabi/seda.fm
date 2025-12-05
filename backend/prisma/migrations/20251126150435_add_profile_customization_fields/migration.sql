-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "cover_image" TEXT,
ADD COLUMN     "highlighted_concerts" JSONB,
ADD COLUMN     "highlighted_merch" JSONB,
ADD COLUMN     "highlighted_tracks" JSONB,
ADD COLUMN     "instagram_url" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "photos" JSONB,
ADD COLUMN     "videos" JSONB,
ADD COLUMN     "website_url" TEXT,
ADD COLUMN     "youtube_url" TEXT;
