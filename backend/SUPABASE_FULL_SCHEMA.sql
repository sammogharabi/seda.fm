-- =====================================================
-- SEDA PRODUCTION DATABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- Project: chqwoddtrzlzdzylrvtx (Seda.prod)
-- =====================================================

-- Create ENUM types first
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
    CREATE TYPE "RoomMemberRole" AS ENUM ('MEMBER', 'ADMIN');
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

-- =====================================================
-- USERS TABLE - Core table
-- =====================================================
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "supabase_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" TEXT,
    "email_verification_token_expires_at" TIMESTAMP(3),
    "user_type" TEXT,
    "muted_until" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Add missing columns to users if table exists
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token_expires_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "user_type" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "muted_until" TIMESTAMP(3);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_supabase_id_key" ON "users"("supabase_id");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_verification_token_key" ON "users"("email_verification_token");

-- =====================================================
-- ARTIST PROFILES TABLE
-- =====================================================
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

CREATE UNIQUE INDEX IF NOT EXISTS "artist_profiles_user_id_key" ON "artist_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "artist_profiles_verified_idx" ON "artist_profiles"("verified");
CREATE INDEX IF NOT EXISTS "artist_profiles_artist_name_idx" ON "artist_profiles"("artist_name");
CREATE INDEX IF NOT EXISTS "artist_profiles_stripe_account_id_idx" ON "artist_profiles"("stripe_account_id");

-- =====================================================
-- VERIFICATION REQUESTS TABLE
-- =====================================================
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

CREATE UNIQUE INDEX IF NOT EXISTS "verification_requests_claim_code_key" ON "verification_requests"("claim_code");
CREATE INDEX IF NOT EXISTS "verification_requests_status_idx" ON "verification_requests"("status");
CREATE INDEX IF NOT EXISTS "verification_requests_user_id_idx" ON "verification_requests"("user_id");
CREATE INDEX IF NOT EXISTS "verification_requests_claim_code_idx" ON "verification_requests"("claim_code");
CREATE INDEX IF NOT EXISTS "verification_requests_expires_at_idx" ON "verification_requests"("expires_at");

-- =====================================================
-- ADMIN ACTIONS TABLE
-- =====================================================
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

CREATE INDEX IF NOT EXISTS "admin_actions_admin_id_idx" ON "admin_actions"("admin_id");
CREATE INDEX IF NOT EXISTS "admin_actions_target_id_idx" ON "admin_actions"("target_id");
CREATE INDEX IF NOT EXISTS "admin_actions_created_at_idx" ON "admin_actions"("created_at");

-- =====================================================
-- CRAWLER CACHE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "crawler_cache" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "status_code" INTEGER,
    "headers" JSONB,
    "crawled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crawler_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "crawler_cache_url_key" ON "crawler_cache"("url");
CREATE INDEX IF NOT EXISTS "crawler_cache_url_idx" ON "crawler_cache"("url");
CREATE INDEX IF NOT EXISTS "crawler_cache_expires_at_idx" ON "crawler_cache"("expires_at");

