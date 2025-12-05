-- SEDA Database Setup Script
-- Run this in Supabase SQL Editor to set up the complete database schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'CRAWLING', 'AWAITING_ADMIN', 'APPROVED', 'DENIED', 'EXPIRED');
CREATE TYPE "UserRole" AS ENUM ('USER', 'ARTIST', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'TRACK_CARD', 'SYSTEM', 'REPLY');
CREATE TYPE "ModerationAction" AS ENUM ('DELETE_MESSAGE', 'MUTE_USER', 'CLEAR_REACTIONS');

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "supabase_id" TEXT UNIQUE NOT NULL,
    "role" "UserRole" DEFAULT 'USER' NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "muted_until" TIMESTAMP WITH TIME ZONE
);

-- Artist profiles table
CREATE TABLE IF NOT EXISTS "artist_profiles" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "user_id" UUID UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "artist_name" TEXT NOT NULL,
    "bio" TEXT,
    "verified" BOOLEAN DEFAULT false NOT NULL,
    "verified_at" TIMESTAMP WITH TIME ZONE,
    "website_url" TEXT,
    "spotify_url" TEXT,
    "bandcamp_url" TEXT,
    "soundcloud_url" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Verification requests table
CREATE TABLE IF NOT EXISTS "verification_requests" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "claim_code" TEXT UNIQUE NOT NULL,
    "target_url" TEXT,
    "status" "VerificationStatus" DEFAULT 'PENDING' NOT NULL,
    "submitted_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "crawled_at" TIMESTAMP WITH TIME ZONE,
    "reviewed_at" TIMESTAMP WITH TIME ZONE,
    "reviewed_by" UUID REFERENCES "users"("id"),
    "denial_reason" TEXT,
    "crawler_response" JSONB,
    "metadata" JSONB
);

-- Admin actions table
CREATE TABLE IF NOT EXISTS "admin_actions" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "admin_id" UUID NOT NULL REFERENCES "users"("id"),
    "action" TEXT NOT NULL,
    "target_id" UUID,
    "target_type" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Crawler cache table
CREATE TABLE IF NOT EXISTS "crawler_cache" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "url" TEXT UNIQUE NOT NULL,
    "content" TEXT,
    "status_code" INTEGER,
    "headers" JSONB,
    "crawled_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Rooms table
CREATE TABLE IF NOT EXISTS "rooms" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_private" BOOLEAN DEFAULT false NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Room memberships table
CREATE TABLE IF NOT EXISTS "room_memberships" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "room_id" UUID NOT NULL REFERENCES "rooms"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "is_mod" BOOLEAN DEFAULT false NOT NULL,
    "joined_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE("room_id", "user_id")
);

-- Messages table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "room_id" UUID NOT NULL REFERENCES "rooms"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" "MessageType" DEFAULT 'TEXT' NOT NULL,
    "text" TEXT,
    "track_ref" JSONB,
    "parent_id" UUID REFERENCES "messages"("id"),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- Reactions table
CREATE TABLE IF NOT EXISTS "reactions" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "message_id" UUID NOT NULL REFERENCES "messages"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE("message_id", "user_id", "emoji")
);

-- Track references table
CREATE TABLE IF NOT EXISTS "track_refs" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "url" TEXT UNIQUE NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artwork" TEXT,
    "duration" INTEGER,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE("provider", "provider_id")
);

-- Profiles table (Wave A)
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "user_id" UUID UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "username" TEXT UNIQUE NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Playlists table
CREATE TABLE IF NOT EXISTS "playlists" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "owner_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN DEFAULT true NOT NULL,
    "is_collaborative" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Playlist collaborators table
CREATE TABLE IF NOT EXISTS "playlist_collaborators" (
    "playlist_id" UUID NOT NULL REFERENCES "playlists"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role" TEXT DEFAULT 'contributor' NOT NULL,
    "added_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY("playlist_id", "user_id")
);

-- Playlist items table
CREATE TABLE IF NOT EXISTS "playlist_items" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "playlist_id" UUID NOT NULL REFERENCES "playlists"("id") ON DELETE CASCADE,
    "position" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_track_id" TEXT NOT NULL,
    "title" TEXT,
    "artist" TEXT,
    "artwork_url" TEXT,
    "added_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "added_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE("playlist_id", "position")
);

-- Moderation logs table
CREATE TABLE IF NOT EXISTS "moderation_logs" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "room_id" UUID NOT NULL,
    "moderator_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Feature flags table
CREATE TABLE IF NOT EXISTS "feature_flags" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "environment" TEXT NOT NULL CHECK (environment IN ('qa', 'sandbox', 'production')),
    "description" TEXT,
    "rollout_percentage" DECIMAL(5,2) CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("key", "environment")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_artist_profiles_verified" ON "artist_profiles"("verified");
