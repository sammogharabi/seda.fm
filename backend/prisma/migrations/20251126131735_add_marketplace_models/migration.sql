-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('DIGITAL_TRACK', 'DIGITAL_ALBUM', 'MERCHANDISE_LINK', 'CONCERT_LINK', 'PRESET_PACK', 'SAMPLE_PACK');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');

-- CreateTable
CREATE TABLE "marketplace_products" (
    "id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "cover_image" TEXT,
    "track_ref" JSONB,
    "file_url" TEXT,
    "file_size" INTEGER,
    "external_url" TEXT,
    "external_platform" TEXT,
    "pack_contents" JSONB,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "purchase_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "marketplace_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "payment_intent_id" TEXT,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "last_download_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_revenue" (
    "id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "total_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pending_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "withdrawn_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_month" INTEGER NOT NULL,
    "current_year" INTEGER NOT NULL,
    "monthly_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "monthly_sales" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_analytics" (
    "id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "profile_views" INTEGER NOT NULL DEFAULT 0,
    "track_plays" INTEGER NOT NULL DEFAULT 0,
    "track_shares" INTEGER NOT NULL DEFAULT 0,
    "new_followers" INTEGER NOT NULL DEFAULT 0,
    "product_views" INTEGER NOT NULL DEFAULT 0,
    "product_clicks" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "top_countries" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artist_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fan_engagements" (
    "id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "fan_id" TEXT NOT NULL,
    "total_plays" INTEGER NOT NULL DEFAULT 0,
    "total_purchases" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_engagement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "first_engagement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fan_engagements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketplace_products_artist_id_status_idx" ON "marketplace_products"("artist_id", "status");

-- CreateIndex
CREATE INDEX "marketplace_products_type_status_idx" ON "marketplace_products"("type", "status");

-- CreateIndex
CREATE INDEX "marketplace_products_created_at_idx" ON "marketplace_products"("created_at");

-- CreateIndex
CREATE INDEX "purchases_product_id_idx" ON "purchases"("product_id");

-- CreateIndex
CREATE INDEX "purchases_buyer_id_created_at_idx" ON "purchases"("buyer_id", "created_at");

-- CreateIndex
CREATE INDEX "purchases_status_idx" ON "purchases"("status");

-- CreateIndex
CREATE INDEX "artist_revenue_artist_id_idx" ON "artist_revenue"("artist_id");

-- CreateIndex
CREATE UNIQUE INDEX "artist_revenue_artist_id_current_month_current_year_key" ON "artist_revenue"("artist_id", "current_month", "current_year");

-- CreateIndex
CREATE INDEX "artist_analytics_artist_id_date_idx" ON "artist_analytics"("artist_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "artist_analytics_artist_id_date_key" ON "artist_analytics"("artist_id", "date");

-- CreateIndex
CREATE INDEX "fan_engagements_artist_id_last_engagement_idx" ON "fan_engagements"("artist_id", "last_engagement");

-- CreateIndex
CREATE INDEX "fan_engagements_fan_id_idx" ON "fan_engagements"("fan_id");

-- CreateIndex
CREATE UNIQUE INDEX "fan_engagements_artist_id_fan_id_key" ON "fan_engagements"("artist_id", "fan_id");

-- AddForeignKey
ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_revenue" ADD CONSTRAINT "artist_revenue_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_analytics" ADD CONSTRAINT "artist_analytics_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_engagements" ADD CONSTRAINT "fan_engagements_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_engagements" ADD CONSTRAINT "fan_engagements_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