-- =====================================================
-- ROOMS TABLE (Chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "genre" TEXT,
    "cover_image_url" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "rooms_is_private_idx" ON "rooms"("is_private");
CREATE INDEX IF NOT EXISTS "rooms_created_at_idx" ON "rooms"("created_at");
CREATE INDEX IF NOT EXISTS "rooms_created_by_idx" ON "rooms"("created_by");

-- =====================================================
-- ROOM MEMBERSHIPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "room_memberships" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "RoomMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "room_memberships_room_id_user_id_key" ON "room_memberships"("room_id", "user_id");
CREATE INDEX IF NOT EXISTS "room_memberships_room_id_idx" ON "room_memberships"("room_id");
CREATE INDEX IF NOT EXISTS "room_memberships_user_id_idx" ON "room_memberships"("user_id");

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "text" TEXT,
    "track_ref" JSONB,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "messages_room_id_created_at_idx" ON "messages"("room_id", "created_at");
CREATE INDEX IF NOT EXISTS "messages_user_id_idx" ON "messages"("user_id");
CREATE INDEX IF NOT EXISTS "messages_parent_id_idx" ON "messages"("parent_id");
CREATE INDEX IF NOT EXISTS "messages_deleted_at_idx" ON "messages"("deleted_at");

-- =====================================================
-- REACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "reactions_message_id_user_id_emoji_key" ON "reactions"("message_id", "user_id", "emoji");
CREATE INDEX IF NOT EXISTS "reactions_message_id_idx" ON "reactions"("message_id");
CREATE INDEX IF NOT EXISTS "reactions_user_id_idx" ON "reactions"("user_id");

-- =====================================================
-- TRACK REFS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "track_refs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artwork" TEXT,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_refs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "track_refs_url_key" ON "track_refs"("url");
CREATE UNIQUE INDEX IF NOT EXISTS "track_refs_provider_provider_id_key" ON "track_refs"("provider", "provider_id");
CREATE INDEX IF NOT EXISTS "track_refs_provider_idx" ON "track_refs"("provider");
CREATE INDEX IF NOT EXISTS "track_refs_url_idx" ON "track_refs"("url");

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "genres_completed" BOOLEAN NOT NULL DEFAULT false,
    "genres_completed_at" TIMESTAMP(3),
    "cover_image" TEXT,
    "location" TEXT,
    "photos" JSONB,
    "videos" JSONB,
    "highlighted_tracks" JSONB,
    "highlighted_merch" JSONB,
    "highlighted_concerts" JSONB,
    "instagram_url" TEXT,
    "youtube_url" TEXT,
    "website_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_key" ON "profiles"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_username_key" ON "profiles"("username");
CREATE INDEX IF NOT EXISTS "profiles_username_idx" ON "profiles"("username");
CREATE INDEX IF NOT EXISTS "profiles_genres_completed_idx" ON "profiles"("genres_completed");

-- =====================================================
-- PLAYLISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "playlists" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_collaborative" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cover_image_url" TEXT,
    "genre" TEXT,
    "mood" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "play_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "playlists_owner_user_id_idx" ON "playlists"("owner_user_id");
CREATE INDEX IF NOT EXISTS "playlists_is_public_idx" ON "playlists"("is_public");

-- =====================================================
-- PLAYLIST COLLABORATORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "playlist_collaborators" (
    "playlist_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'contributor',
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_collaborators_pkey" PRIMARY KEY ("playlist_id", "user_id")
);

-- =====================================================
-- PLAYLIST ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "playlist_items" (
    "id" TEXT NOT NULL,
    "playlist_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_track_id" TEXT NOT NULL,
    "title" TEXT,
    "artist" TEXT,
    "artwork_url" TEXT,
    "added_by_user_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "playlist_items_playlist_id_position_key" ON "playlist_items"("playlist_id", "position");
CREATE INDEX IF NOT EXISTS "playlist_items_playlist_id_idx" ON "playlist_items"("playlist_id");
CREATE INDEX IF NOT EXISTS "playlist_items_added_by_user_id_idx" ON "playlist_items"("added_by_user_id");

-- =====================================================
-- MODERATION LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "moderation_logs" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "moderation_logs_room_id_idx" ON "moderation_logs"("room_id");
CREATE INDEX IF NOT EXISTS "moderation_logs_moderator_id_idx" ON "moderation_logs"("moderator_id");
CREATE INDEX IF NOT EXISTS "moderation_logs_target_id_idx" ON "moderation_logs"("target_id");
CREATE INDEX IF NOT EXISTS "moderation_logs_created_at_idx" ON "moderation_logs"("created_at");

-- =====================================================
-- POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "PostType" NOT NULL,
    "content" TEXT,
    "track_ref" JSONB,
    "crate_id" TEXT,
    "media_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "posts_user_id_created_at_idx" ON "posts"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "posts_type_idx" ON "posts"("type");
CREATE INDEX IF NOT EXISTS "posts_deleted_at_idx" ON "posts"("deleted_at");

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "comments_post_id_created_at_idx" ON "comments"("post_id", "created_at");
CREATE INDEX IF NOT EXISTS "comments_user_id_idx" ON "comments"("user_id");
CREATE INDEX IF NOT EXISTS "comments_parent_id_idx" ON "comments"("parent_id");

-- =====================================================
-- LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "LikeableType" NOT NULL,
    "post_id" TEXT,
    "comment_id" TEXT,
    "crate_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "likes_user_id_type_post_id_key" ON "likes"("user_id", "type", "post_id");
CREATE UNIQUE INDEX IF NOT EXISTS "likes_user_id_type_comment_id_key" ON "likes"("user_id", "type", "comment_id");
CREATE UNIQUE INDEX IF NOT EXISTS "likes_user_id_type_crate_id_key" ON "likes"("user_id", "type", "crate_id");
CREATE INDEX IF NOT EXISTS "likes_post_id_idx" ON "likes"("post_id");
CREATE INDEX IF NOT EXISTS "likes_comment_id_idx" ON "likes"("comment_id");
CREATE INDEX IF NOT EXISTS "likes_crate_id_idx" ON "likes"("crate_id");

-- =====================================================
-- REPOSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "reposts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reposts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "reposts_user_id_post_id_key" ON "reposts"("user_id", "post_id");
CREATE INDEX IF NOT EXISTS "reposts_user_id_created_at_idx" ON "reposts"("user_id", "created_at");

-- =====================================================
-- FOLLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "follows" (
    "id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "follows_follower_id_following_id_key" ON "follows"("follower_id", "following_id");
CREATE INDEX IF NOT EXISTS "follows_follower_id_idx" ON "follows"("follower_id");
CREATE INDEX IF NOT EXISTS "follows_following_id_idx" ON "follows"("following_id");

-- =====================================================
-- DJ SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "dj_sessions" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "room_id" TEXT,
    "host_id" TEXT NOT NULL,
    "current_dj_id" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "now_playing_ref" JSONB,
    "now_playing_start" TIMESTAMP(3),
    "genre" TEXT NOT NULL DEFAULT 'Other',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "dj_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "dj_sessions_room_id_idx" ON "dj_sessions"("room_id");
CREATE INDEX IF NOT EXISTS "dj_sessions_host_id_idx" ON "dj_sessions"("host_id");
CREATE INDEX IF NOT EXISTS "dj_sessions_current_dj_id_idx" ON "dj_sessions"("current_dj_id");
CREATE INDEX IF NOT EXISTS "dj_sessions_status_idx" ON "dj_sessions"("status");
CREATE INDEX IF NOT EXISTS "dj_sessions_is_private_idx" ON "dj_sessions"("is_private");
CREATE INDEX IF NOT EXISTS "dj_sessions_genre_idx" ON "dj_sessions"("genre");

-- =====================================================
-- QUEUE ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "queue_items" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,
    "track_ref" JSONB NOT NULL,
    "position" INTEGER NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "played_at" TIMESTAMP(3),
    "skipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "queue_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "queue_items_session_id_position_key" ON "queue_items"("session_id", "position");
CREATE INDEX IF NOT EXISTS "queue_items_session_id_position_idx" ON "queue_items"("session_id", "position");

-- =====================================================
-- VOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "votes" (
    "id" TEXT NOT NULL,
    "queue_item_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vote_type" "VoteType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "votes_queue_item_id_user_id_key" ON "votes"("queue_item_id", "user_id");
CREATE INDEX IF NOT EXISTS "votes_queue_item_id_idx" ON "votes"("queue_item_id");

-- =====================================================
-- USER PROGRESSION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "user_progression" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tracks_played" INTEGER NOT NULL DEFAULT 0,
    "total_listening_time" INTEGER NOT NULL DEFAULT 0,
    "posts_created" INTEGER NOT NULL DEFAULT 0,
    "comments_created" INTEGER NOT NULL DEFAULT 0,
    "crates_created" INTEGER NOT NULL DEFAULT 0,
    "artists_discovered" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_progression_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_progression_user_id_key" ON "user_progression"("user_id");
CREATE INDEX IF NOT EXISTS "user_progression_level_idx" ON "user_progression"("level");
CREATE INDEX IF NOT EXISTS "user_progression_total_xp_idx" ON "user_progression"("total_xp");

-- =====================================================
-- BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "rarity" "BadgeRarity" NOT NULL,
    "category" "BadgeCategory" NOT NULL,
    "requirement_key" TEXT NOT NULL,
    "requirement_value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "badges_requirement_key_requirement_value_key" ON "badges"("requirement_key", "requirement_value");

-- =====================================================
-- USER BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "user_badges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_badges_user_id_badge_id_key" ON "user_badges"("user_id", "badge_id");
CREATE INDEX IF NOT EXISTS "user_badges_user_id_idx" ON "user_badges"("user_id");

-- =====================================================
-- AI DETECTION RESULTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "ai_detection_results" (
    "id" TEXT NOT NULL,
    "track_ref" JSONB NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "status" "AIDetectionStatus" NOT NULL DEFAULT 'PENDING',
    "risk_score" DOUBLE PRECISION,
    "detection_data" JSONB,
    "moderator_notes" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_detection_results_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ai_detection_results_uploaded_by_status_idx" ON "ai_detection_results"("uploaded_by", "status");
CREATE INDEX IF NOT EXISTS "ai_detection_results_status_risk_score_idx" ON "ai_detection_results"("status", "risk_score");

-- =====================================================
-- COMMUNITY REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "community_reports" (
    "id" TEXT NOT NULL,
    "track_ref" JSONB NOT NULL,
    "reported_by" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "community_reports_reported_by_idx" ON "community_reports"("reported_by");

-- =====================================================
-- CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL,
    "participant_ids" TEXT[] NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "conversations_participant_ids_idx" ON "conversations" USING GIN ("participant_ids");

-- =====================================================
-- DIRECT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "direct_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read_by" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "direct_messages_conversation_id_created_at_idx" ON "direct_messages"("conversation_id", "created_at");
CREATE INDEX IF NOT EXISTS "direct_messages_sender_id_idx" ON "direct_messages"("sender_id");

-- =====================================================
-- MARKETPLACE PRODUCTS TABLE
-- =====================================================
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "marketplace_products_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "marketplace_products_artist_id_status_idx" ON "marketplace_products"("artist_id", "status");
CREATE INDEX IF NOT EXISTS "marketplace_products_type_status_idx" ON "marketplace_products"("type", "status");
CREATE INDEX IF NOT EXISTS "marketplace_products_created_at_idx" ON "marketplace_products"("created_at");

-- =====================================================
-- PURCHASES TABLE
-- =====================================================
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "purchases_product_id_idx" ON "purchases"("product_id");
CREATE INDEX IF NOT EXISTS "purchases_buyer_id_created_at_idx" ON "purchases"("buyer_id", "created_at");
CREATE INDEX IF NOT EXISTS "purchases_status_idx" ON "purchases"("status");

-- =====================================================
-- ARTIST REVENUE TABLE
-- =====================================================
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artist_revenue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "artist_revenue_artist_id_current_month_current_year_key" ON "artist_revenue"("artist_id", "current_month", "current_year");
CREATE INDEX IF NOT EXISTS "artist_revenue_artist_id_idx" ON "artist_revenue"("artist_id");

-- =====================================================
-- ARTIST ANALYTICS TABLE
-- =====================================================
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

CREATE UNIQUE INDEX IF NOT EXISTS "artist_analytics_artist_id_date_key" ON "artist_analytics"("artist_id", "date");
CREATE INDEX IF NOT EXISTS "artist_analytics_artist_id_date_idx" ON "artist_analytics"("artist_id", "date");

-- =====================================================
-- FAN ENGAGEMENTS TABLE
-- =====================================================
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fan_engagements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "fan_engagements_artist_id_fan_id_key" ON "fan_engagements"("artist_id", "fan_id");
CREATE INDEX IF NOT EXISTS "fan_engagements_artist_id_last_engagement_idx" ON "fan_engagements"("artist_id", "last_engagement");
CREATE INDEX IF NOT EXISTS "fan_engagements_fan_id_idx" ON "fan_engagements"("fan_id");

-- =====================================================
-- FOREIGN KEYS - Add after all tables exist
-- =====================================================

-- Artist Profiles
ALTER TABLE "artist_profiles" DROP CONSTRAINT IF EXISTS "artist_profiles_user_id_fkey";
ALTER TABLE "artist_profiles" ADD CONSTRAINT "artist_profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Verification Requests
ALTER TABLE "verification_requests" DROP CONSTRAINT IF EXISTS "verification_requests_user_id_fkey";
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "verification_requests" DROP CONSTRAINT IF EXISTS "verification_requests_reviewed_by_fkey";
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_reviewed_by_fkey"
    FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Admin Actions
ALTER TABLE "admin_actions" DROP CONSTRAINT IF EXISTS "admin_actions_admin_id_fkey";
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_fkey"
    FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Rooms
ALTER TABLE "rooms" DROP CONSTRAINT IF EXISTS "rooms_created_by_fkey";
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Room Memberships
ALTER TABLE "room_memberships" DROP CONSTRAINT IF EXISTS "room_memberships_room_id_fkey";
ALTER TABLE "room_memberships" ADD CONSTRAINT "room_memberships_room_id_fkey"
    FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "room_memberships" DROP CONSTRAINT IF EXISTS "room_memberships_user_id_fkey";
ALTER TABLE "room_memberships" ADD CONSTRAINT "room_memberships_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Messages
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_room_id_fkey";
ALTER TABLE "messages" ADD CONSTRAINT "messages_room_id_fkey"
    FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_user_id_fkey";
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_parent_id_fkey";
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Reactions
ALTER TABLE "reactions" DROP CONSTRAINT IF EXISTS "reactions_message_id_fkey";
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_message_id_fkey"
    FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reactions" DROP CONSTRAINT IF EXISTS "reactions_user_id_fkey";
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Profiles
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_user_id_fkey";
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Playlists
ALTER TABLE "playlists" DROP CONSTRAINT IF EXISTS "playlists_owner_user_id_fkey";
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_owner_user_id_fkey"
    FOREIGN KEY ("owner_user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Playlist Collaborators
ALTER TABLE "playlist_collaborators" DROP CONSTRAINT IF EXISTS "playlist_collaborators_playlist_id_fkey";
ALTER TABLE "playlist_collaborators" ADD CONSTRAINT "playlist_collaborators_playlist_id_fkey"
    FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "playlist_collaborators" DROP CONSTRAINT IF EXISTS "playlist_collaborators_user_id_fkey";
ALTER TABLE "playlist_collaborators" ADD CONSTRAINT "playlist_collaborators_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Playlist Items
ALTER TABLE "playlist_items" DROP CONSTRAINT IF EXISTS "playlist_items_playlist_id_fkey";
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_playlist_id_fkey"
    FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "playlist_items" DROP CONSTRAINT IF EXISTS "playlist_items_added_by_user_id_fkey";
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_added_by_user_id_fkey"
    FOREIGN KEY ("added_by_user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Posts
ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_user_id_fkey";
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_crate_id_fkey";
ALTER TABLE "posts" ADD CONSTRAINT "posts_crate_id_fkey"
    FOREIGN KEY ("crate_id") REFERENCES "playlists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Comments
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_post_id_fkey";
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_user_id_fkey";
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_parent_id_fkey";
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Likes
ALTER TABLE "likes" DROP CONSTRAINT IF EXISTS "likes_user_id_fkey";
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "likes" DROP CONSTRAINT IF EXISTS "likes_post_id_fkey";
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "likes" DROP CONSTRAINT IF EXISTS "likes_comment_id_fkey";
ALTER TABLE "likes" ADD CONSTRAINT "likes_comment_id_fkey"
    FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "likes" DROP CONSTRAINT IF EXISTS "likes_crate_id_fkey";
ALTER TABLE "likes" ADD CONSTRAINT "likes_crate_id_fkey"
    FOREIGN KEY ("crate_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Reposts
ALTER TABLE "reposts" DROP CONSTRAINT IF EXISTS "reposts_user_id_fkey";
ALTER TABLE "reposts" ADD CONSTRAINT "reposts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reposts" DROP CONSTRAINT IF EXISTS "reposts_post_id_fkey";
ALTER TABLE "reposts" ADD CONSTRAINT "reposts_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Follows
ALTER TABLE "follows" DROP CONSTRAINT IF EXISTS "follows_follower_id_fkey";
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey"
    FOREIGN KEY ("follower_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "follows" DROP CONSTRAINT IF EXISTS "follows_following_id_fkey";
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey"
    FOREIGN KEY ("following_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DJ Sessions
ALTER TABLE "dj_sessions" DROP CONSTRAINT IF EXISTS "dj_sessions_room_id_fkey";
ALTER TABLE "dj_sessions" ADD CONSTRAINT "dj_sessions_room_id_fkey"
    FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dj_sessions" DROP CONSTRAINT IF EXISTS "dj_sessions_host_id_fkey";
ALTER TABLE "dj_sessions" ADD CONSTRAINT "dj_sessions_host_id_fkey"
    FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dj_sessions" DROP CONSTRAINT IF EXISTS "dj_sessions_current_dj_id_fkey";
ALTER TABLE "dj_sessions" ADD CONSTRAINT "dj_sessions_current_dj_id_fkey"
    FOREIGN KEY ("current_dj_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Queue Items
ALTER TABLE "queue_items" DROP CONSTRAINT IF EXISTS "queue_items_session_id_fkey";
ALTER TABLE "queue_items" ADD CONSTRAINT "queue_items_session_id_fkey"
    FOREIGN KEY ("session_id") REFERENCES "dj_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Votes
ALTER TABLE "votes" DROP CONSTRAINT IF EXISTS "votes_queue_item_id_fkey";
ALTER TABLE "votes" ADD CONSTRAINT "votes_queue_item_id_fkey"
    FOREIGN KEY ("queue_item_id") REFERENCES "queue_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- User Progression
ALTER TABLE "user_progression" DROP CONSTRAINT IF EXISTS "user_progression_user_id_fkey";
ALTER TABLE "user_progression" ADD CONSTRAINT "user_progression_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- User Badges
ALTER TABLE "user_badges" DROP CONSTRAINT IF EXISTS "user_badges_profile_fkey";
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_profile_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_badges" DROP CONSTRAINT IF EXISTS "user_badges_badge_id_fkey";
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey"
    FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_badges" DROP CONSTRAINT IF EXISTS "user_badges_progression_fkey";
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_progression_fkey"
    FOREIGN KEY ("user_id") REFERENCES "user_progression"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Direct Messages
ALTER TABLE "direct_messages" DROP CONSTRAINT IF EXISTS "direct_messages_conversation_id_fkey";
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_conversation_id_fkey"
    FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Marketplace Products
ALTER TABLE "marketplace_products" DROP CONSTRAINT IF EXISTS "marketplace_products_artist_id_fkey";
ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_artist_id_fkey"
    FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Purchases
ALTER TABLE "purchases" DROP CONSTRAINT IF EXISTS "purchases_product_id_fkey";
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "marketplace_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "purchases" DROP CONSTRAINT IF EXISTS "purchases_buyer_id_fkey";
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_buyer_id_fkey"
    FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Artist Revenue
ALTER TABLE "artist_revenue" DROP CONSTRAINT IF EXISTS "artist_revenue_artist_id_fkey";
ALTER TABLE "artist_revenue" ADD CONSTRAINT "artist_revenue_artist_id_fkey"
    FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Artist Analytics
ALTER TABLE "artist_analytics" DROP CONSTRAINT IF EXISTS "artist_analytics_artist_id_fkey";
ALTER TABLE "artist_analytics" ADD CONSTRAINT "artist_analytics_artist_id_fkey"
    FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fan Engagements
ALTER TABLE "fan_engagements" DROP CONSTRAINT IF EXISTS "fan_engagements_artist_id_fkey";
ALTER TABLE "fan_engagements" ADD CONSTRAINT "fan_engagements_artist_id_fkey"
    FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "fan_engagements" DROP CONSTRAINT IF EXISTS "fan_engagements_fan_id_fkey";
ALTER TABLE "fan_engagements" ADD CONSTRAINT "fan_engagements_fan_id_fkey"
    FOREIGN KEY ("fan_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================
-- VERIFICATION COMPLETE
-- =====================================================
SELECT 'Schema creation/update complete!' AS status;