CREATE INDEX IF NOT EXISTS "idx_artist_profiles_artist_name" ON "artist_profiles"("artist_name");
CREATE INDEX IF NOT EXISTS "idx_verification_requests_status" ON "verification_requests"("status");
CREATE INDEX IF NOT EXISTS "idx_verification_requests_user_id" ON "verification_requests"("user_id");
CREATE INDEX IF NOT EXISTS "idx_verification_requests_claim_code" ON "verification_requests"("claim_code");
CREATE INDEX IF NOT EXISTS "idx_verification_requests_expires_at" ON "verification_requests"("expires_at");
CREATE INDEX IF NOT EXISTS "idx_admin_actions_admin_id" ON "admin_actions"("admin_id");
CREATE INDEX IF NOT EXISTS "idx_admin_actions_target_id" ON "admin_actions"("target_id");
CREATE INDEX IF NOT EXISTS "idx_admin_actions_created_at" ON "admin_actions"("created_at");
CREATE INDEX IF NOT EXISTS "idx_crawler_cache_url" ON "crawler_cache"("url");
CREATE INDEX IF NOT EXISTS "idx_crawler_cache_expires_at" ON "crawler_cache"("expires_at");
CREATE INDEX IF NOT EXISTS "idx_rooms_is_private" ON "rooms"("is_private");
CREATE INDEX IF NOT EXISTS "idx_rooms_created_at" ON "rooms"("created_at");
CREATE INDEX IF NOT EXISTS "idx_room_memberships_room_id" ON "room_memberships"("room_id");
CREATE INDEX IF NOT EXISTS "idx_room_memberships_user_id" ON "room_memberships"("user_id");
CREATE INDEX IF NOT EXISTS "idx_messages_room_id_created_at" ON "messages"("room_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_messages_user_id" ON "messages"("user_id");
CREATE INDEX IF NOT EXISTS "idx_messages_parent_id" ON "messages"("parent_id");
CREATE INDEX IF NOT EXISTS "idx_messages_deleted_at" ON "messages"("deleted_at");
CREATE INDEX IF NOT EXISTS "idx_reactions_message_id" ON "reactions"("message_id");
CREATE INDEX IF NOT EXISTS "idx_reactions_user_id" ON "reactions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_track_refs_provider" ON "track_refs"("provider");
CREATE INDEX IF NOT EXISTS "idx_track_refs_url" ON "track_refs"("url");
CREATE INDEX IF NOT EXISTS "idx_profiles_username" ON "profiles"("username");
CREATE INDEX IF NOT EXISTS "idx_playlists_owner_user_id" ON "playlists"("owner_user_id");
CREATE INDEX IF NOT EXISTS "idx_playlists_is_public" ON "playlists"("is_public");
CREATE INDEX IF NOT EXISTS "idx_playlist_items_playlist_id" ON "playlist_items"("playlist_id");
CREATE INDEX IF NOT EXISTS "idx_playlist_items_added_by_user_id" ON "playlist_items"("added_by_user_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_room_id" ON "moderation_logs"("room_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_moderator_id" ON "moderation_logs"("moderator_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_target_id" ON "moderation_logs"("target_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_created_at" ON "moderation_logs"("created_at");
CREATE INDEX IF NOT EXISTS "idx_feature_flags_key_env" ON "feature_flags"("key", "environment");
CREATE INDEX IF NOT EXISTS "idx_feature_flags_environment" ON "feature_flags"("environment");

-- Enable Row Level Security
ALTER TABLE "feature_flags" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature flags
CREATE POLICY "Service role can manage feature flags" ON "feature_flags"
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can read feature flags" ON "feature_flags"
    FOR SELECT USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON "feature_flags"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_profiles_updated_at
    BEFORE UPDATE ON "artist_profiles"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON "rooms"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON "messages"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_track_refs_updated_at
    BEFORE UPDATE ON "track_refs"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON "profiles"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at
    BEFORE UPDATE ON "playlists"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default feature flags for sandbox environment
INSERT INTO "feature_flags" ("key", "enabled", "environment", "description") VALUES
    ('artist_verification', true, 'sandbox', 'Enable artist verification flow'),
    ('admin_dashboard', true, 'sandbox', 'Enable admin dashboard features'),
    ('posthog_analytics', true, 'sandbox', 'Enable PostHog analytics tracking'),
    ('rate_limiting', true, 'sandbox', 'Enable rate limiting for API endpoints'),
    ('chat_system', true, 'sandbox', 'Enable real-time chat functionality'),
    ('track_cards', true, 'sandbox', 'Enable track card sharing in chat'),
    ('reactions', true, 'sandbox', 'Enable message reactions'),
    ('playlists', true, 'sandbox', 'Enable playlist creation and management'),
    ('profiles', true, 'sandbox', 'Enable user profiles'),
    ('leaderboards', true, 'sandbox', 'Enable DJ point leaderboards'),
    ('trophy_case', true, 'sandbox', 'Enable trophy case and badges'),
    ('dj_points', true, 'sandbox', 'Enable DJ point progression system')
ON CONFLICT ("key", "environment") DO NOTHING;

-- Create a default room for testing
INSERT INTO "rooms" ("id", "name", "description", "created_by") VALUES
    (uuid_generate_v4(), 'General', 'Main chat room for all users', uuid_generate_v4())
ON CONFLICT DO NOTHING;