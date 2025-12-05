-- ===========================================
-- SEDA Production - FRESH START
-- WARNING: This drops ALL existing tables and recreates from scratch
-- Only use if there's no important data in the database!
-- ===========================================

-- Drop all tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS "direct_message_reactions" CASCADE;
DROP TABLE IF EXISTS "direct_messages" CASCADE;
DROP TABLE IF EXISTS "conversation_participants" CASCADE;
DROP TABLE IF EXISTS "conversations" CASCADE;
DROP TABLE IF EXISTS "fan_engagements" CASCADE;
DROP TABLE IF EXISTS "artist_analytics" CASCADE;
DROP TABLE IF EXISTS "artist_revenue" CASCADE;
DROP TABLE IF EXISTS "purchases" CASCADE;
DROP TABLE IF EXISTS "marketplace_products" CASCADE;
DROP TABLE IF EXISTS "moderation_logs" CASCADE;
DROP TABLE IF EXISTS "community_reports" CASCADE;
DROP TABLE IF EXISTS "ai_detection_results" CASCADE;
DROP TABLE IF EXISTS "track_refs" CASCADE;
DROP TABLE IF EXISTS "user_badges" CASCADE;
DROP TABLE IF EXISTS "badges" CASCADE;
DROP TABLE IF EXISTS "user_progression" CASCADE;
DROP TABLE IF EXISTS "votes" CASCADE;
DROP TABLE IF EXISTS "queue_items" CASCADE;
DROP TABLE IF EXISTS "dj_sessions" CASCADE;
DROP TABLE IF EXISTS "follows" CASCADE;
DROP TABLE IF EXISTS "reposts" CASCADE;
DROP TABLE IF EXISTS "likes" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "posts" CASCADE;
DROP TABLE IF EXISTS "playlist_collaborators" CASCADE;
DROP TABLE IF EXISTS "playlist_items" CASCADE;
DROP TABLE IF EXISTS "playlists" CASCADE;
DROP TABLE IF EXISTS "reactions" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "room_memberships" CASCADE;
DROP TABLE IF EXISTS "rooms" CASCADE;
DROP TABLE IF EXISTS "profiles" CASCADE;
DROP TABLE IF EXISTS "crawler_cache" CASCADE;
DROP TABLE IF EXISTS "admin_actions" CASCADE;
DROP TABLE IF EXISTS "verification_requests" CASCADE;
DROP TABLE IF EXISTS "artist_profiles" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS "PurchaseStatus" CASCADE;
DROP TYPE IF EXISTS "ProductStatus" CASCADE;
DROP TYPE IF EXISTS "ProductType" CASCADE;
DROP TYPE IF EXISTS "RoomMemberRole" CASCADE;
DROP TYPE IF EXISTS "AIDetectionStatus" CASCADE;
DROP TYPE IF EXISTS "BadgeCategory" CASCADE;
DROP TYPE IF EXISTS "BadgeRarity" CASCADE;
DROP TYPE IF EXISTS "VoteType" CASCADE;
DROP TYPE IF EXISTS "SessionStatus" CASCADE;
DROP TYPE IF EXISTS "LikeableType" CASCADE;
DROP TYPE IF EXISTS "PostType" CASCADE;
DROP TYPE IF EXISTS "ModerationAction" CASCADE;
DROP TYPE IF EXISTS "MessageType" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "VerificationStatus" CASCADE;

-- ============================================
-- CREATE ENUMS
-- ============================================

CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'CRAWLING', 'AWAITING_ADMIN', 'APPROVED', 'DENIED', 'EXPIRED');
CREATE TYPE "UserRole" AS ENUM ('USER', 'ARTIST', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'TRACK_CARD', 'SYSTEM', 'REPLY');
CREATE TYPE "ModerationAction" AS ENUM ('DELETE_MESSAGE', 'MUTE_USER', 'CLEAR_REACTIONS');
CREATE TYPE "PostType" AS ENUM ('TEXT', 'TRACK', 'CRATE', 'MEDIA');
CREATE TYPE "LikeableType" AS ENUM ('POST', 'COMMENT', 'CRATE');
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');
CREATE TYPE "BadgeRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
CREATE TYPE "BadgeCategory" AS ENUM ('ACTIVITY', 'SOCIAL', 'CURATOR', 'DISCOVERY', 'SPECIAL');
CREATE TYPE "AIDetectionStatus" AS ENUM ('PENDING', 'ANALYZING', 'VERIFIED_HUMAN', 'FLAGGED_AI', 'UNDER_REVIEW', 'REJECTED');
CREATE TYPE "RoomMemberRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN', 'OWNER');
CREATE TYPE "ProductType" AS ENUM ('DIGITAL_TRACK', 'DIGITAL_ALBUM', 'MERCHANDISE_LINK', 'CONCERT_LINK', 'PRESET_PACK', 'SAMPLE_PACK');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');

