-- ===========================================
-- SEDA Production Migration - SAFE/IDEMPOTENT VERSION
-- This script uses IF NOT EXISTS to safely run on databases
-- that may have partial migrations already applied
-- ===========================================

-- ============================================
-- ENUMS (using DO blocks for IF NOT EXISTS)
-- ============================================

DO $$ BEGIN
    CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'CRAWLING', 'AWAITING_ADMIN', 'APPROVED', 'DENIED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ARTIST', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MessageType" AS ENUM ('TEXT', 'TRACK_CARD', 'SYSTEM', 'REPLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ModerationAction" AS ENUM ('DELETE_MESSAGE', 'MUTE_USER', 'CLEAR_REACTIONS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PostType" AS ENUM ('TEXT', 'TRACK', 'CRATE', 'MEDIA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LikeableType" AS ENUM ('POST', 'COMMENT', 'CRATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BadgeRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BadgeCategory" AS ENUM ('ACTIVITY', 'SOCIAL', 'CURATOR', 'DISCOVERY', 'SPECIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AIDetectionStatus" AS ENUM ('PENDING', 'ANALYZING', 'VERIFIED_HUMAN', 'FLAGGED_AI', 'UNDER_REVIEW', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RoomMemberRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN', 'OWNER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProductType" AS ENUM ('DIGITAL_TRACK', 'DIGITAL_ALBUM', 'MERCHANDISE_LINK', 'CONCERT_LINK', 'PRESET_PACK', 'SAMPLE_PACK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "supabase_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "muted_until" TIMESTAMP(3),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" TEXT,
    "email_verification_sent_at" TIMESTAMP(3),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Artist profiles
CREATE TABLE IF NOT EXISTS "artist_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "artist_name" TEXT NOT NULL,
    "bio" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "website_url" TEXT,
    "spotify_url" TEXT,
    "bandcamp_url" TEXT,
    "soundcloud_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "trusted_uploader" BOOLEAN NOT NULL DEFAULT false,
    "trusted_uploader_since" TIMESTAMP(3),
    "upload_count" INTEGER NOT NULL DEFAULT 0,
    "verified_upload_count" INTEGER NOT NULL DEFAULT 0,
    "stripe_account_id" TEXT,
    "stripe_account_status" TEXT,
    "paypal_email" TEXT,
    "paypal_merchant_id" TEXT,
    CONSTRAINT "artist_profiles_pkey" PRIMARY KEY ("id")
);

-- Verification requests
CREATE TABLE IF NOT EXISTS "verification_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "claim_code" TEXT NOT NULL,
    "target_url" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "crawled_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "denial_reason" TEXT,
    "crawler_response" JSONB,
    "metadata" JSONB,
    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- Admin actions
CREATE TABLE IF NOT EXISTS "admin_actions" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_id" TEXT,
    "target_type" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

-- Crawler cache
CREATE TABLE IF NOT EXISTS "crawler_cache" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content_hash" TEXT,
    "last_crawled" TIMESTAMP(3) NOT NULL,
    "response_data" JSONB,
    "status_code" INTEGER,
    "error" TEXT,
    CONSTRAINT "crawler_cache_pkey" PRIMARY KEY ("id")
);

-- Profiles
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cover_image" TEXT,
    "highlighted_concerts" JSONB,
    "highlighted_merch" JSONB,
    "highlighted_tracks" JSONB,
    "instagram_url" TEXT,
    "location" TEXT,
    "photos" JSONB,
    "videos" JSONB,
    "website_url" TEXT,
    "youtube_url" TEXT,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- Rooms
CREATE TABLE IF NOT EXISTS "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "avatar_url" TEXT,
    "cover_url" TEXT,
    "max_members" INTEGER DEFAULT 100,
    "settings" JSONB,
    "tags" TEXT[],
    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- Room memberships
CREATE TABLE IF NOT EXISTS "room_memberships" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "RoomMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),
    "is_muted" BOOLEAN NOT NULL DEFAULT false,
    "muted_until" TIMESTAMP(3),
    CONSTRAINT "room_memberships_pkey" PRIMARY KEY ("id")
);

