-- CreateEnum (idempotent)
DO $$ BEGIN
    CREATE TYPE "StreamingProvider" AS ENUM ('SPOTIFY', 'APPLE_MUSIC', 'TIDAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable (idempotent)
CREATE TABLE IF NOT EXISTS "streaming_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "StreamingProvider" NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "provider_user_id" TEXT,
    "provider_email" TEXT,
    "display_name" TEXT,
    "profile_image_url" TEXT,
    "country" TEXT,
    "product_type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "last_refreshed_at" TIMESTAMP(3),
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaming_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "streaming_connections_user_id_idx" ON "streaming_connections"("user_id");

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "streaming_connections_provider_idx" ON "streaming_connections"("provider");

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "streaming_connections_is_active_idx" ON "streaming_connections"("is_active");

-- CreateIndex (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "streaming_connections_user_id_provider_key" ON "streaming_connections"("user_id", "provider");

-- AddForeignKey (idempotent)
DO $$ BEGIN
    ALTER TABLE "streaming_connections" ADD CONSTRAINT "streaming_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