-- ============================================
-- CREATE TABLES
-- ============================================

CREATE TABLE "users" (
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

CREATE TABLE "artist_profiles" (
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

CREATE TABLE "verification_requests" (
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

CREATE TABLE "admin_actions" (
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

CREATE TABLE "crawler_cache" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content_hash" TEXT,
    "last_crawled" TIMESTAMP(3) NOT NULL,
    "response_data" JSONB,
    "status_code" INTEGER,
    "error" TEXT,
    CONSTRAINT "crawler_cache_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "profiles" (
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

CREATE TABLE "rooms" (
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

CREATE TABLE "room_memberships" (
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

CREATE TABLE "messages" (
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

CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "playlists" (
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

CREATE TABLE "playlist_items" (
    "id" TEXT NOT NULL,
    "playlist_id" TEXT NOT NULL,
    "track_ref" JSONB NOT NULL,
    "added_by_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playlist_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "playlist_collaborators" (
    "id" TEXT NOT NULL,
    "playlist_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playlist_collaborators_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "posts" (
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

CREATE TABLE "comments" (
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

CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "likeable_id" TEXT NOT NULL,
    "likeable_type" "LikeableType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reposts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reposts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dj_sessions" (
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

CREATE TABLE "queue_items" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "track_ref" JSONB NOT NULL,
    "added_by_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "queue_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "queue_item_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_progression" (
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

CREATE TABLE "badges" (
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

CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_displayed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_detection_results" (
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

CREATE TABLE "community_reports" (
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

CREATE TABLE "track_refs" (
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

CREATE TABLE "moderation_logs" (
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

CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),
    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "direct_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "direct_message_reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "direct_message_reactions_pkey" PRIMARY KEY ("id")
);

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

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_supabase_id_key" ON "users"("supabase_id");
CREATE INDEX "users_role_idx" ON "users"("role");

CREATE UNIQUE INDEX "artist_profiles_user_id_key" ON "artist_profiles"("user_id");
CREATE INDEX "artist_profiles_verified_idx" ON "artist_profiles"("verified");
CREATE INDEX "artist_profiles_stripe_account_id_idx" ON "artist_profiles"("stripe_account_id");

CREATE UNIQUE INDEX "verification_requests_claim_code_key" ON "verification_requests"("claim_code");
CREATE INDEX "verification_requests_user_id_idx" ON "verification_requests"("user_id");
CREATE INDEX "verification_requests_status_idx" ON "verification_requests"("status");

CREATE INDEX "admin_actions_admin_id_idx" ON "admin_actions"("admin_id");
CREATE INDEX "admin_actions_target_id_idx" ON "admin_actions"("target_id");
CREATE INDEX "admin_actions_created_at_idx" ON "admin_actions"("created_at");

CREATE UNIQUE INDEX "crawler_cache_url_key" ON "crawler_cache"("url");

CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

CREATE INDEX "rooms_owner_id_idx" ON "rooms"("owner_id");
CREATE INDEX "rooms_is_private_idx" ON "rooms"("is_private");
CREATE INDEX "rooms_created_at_idx" ON "rooms"("created_at");

CREATE UNIQUE INDEX "room_memberships_room_id_user_id_key" ON "room_memberships"("room_id", "user_id");
CREATE INDEX "room_memberships_user_id_idx" ON "room_memberships"("user_id");
CREATE INDEX "room_memberships_room_id_idx" ON "room_memberships"("room_id");

CREATE INDEX "messages_room_id_created_at_idx" ON "messages"("room_id", "created_at");
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

CREATE UNIQUE INDEX "reactions_message_id_user_id_emoji_key" ON "reactions"("message_id", "user_id", "emoji");

CREATE INDEX "playlists_owner_id_idx" ON "playlists"("owner_id");
CREATE INDEX "playlists_is_public_idx" ON "playlists"("is_public");

CREATE INDEX "playlist_items_playlist_id_position_idx" ON "playlist_items"("playlist_id", "position");

CREATE UNIQUE INDEX "playlist_collaborators_playlist_id_user_id_key" ON "playlist_collaborators"("playlist_id", "user_id");

CREATE INDEX "posts_author_id_created_at_idx" ON "posts"("author_id", "created_at");
CREATE INDEX "posts_type_idx" ON "posts"("type");

CREATE INDEX "comments_post_id_created_at_idx" ON "comments"("post_id", "created_at");
CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");

CREATE UNIQUE INDEX "likes_user_id_likeable_id_likeable_type_key" ON "likes"("user_id", "likeable_id", "likeable_type");

CREATE UNIQUE INDEX "reposts_user_id_post_id_key" ON "reposts"("user_id", "post_id");

CREATE UNIQUE INDEX "follows_follower_id_following_id_key" ON "follows"("follower_id", "following_id");
CREATE INDEX "follows_following_id_idx" ON "follows"("following_id");

CREATE INDEX "dj_sessions_host_id_idx" ON "dj_sessions"("host_id");
CREATE INDEX "dj_sessions_room_id_idx" ON "dj_sessions"("room_id");
CREATE INDEX "dj_sessions_status_idx" ON "dj_sessions"("status");

CREATE INDEX "queue_items_session_id_position_idx" ON "queue_items"("session_id", "position");

CREATE UNIQUE INDEX "votes_queue_item_id_user_id_key" ON "votes"("queue_item_id", "user_id");

CREATE UNIQUE INDEX "user_progression_user_id_key" ON "user_progression"("user_id");

CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");
CREATE INDEX "badges_category_idx" ON "badges"("category");
CREATE INDEX "badges_rarity_idx" ON "badges"("rarity");

CREATE UNIQUE INDEX "user_badges_user_id_badge_id_key" ON "user_badges"("user_id", "badge_id");

CREATE UNIQUE INDEX "ai_detection_results_track_ref_id_key" ON "ai_detection_results"("track_ref_id");
CREATE INDEX "ai_detection_results_status_idx" ON "ai_detection_results"("status");

CREATE INDEX "community_reports_track_ref_id_idx" ON "community_reports"("track_ref_id");
CREATE INDEX "community_reports_status_idx" ON "community_reports"("status");

CREATE UNIQUE INDEX "track_refs_platform_platform_id_key" ON "track_refs"("platform", "platform_id");
CREATE INDEX "track_refs_ai_status_idx" ON "track_refs"("ai_status");

CREATE INDEX "moderation_logs_room_id_idx" ON "moderation_logs"("room_id");
CREATE INDEX "moderation_logs_moderator_id_idx" ON "moderation_logs"("moderator_id");

CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");
CREATE INDEX "conversation_participants_user_id_idx" ON "conversation_participants"("user_id");

CREATE INDEX "direct_messages_conversation_id_created_at_idx" ON "direct_messages"("conversation_id", "created_at");
CREATE INDEX "direct_messages_sender_id_idx" ON "direct_messages"("sender_id");

CREATE UNIQUE INDEX "direct_message_reactions_message_id_user_id_emoji_key" ON "direct_message_reactions"("message_id", "user_id", "emoji");

CREATE INDEX "marketplace_products_artist_id_status_idx" ON "marketplace_products"("artist_id", "status");
CREATE INDEX "marketplace_products_type_status_idx" ON "marketplace_products"("type", "status");
CREATE INDEX "marketplace_products_created_at_idx" ON "marketplace_products"("created_at");

CREATE INDEX "purchases_product_id_idx" ON "purchases"("product_id");
CREATE INDEX "purchases_buyer_id_created_at_idx" ON "purchases"("buyer_id", "created_at");
CREATE INDEX "purchases_status_idx" ON "purchases"("status");

CREATE INDEX "artist_revenue_artist_id_idx" ON "artist_revenue"("artist_id");
CREATE UNIQUE INDEX "artist_revenue_artist_id_current_month_current_year_key" ON "artist_revenue"("artist_id", "current_month", "current_year");

CREATE INDEX "artist_analytics_artist_id_date_idx" ON "artist_analytics"("artist_id", "date");
CREATE UNIQUE INDEX "artist_analytics_artist_id_date_key" ON "artist_analytics"("artist_id", "date");

CREATE INDEX "fan_engagements_artist_id_last_engagement_idx" ON "fan_engagements"("artist_id", "last_engagement");
CREATE INDEX "fan_engagements_fan_id_idx" ON "fan_engagements"("fan_id");
CREATE UNIQUE INDEX "fan_engagements_artist_id_fan_id_key" ON "fan_engagements"("artist_id", "fan_id");

-- Full-text search indexes
CREATE INDEX "users_email_search_idx" ON "users" USING GIN (to_tsvector('english', email));
CREATE INDEX "profiles_username_search_idx" ON "profiles" USING GIN (to_tsvector('english', username));
CREATE INDEX "profiles_display_name_search_idx" ON "profiles" USING GIN (to_tsvector('english', COALESCE(display_name, '')));
CREATE INDEX "profiles_bio_search_idx" ON "profiles" USING GIN (to_tsvector('english', COALESCE(bio, '')));
CREATE INDEX "artist_profiles_artist_name_search_idx" ON "artist_profiles" USING GIN (to_tsvector('english', artist_name));
CREATE INDEX "artist_profiles_bio_search_idx" ON "artist_profiles" USING GIN (to_tsvector('english', COALESCE(bio, '')));
CREATE INDEX "rooms_name_search_idx" ON "rooms" USING GIN (to_tsvector('english', name));
CREATE INDEX "rooms_description_search_idx" ON "rooms" USING GIN (to_tsvector('english', COALESCE(description, '')));
CREATE INDEX "playlists_name_search_idx" ON "playlists" USING GIN (to_tsvector('english', name));
CREATE INDEX "playlists_description_search_idx" ON "playlists" USING GIN (to_tsvector('english', COALESCE(description, '')));
CREATE INDEX "posts_content_search_idx" ON "posts" USING GIN (to_tsvector('english', COALESCE(content, '')));
CREATE INDEX "track_refs_title_search_idx" ON "track_refs" USING GIN (to_tsvector('english', title));
CREATE INDEX "track_refs_artist_search_idx" ON "track_refs" USING GIN (to_tsvector('english', artist));

-- ============================================
-- ADD FOREIGN KEYS
-- ============================================

ALTER TABLE "artist_profiles" ADD CONSTRAINT "artist_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "room_memberships" ADD CONSTRAINT "room_memberships_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "room_memberships" ADD CONSTRAINT "room_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "playlist_collaborators" ADD CONSTRAINT "playlist_collaborators_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "playlist_collaborators" ADD CONSTRAINT "playlist_collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reposts" ADD CONSTRAINT "reposts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reposts" ADD CONSTRAINT "reposts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dj_sessions" ADD CONSTRAINT "dj_sessions_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dj_sessions" ADD CONSTRAINT "dj_sessions_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "queue_items" ADD CONSTRAINT "queue_items_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "dj_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "queue_items" ADD CONSTRAINT "queue_items_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "votes" ADD CONSTRAINT "votes_queue_item_id_fkey" FOREIGN KEY ("queue_item_id") REFERENCES "queue_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_progression" ADD CONSTRAINT "user_progression_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_detection_results" ADD CONSTRAINT "ai_detection_results_track_ref_id_fkey" FOREIGN KEY ("track_ref_id") REFERENCES "track_refs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_track_ref_id_fkey" FOREIGN KEY ("track_ref_id") REFERENCES "track_refs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "direct_message_reactions" ADD CONSTRAINT "direct_message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "direct_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "direct_message_reactions" ADD CONSTRAINT "direct_message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "artist_revenue" ADD CONSTRAINT "artist_revenue_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "artist_analytics" ADD CONSTRAINT "artist_analytics_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fan_engagements" ADD CONSTRAINT "fan_engagements_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fan_engagements" ADD CONSTRAINT "fan_engagements_fan_id_fkey" FOREIGN KEY ("fan_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- DONE!
-- ============================================
SELECT 'Fresh database schema created successfully!' as status;