-- Messages
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "track_data" JSONB,
    "reply_to_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Reactions
CREATE TABLE IF NOT EXISTS "reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- Playlists
CREATE TABLE IF NOT EXISTS "playlists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover_image" TEXT,
    "owner_id" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_collaborative" BOOLEAN NOT NULL DEFAULT false,
    "track_count" INTEGER NOT NULL DEFAULT 0,
    "play_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- Playlist items
CREATE TABLE IF NOT EXISTS "playlist_items" (
    "id" TEXT NOT NULL,
    "playlist_id" TEXT NOT NULL,
    "track_ref" JSONB NOT NULL,
    "added_by_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playlist_items_pkey" PRIMARY KEY ("id")
);

-- Playlist collaborators
CREATE TABLE IF NOT EXISTS "playlist_collaborators" (
    "id" TEXT NOT NULL,
    "playlist_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playlist_collaborators_pkey" PRIMARY KEY ("id")
);

-- Posts
CREATE TABLE IF NOT EXISTS "posts" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "type" "PostType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "track_ref" JSONB,
    "crate_ref" TEXT,
    "media_urls" JSONB,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "repost_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- Comments
CREATE TABLE IF NOT EXISTS "comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" TEXT,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- Likes
CREATE TABLE IF NOT EXISTS "likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "likeable_id" TEXT NOT NULL,
    "likeable_type" "LikeableType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- Reposts
CREATE TABLE IF NOT EXISTS "reposts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reposts_pkey" PRIMARY KEY ("id")
);

-- Follows
CREATE TABLE IF NOT EXISTS "follows" (
    "id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- DJ Sessions
CREATE TABLE IF NOT EXISTS "dj_sessions" (
    "id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "room_id" TEXT,
    "name" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_track" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "listener_count" INTEGER NOT NULL DEFAULT 0,
    "peak_listeners" INTEGER NOT NULL DEFAULT 0,
    "genre" TEXT,
    "tags" TEXT[],
    CONSTRAINT "dj_sessions_pkey" PRIMARY KEY ("id")
);

-- Queue items
CREATE TABLE IF NOT EXISTS "queue_items" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "track_ref" JSONB NOT NULL,
    "added_by_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "queue_items_pkey" PRIMARY KEY ("id")
);

-- Votes
CREATE TABLE IF NOT EXISTS "votes" (
    "id" TEXT NOT NULL,
    "queue_item_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- User progression
CREATE TABLE IF NOT EXISTS "user_progression" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "xp_to_next_level" INTEGER NOT NULL DEFAULT 100,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "play_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "session_host_count" INTEGER NOT NULL DEFAULT 0,
    "session_join_count" INTEGER NOT NULL DEFAULT 0,
    "crate_count" INTEGER NOT NULL DEFAULT 0,
    "unique_genres" JSONB,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_progression_pkey" PRIMARY KEY ("id")
);

-- Badges
CREATE TABLE IF NOT EXISTS "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "rarity" "BadgeRarity" NOT NULL DEFAULT 'COMMON',
    "category" "BadgeCategory" NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "unlock_criteria" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- User badges
CREATE TABLE IF NOT EXISTS "user_badges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_displayed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- AI detection results
CREATE TABLE IF NOT EXISTS "ai_detection_results" (
    "id" TEXT NOT NULL,
    "track_ref_id" TEXT NOT NULL,
    "status" "AIDetectionStatus" NOT NULL DEFAULT 'PENDING',
    "ai_probability" DOUBLE PRECISION,
    "analysis_details" JSONB,
    "analyzed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_detection_results_pkey" PRIMARY KEY ("id")
);

-- Community reports
CREATE TABLE IF NOT EXISTS "community_reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "track_ref_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_reports_pkey" PRIMARY KEY ("id")
);

-- Track refs
CREATE TABLE IF NOT EXISTS "track_refs" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artwork_url" TEXT,
    "duration" INTEGER,
    "url" TEXT NOT NULL,
    "metadata" JSONB,
    "ai_status" "AIDetectionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "track_refs_pkey" PRIMARY KEY ("id")
);

-- Moderation logs
CREATE TABLE IF NOT EXISTS "moderation_logs" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "target_user_id" TEXT,
    "action" "ModerationAction" NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- Conversations (Direct Messages)
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),
    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- Direct messages
CREATE TABLE IF NOT EXISTS "direct_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- Direct message reactions
CREATE TABLE IF NOT EXISTS "direct_message_reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "direct_message_reactions_pkey" PRIMARY KEY ("id")
);

-- Marketplace products
CREATE TABLE IF NOT EXISTS "marketplace_products" (
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

-- Purchases
CREATE TABLE IF NOT EXISTS "purchases" (
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

-- Artist revenue
CREATE TABLE IF NOT EXISTS "artist_revenue" (
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

-- Artist analytics
CREATE TABLE IF NOT EXISTS "artist_analytics" (
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

-- Fan engagements
CREATE TABLE IF NOT EXISTS "fan_engagements" (
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

-- ============================================
-- ADD MISSING COLUMNS (if tables already exist)
-- ============================================

-- Add email verification columns to users if missing
DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "email_verification_token" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "email_verification_sent_at" TIMESTAMP(3);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add Stripe columns to artist_profiles if missing
DO $$ BEGIN
    ALTER TABLE "artist_profiles" ADD COLUMN "stripe_account_id" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "artist_profiles" ADD COLUMN "stripe_account_status" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add PayPal columns to artist_profiles if missing
DO $$ BEGIN
    ALTER TABLE "artist_profiles" ADD COLUMN "paypal_email" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "artist_profiles" ADD COLUMN "paypal_merchant_id" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add profile customization columns if missing
DO $$ BEGIN
    ALTER TABLE "profiles" ADD COLUMN "cover_image" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "profiles" ADD COLUMN "highlighted_tracks" JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "profiles" ADD COLUMN "highlighted_concerts" JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "profiles" ADD COLUMN "highlighted_merch" JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "profiles" ADD COLUMN "photos" JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "profiles" ADD COLUMN "videos" JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "profiles" ADD COLUMN "location" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "profiles" ADD COLUMN "website_url" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "profiles" ADD COLUMN "instagram_url" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "profiles" ADD COLUMN "youtube_url" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add room enhancement columns if missing
DO $$ BEGIN
    ALTER TABLE "rooms" ADD COLUMN "avatar_url" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "rooms" ADD COLUMN "cover_url" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "rooms" ADD COLUMN "max_members" INTEGER DEFAULT 100;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "rooms" ADD COLUMN "settings" JSONB;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "rooms" ADD COLUMN "tags" TEXT[];
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add room membership columns if missing
DO $$ BEGIN
    ALTER TABLE "room_memberships" ADD COLUMN "is_muted" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "room_memberships" ADD COLUMN "muted_until" TIMESTAMP(3);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add DJ session columns if missing
DO $$ BEGIN
    ALTER TABLE "dj_sessions" ADD COLUMN "name" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "dj_sessions" ADD COLUMN "is_private" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "dj_sessions" ADD COLUMN "genre" TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "dj_sessions" ADD COLUMN "tags" TEXT[];
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Make room_id optional in dj_sessions
DO $$ BEGIN
    ALTER TABLE "dj_sessions" ALTER COLUMN "room_id" DROP NOT NULL;
EXCEPTION WHEN others THEN null;
END $$;

-- ============================================
-- INDEXES (using IF NOT EXISTS where possible)
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_supabase_id_key" ON "users"("supabase_id");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");

CREATE UNIQUE INDEX IF NOT EXISTS "artist_profiles_user_id_key" ON "artist_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "artist_profiles_verified_idx" ON "artist_profiles"("verified");
CREATE INDEX IF NOT EXISTS "artist_profiles_stripe_account_id_idx" ON "artist_profiles"("stripe_account_id");

CREATE UNIQUE INDEX IF NOT EXISTS "verification_requests_claim_code_key" ON "verification_requests"("claim_code");
CREATE INDEX IF NOT EXISTS "verification_requests_user_id_idx" ON "verification_requests"("user_id");
CREATE INDEX IF NOT EXISTS "verification_requests_status_idx" ON "verification_requests"("status");

CREATE INDEX IF NOT EXISTS "admin_actions_admin_id_idx" ON "admin_actions"("admin_id");
CREATE INDEX IF NOT EXISTS "admin_actions_target_id_idx" ON "admin_actions"("target_id");
CREATE INDEX IF NOT EXISTS "admin_actions_created_at_idx" ON "admin_actions"("created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "crawler_cache_url_key" ON "crawler_cache"("url");

CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_key" ON "profiles"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_username_key" ON "profiles"("username");

CREATE INDEX IF NOT EXISTS "rooms_owner_id_idx" ON "rooms"("owner_id");
CREATE INDEX IF NOT EXISTS "rooms_is_private_idx" ON "rooms"("is_private");
CREATE INDEX IF NOT EXISTS "rooms_created_at_idx" ON "rooms"("created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "room_memberships_room_id_user_id_key" ON "room_memberships"("room_id", "user_id");
CREATE INDEX IF NOT EXISTS "room_memberships_user_id_idx" ON "room_memberships"("user_id");
CREATE INDEX IF NOT EXISTS "room_memberships_room_id_idx" ON "room_memberships"("room_id");

CREATE INDEX IF NOT EXISTS "messages_room_id_created_at_idx" ON "messages"("room_id", "created_at");
CREATE INDEX IF NOT EXISTS "messages_sender_id_idx" ON "messages"("sender_id");

CREATE UNIQUE INDEX IF NOT EXISTS "reactions_message_id_user_id_emoji_key" ON "reactions"("message_id", "user_id", "emoji");

CREATE INDEX IF NOT EXISTS "playlists_owner_id_idx" ON "playlists"("owner_id");
CREATE INDEX IF NOT EXISTS "playlists_is_public_idx" ON "playlists"("is_public");

CREATE INDEX IF NOT EXISTS "playlist_items_playlist_id_position_idx" ON "playlist_items"("playlist_id", "position");

CREATE UNIQUE INDEX IF NOT EXISTS "playlist_collaborators_playlist_id_user_id_key" ON "playlist_collaborators"("playlist_id", "user_id");

CREATE INDEX IF NOT EXISTS "posts_author_id_created_at_idx" ON "posts"("author_id", "created_at");
CREATE INDEX IF NOT EXISTS "posts_type_idx" ON "posts"("type");

CREATE INDEX IF NOT EXISTS "comments_post_id_created_at_idx" ON "comments"("post_id", "created_at");
CREATE INDEX IF NOT EXISTS "comments_parent_id_idx" ON "comments"("parent_id");

CREATE UNIQUE INDEX IF NOT EXISTS "likes_user_id_likeable_id_likeable_type_key" ON "likes"("user_id", "likeable_id", "likeable_type");

CREATE UNIQUE INDEX IF NOT EXISTS "reposts_user_id_post_id_key" ON "reposts"("user_id", "post_id");

CREATE UNIQUE INDEX IF NOT EXISTS "follows_follower_id_following_id_key" ON "follows"("follower_id", "following_id");
CREATE INDEX IF NOT EXISTS "follows_following_id_idx" ON "follows"("following_id");

CREATE INDEX IF NOT EXISTS "dj_sessions_host_id_idx" ON "dj_sessions"("host_id");
CREATE INDEX IF NOT EXISTS "dj_sessions_room_id_idx" ON "dj_sessions"("room_id");
CREATE INDEX IF NOT EXISTS "dj_sessions_status_idx" ON "dj_sessions"("status");

CREATE INDEX IF NOT EXISTS "queue_items_session_id_position_idx" ON "queue_items"("session_id", "position");

CREATE UNIQUE INDEX IF NOT EXISTS "votes_queue_item_id_user_id_key" ON "votes"("queue_item_id", "user_id");

CREATE UNIQUE INDEX IF NOT EXISTS "user_progression_user_id_key" ON "user_progression"("user_id");

CREATE UNIQUE INDEX IF NOT EXISTS "badges_name_key" ON "badges"("name");
CREATE INDEX IF NOT EXISTS "badges_category_idx" ON "badges"("category");
CREATE INDEX IF NOT EXISTS "badges_rarity_idx" ON "badges"("rarity");

CREATE UNIQUE INDEX IF NOT EXISTS "user_badges_user_id_badge_id_key" ON "user_badges"("user_id", "badge_id");

CREATE UNIQUE INDEX IF NOT EXISTS "ai_detection_results_track_ref_id_key" ON "ai_detection_results"("track_ref_id");
CREATE INDEX IF NOT EXISTS "ai_detection_results_status_idx" ON "ai_detection_results"("status");

CREATE INDEX IF NOT EXISTS "community_reports_track_ref_id_idx" ON "community_reports"("track_ref_id");
CREATE INDEX IF NOT EXISTS "community_reports_status_idx" ON "community_reports"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "track_refs_platform_platform_id_key" ON "track_refs"("platform", "platform_id");
CREATE INDEX IF NOT EXISTS "track_refs_ai_status_idx" ON "track_refs"("ai_status");

CREATE INDEX IF NOT EXISTS "moderation_logs_room_id_idx" ON "moderation_logs"("room_id");
CREATE INDEX IF NOT EXISTS "moderation_logs_moderator_id_idx" ON "moderation_logs"("moderator_id");

CREATE UNIQUE INDEX IF NOT EXISTS "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");
CREATE INDEX IF NOT EXISTS "conversation_participants_user_id_idx" ON "conversation_participants"("user_id");

CREATE INDEX IF NOT EXISTS "direct_messages_conversation_id_created_at_idx" ON "direct_messages"("conversation_id", "created_at");
CREATE INDEX IF NOT EXISTS "direct_messages_sender_id_idx" ON "direct_messages"("sender_id");

CREATE UNIQUE INDEX IF NOT EXISTS "direct_message_reactions_message_id_user_id_emoji_key" ON "direct_message_reactions"("message_id", "user_id", "emoji");

CREATE INDEX IF NOT EXISTS "marketplace_products_artist_id_status_idx" ON "marketplace_products"("artist_id", "status");
CREATE INDEX IF NOT EXISTS "marketplace_products_type_status_idx" ON "marketplace_products"("type", "status");
CREATE INDEX IF NOT EXISTS "marketplace_products_created_at_idx" ON "marketplace_products"("created_at");

CREATE INDEX IF NOT EXISTS "purchases_product_id_idx" ON "purchases"("product_id");
CREATE INDEX IF NOT EXISTS "purchases_buyer_id_created_at_idx" ON "purchases"("buyer_id", "created_at");
CREATE INDEX IF NOT EXISTS "purchases_status_idx" ON "purchases"("status");

CREATE INDEX IF NOT EXISTS "artist_revenue_artist_id_idx" ON "artist_revenue"("artist_id");
CREATE UNIQUE INDEX IF NOT EXISTS "artist_revenue_artist_id_current_month_current_year_key" ON "artist_revenue"("artist_id", "current_month", "current_year");

CREATE INDEX IF NOT EXISTS "artist_analytics_artist_id_date_idx" ON "artist_analytics"("artist_id", "date");
CREATE UNIQUE INDEX IF NOT EXISTS "artist_analytics_artist_id_date_key" ON "artist_analytics"("artist_id", "date");

CREATE INDEX IF NOT EXISTS "fan_engagements_artist_id_last_engagement_idx" ON "fan_engagements"("artist_id", "last_engagement");
CREATE INDEX IF NOT EXISTS "fan_engagements_fan_id_idx" ON "fan_engagements"("fan_id");
CREATE UNIQUE INDEX IF NOT EXISTS "fan_engagements_artist_id_fan_id_key" ON "fan_engagements"("artist_id", "fan_id");

-- ============================================
-- FULL-TEXT SEARCH INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS "users_email_search_idx" ON "users" USING GIN (to_tsvector('english', email));
CREATE INDEX IF NOT EXISTS "profiles_username_search_idx" ON "profiles" USING GIN (to_tsvector('english', username));
CREATE INDEX IF NOT EXISTS "profiles_display_name_search_idx" ON "profiles" USING GIN (to_tsvector('english', COALESCE(display_name, '')));
CREATE INDEX IF NOT EXISTS "profiles_bio_search_idx" ON "profiles" USING GIN (to_tsvector('english', COALESCE(bio, '')));
CREATE INDEX IF NOT EXISTS "artist_profiles_artist_name_search_idx" ON "artist_profiles" USING GIN (to_tsvector('english', artist_name));
CREATE INDEX IF NOT EXISTS "artist_profiles_bio_search_idx" ON "artist_profiles" USING GIN (to_tsvector('english', COALESCE(bio, '')));
CREATE INDEX IF NOT EXISTS "rooms_name_search_idx" ON "rooms" USING GIN (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS "rooms_description_search_idx" ON "rooms" USING GIN (to_tsvector('english', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS "playlists_name_search_idx" ON "playlists" USING GIN (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS "playlists_description_search_idx" ON "playlists" USING GIN (to_tsvector('english', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS "posts_content_search_idx" ON "posts" USING GIN (to_tsvector('english', COALESCE(content, '')));
CREATE INDEX IF NOT EXISTS "track_refs_title_search_idx" ON "track_refs" USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS "track_refs_artist_search_idx" ON "track_refs" USING GIN (to_tsvector('english', artist));

-- ============================================
-- FOREIGN KEYS (wrapped in exception handlers)
-- ============================================

DO $$ BEGIN
    ALTER TABLE "artist_profiles" ADD CONSTRAINT "artist_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "rooms" ADD CONSTRAINT "rooms_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "room_memberships" ADD CONSTRAINT "room_memberships_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "room_memberships" ADD CONSTRAINT "room_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "messages" ADD CONSTRAINT "messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "reactions" ADD CONSTRAINT "reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "playlists" ADD CONSTRAINT "playlists_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "playlist_collaborators" ADD CONSTRAINT "playlist_collaborators_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "playlist_collaborators" ADD CONSTRAINT "playlist_collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "reposts" ADD CONSTRAINT "reposts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "reposts" ADD CONSTRAINT "reposts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "dj_sessions" ADD CONSTRAINT "dj_sessions_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "dj_sessions" ADD CONSTRAINT "dj_sessions_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "queue_items" ADD CONSTRAINT "queue_items_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "dj_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "queue_items" ADD CONSTRAINT "queue_items_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "votes" ADD CONSTRAINT "votes_queue_item_id_fkey" FOREIGN KEY ("queue_item_id") REFERENCES "queue_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "user_progression" ADD CONSTRAINT "user_progression_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ai_detection_results" ADD CONSTRAINT "ai_detection_results_track_ref_id_fkey" FOREIGN KEY ("track_ref_id") REFERENCES "track_refs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_track_ref_id_fkey" FOREIGN KEY ("track_ref_id") REFERENCES "track_refs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "direct_message_reactions" ADD CONSTRAINT "direct_message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "direct_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "direct_message_reactions" ADD CONSTRAINT "direct_message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "purchases" ADD CONSTRAINT "purchases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "purchases" ADD CONSTRAINT "purchases_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "artist_revenue" ADD CONSTRAINT "artist_revenue_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "artist_analytics" ADD CONSTRAINT "artist_analytics_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "fan_engagements" ADD CONSTRAINT "fan_engagements_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "fan_engagements" ADD CONSTRAINT "fan_engagements_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- DONE!
-- ============================================
SELECT 'Migration completed successfully!' as status;
