-- =========================================
-- SUPABASE RLS POLICIES - APPLY MANUALLY
-- =========================================
-- Run this script in Supabase SQL Editor to enable RLS on all tables
-- and create appropriate access policies.
--
-- IMPORTANT: The backend uses a service role key which bypasses RLS.
-- These policies secure direct client access to Supabase.
-- =========================================

-- ====================================
-- ENABLE RLS ON ALL TABLES
-- ====================================

-- User & Auth tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "artist_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_actions" ENABLE ROW LEVEL SECURITY;

-- Room & Chat tables
ALTER TABLE "rooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "room_memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "moderation_logs" ENABLE ROW LEVEL SECURITY;

-- Social Feed tables
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reposts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "follows" ENABLE ROW LEVEL SECURITY;

-- Playlist/Crate tables
ALTER TABLE "playlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "playlist_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "playlist_collaborators" ENABLE ROW LEVEL SECURITY;

-- DJ Session tables
ALTER TABLE "dj_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "queue_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "votes" ENABLE ROW LEVEL SECURITY;

-- Marketplace tables
ALTER TABLE "marketplace_products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "purchases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "artist_revenue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "artist_analytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fan_engagements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "artist_payouts" ENABLE ROW LEVEL SECURITY;

-- Progression & Badges tables
ALTER TABLE "user_progression" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_badges" ENABLE ROW LEVEL SECURITY;

-- Messaging tables
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "direct_messages" ENABLE ROW LEVEL SECURITY;

-- AI Detection tables
ALTER TABLE "ai_detection_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "community_reports" ENABLE ROW LEVEL SECURITY;

-- Streaming & Integration tables
ALTER TABLE "streaming_connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shopify_connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shopify_products" ENABLE ROW LEVEL SECURITY;

-- Merch Drop tables
ALTER TABLE "merch_drops" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "merch_drop_items" ENABLE ROW LEVEL SECURITY;

-- Utility tables
ALTER TABLE "track_refs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crawler_cache" ENABLE ROW LEVEL SECURITY;

-- ====================================
-- HELPER FUNCTION
-- ====================================

-- Helper function to get internal user ID from Supabase auth ID
CREATE OR REPLACE FUNCTION get_user_id_from_auth()
RETURNS TEXT AS $$
  SELECT id FROM users WHERE supabase_id = auth.uid()::text;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ====================================
-- DROP EXISTING POLICIES (for clean re-run)
-- ====================================

-- Users
DROP POLICY IF EXISTS "users_select_own" ON "users";
DROP POLICY IF EXISTS "users_update_own" ON "users";

-- Profiles
DROP POLICY IF EXISTS "profiles_select_public" ON "profiles";
DROP POLICY IF EXISTS "profiles_update_own" ON "profiles";
DROP POLICY IF EXISTS "profiles_insert_own" ON "profiles";

-- Artist Profiles
DROP POLICY IF EXISTS "artist_profiles_select_public" ON "artist_profiles";
DROP POLICY IF EXISTS "artist_profiles_update_own" ON "artist_profiles";

-- Rooms
DROP POLICY IF EXISTS "rooms_select_public" ON "rooms";
DROP POLICY IF EXISTS "rooms_update_owner" ON "rooms";
DROP POLICY IF EXISTS "rooms_delete_owner" ON "rooms";
DROP POLICY IF EXISTS "rooms_insert_authenticated" ON "rooms";

-- Room Memberships
DROP POLICY IF EXISTS "room_memberships_select" ON "room_memberships";
DROP POLICY IF EXISTS "room_memberships_insert_own" ON "room_memberships";
DROP POLICY IF EXISTS "room_memberships_delete_own" ON "room_memberships";

-- Messages
DROP POLICY IF EXISTS "messages_select" ON "messages";
DROP POLICY IF EXISTS "messages_insert" ON "messages";
DROP POLICY IF EXISTS "messages_update_own" ON "messages";
DROP POLICY IF EXISTS "messages_delete_own" ON "messages";

-- Reactions
DROP POLICY IF EXISTS "reactions_select" ON "reactions";
DROP POLICY IF EXISTS "reactions_insert" ON "reactions";
DROP POLICY IF EXISTS "reactions_delete_own" ON "reactions";

-- Posts
DROP POLICY IF EXISTS "posts_select_public" ON "posts";
DROP POLICY IF EXISTS "posts_insert_own" ON "posts";
DROP POLICY IF EXISTS "posts_update_own" ON "posts";
DROP POLICY IF EXISTS "posts_delete_own" ON "posts";

-- Comments
DROP POLICY IF EXISTS "comments_select_public" ON "comments";
DROP POLICY IF EXISTS "comments_insert" ON "comments";
DROP POLICY IF EXISTS "comments_update_own" ON "comments";
DROP POLICY IF EXISTS "comments_delete_own" ON "comments";

-- Likes
DROP POLICY IF EXISTS "likes_select_public" ON "likes";
DROP POLICY IF EXISTS "likes_insert_own" ON "likes";
DROP POLICY IF EXISTS "likes_delete_own" ON "likes";

-- Reposts
DROP POLICY IF EXISTS "reposts_select_public" ON "reposts";
DROP POLICY IF EXISTS "reposts_insert_own" ON "reposts";
DROP POLICY IF EXISTS "reposts_delete_own" ON "reposts";

-- Follows
DROP POLICY IF EXISTS "follows_select_public" ON "follows";
DROP POLICY IF EXISTS "follows_insert_own" ON "follows";
DROP POLICY IF EXISTS "follows_delete_own" ON "follows";

-- Playlists
DROP POLICY IF EXISTS "playlists_select_public" ON "playlists";
DROP POLICY IF EXISTS "playlists_insert_own" ON "playlists";
DROP POLICY IF EXISTS "playlists_update_own" ON "playlists";
DROP POLICY IF EXISTS "playlists_delete_own" ON "playlists";

-- Playlist Items
DROP POLICY IF EXISTS "playlist_items_select" ON "playlist_items";
DROP POLICY IF EXISTS "playlist_items_insert" ON "playlist_items";
DROP POLICY IF EXISTS "playlist_items_delete" ON "playlist_items";

-- Playlist Collaborators
DROP POLICY IF EXISTS "playlist_collaborators_select" ON "playlist_collaborators";
DROP POLICY IF EXISTS "playlist_collaborators_insert" ON "playlist_collaborators";
DROP POLICY IF EXISTS "playlist_collaborators_delete" ON "playlist_collaborators";

-- DJ Sessions
DROP POLICY IF EXISTS "dj_sessions_select" ON "dj_sessions";
DROP POLICY IF EXISTS "dj_sessions_insert" ON "dj_sessions";
DROP POLICY IF EXISTS "dj_sessions_update" ON "dj_sessions";
DROP POLICY IF EXISTS "dj_sessions_delete" ON "dj_sessions";

-- Queue Items
DROP POLICY IF EXISTS "queue_items_select" ON "queue_items";
DROP POLICY IF EXISTS "queue_items_insert" ON "queue_items";
DROP POLICY IF EXISTS "queue_items_update" ON "queue_items";
DROP POLICY IF EXISTS "queue_items_delete" ON "queue_items";

-- Votes
DROP POLICY IF EXISTS "votes_select" ON "votes";
DROP POLICY IF EXISTS "votes_insert" ON "votes";
DROP POLICY IF EXISTS "votes_update_own" ON "votes";
DROP POLICY IF EXISTS "votes_delete_own" ON "votes";

-- Marketplace Products
DROP POLICY IF EXISTS "marketplace_products_select_public" ON "marketplace_products";
DROP POLICY IF EXISTS "marketplace_products_insert" ON "marketplace_products";
DROP POLICY IF EXISTS "marketplace_products_update" ON "marketplace_products";
DROP POLICY IF EXISTS "marketplace_products_delete" ON "marketplace_products";

-- Purchases
DROP POLICY IF EXISTS "purchases_select" ON "purchases";
DROP POLICY IF EXISTS "purchases_insert" ON "purchases";
DROP POLICY IF EXISTS "purchases_update" ON "purchases";

-- Revenue & Analytics
DROP POLICY IF EXISTS "artist_revenue_select" ON "artist_revenue";
DROP POLICY IF EXISTS "artist_analytics_select" ON "artist_analytics";
DROP POLICY IF EXISTS "fan_engagements_select" ON "fan_engagements";
DROP POLICY IF EXISTS "artist_payouts_select" ON "artist_payouts";

-- Progression
DROP POLICY IF EXISTS "user_progression_select" ON "user_progression";
DROP POLICY IF EXISTS "badges_select_public" ON "badges";
DROP POLICY IF EXISTS "user_badges_select_public" ON "user_badges";

-- Messaging
DROP POLICY IF EXISTS "conversations_select" ON "conversations";
DROP POLICY IF EXISTS "conversations_insert" ON "conversations";
DROP POLICY IF EXISTS "direct_messages_select" ON "direct_messages";
DROP POLICY IF EXISTS "direct_messages_insert" ON "direct_messages";
DROP POLICY IF EXISTS "direct_messages_update" ON "direct_messages";

-- AI Detection
DROP POLICY IF EXISTS "ai_detection_results_select" ON "ai_detection_results";
DROP POLICY IF EXISTS "community_reports_select" ON "community_reports";
DROP POLICY IF EXISTS "community_reports_insert" ON "community_reports";

-- Streaming Connections
DROP POLICY IF EXISTS "streaming_connections_select_own" ON "streaming_connections";
DROP POLICY IF EXISTS "streaming_connections_insert_own" ON "streaming_connections";
DROP POLICY IF EXISTS "streaming_connections_update_own" ON "streaming_connections";
DROP POLICY IF EXISTS "streaming_connections_delete_own" ON "streaming_connections";

-- Shopify
DROP POLICY IF EXISTS "shopify_connections_select_own" ON "shopify_connections";
DROP POLICY IF EXISTS "shopify_connections_update_own" ON "shopify_connections";
DROP POLICY IF EXISTS "shopify_connections_delete_own" ON "shopify_connections";
DROP POLICY IF EXISTS "shopify_products_select_public" ON "shopify_products";
DROP POLICY IF EXISTS "shopify_products_select_own" ON "shopify_products";

-- Merch Drops
DROP POLICY IF EXISTS "merch_drops_select_public" ON "merch_drops";
DROP POLICY IF EXISTS "merch_drops_insert" ON "merch_drops";
DROP POLICY IF EXISTS "merch_drops_update" ON "merch_drops";
DROP POLICY IF EXISTS "merch_drops_delete" ON "merch_drops";
DROP POLICY IF EXISTS "merch_drop_items_select" ON "merch_drop_items";
DROP POLICY IF EXISTS "merch_drop_items_insert" ON "merch_drop_items";
DROP POLICY IF EXISTS "merch_drop_items_update" ON "merch_drop_items";
DROP POLICY IF EXISTS "merch_drop_items_delete" ON "merch_drop_items";

-- Utility
DROP POLICY IF EXISTS "track_refs_select_public" ON "track_refs";
DROP POLICY IF EXISTS "verification_requests_select" ON "verification_requests";
DROP POLICY IF EXISTS "verification_requests_insert" ON "verification_requests";
DROP POLICY IF EXISTS "moderation_logs_select" ON "moderation_logs";

-- ====================================
-- CREATE RLS POLICIES
-- ====================================

-- ====================================
-- USERS TABLE POLICIES
-- ====================================

CREATE POLICY "users_select_own" ON "users"
  FOR SELECT USING (supabase_id = auth.uid()::text);

CREATE POLICY "users_update_own" ON "users"
  FOR UPDATE USING (supabase_id = auth.uid()::text);

-- ====================================
-- PROFILES TABLE POLICIES
-- ====================================

CREATE POLICY "profiles_select_public" ON "profiles"
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON "profiles"
  FOR UPDATE USING (user_id = get_user_id_from_auth());

CREATE POLICY "profiles_insert_own" ON "profiles"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

-- ====================================
-- ARTIST PROFILES TABLE POLICIES
-- ====================================

CREATE POLICY "artist_profiles_select_public" ON "artist_profiles"
  FOR SELECT USING (true);

CREATE POLICY "artist_profiles_update_own" ON "artist_profiles"
  FOR UPDATE USING (user_id = get_user_id_from_auth());

-- ====================================
-- ROOMS TABLE POLICIES
-- ====================================

CREATE POLICY "rooms_select_public" ON "rooms"
  FOR SELECT USING (is_private = false OR created_by = get_user_id_from_auth());

CREATE POLICY "rooms_update_owner" ON "rooms"
  FOR UPDATE USING (created_by = get_user_id_from_auth());

CREATE POLICY "rooms_delete_owner" ON "rooms"
  FOR DELETE USING (created_by = get_user_id_from_auth());

CREATE POLICY "rooms_insert_authenticated" ON "rooms"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ====================================
-- ROOM MEMBERSHIPS TABLE POLICIES
-- ====================================

CREATE POLICY "room_memberships_select" ON "room_memberships"
  FOR SELECT USING (
    user_id = get_user_id_from_auth() OR
    room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
  );

CREATE POLICY "room_memberships_insert_own" ON "room_memberships"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

CREATE POLICY "room_memberships_delete_own" ON "room_memberships"
  FOR DELETE USING (user_id = get_user_id_from_auth());

-- ====================================
-- MESSAGES TABLE POLICIES
-- ====================================

CREATE POLICY "messages_select" ON "messages"
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
    OR room_id IN (SELECT id FROM rooms WHERE is_private = false)
  );

CREATE POLICY "messages_insert" ON "messages"
  FOR INSERT WITH CHECK (
    user_id = get_user_id_from_auth() AND
    (room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
     OR room_id IN (SELECT id FROM rooms WHERE is_private = false))
  );

CREATE POLICY "messages_update_own" ON "messages"
  FOR UPDATE USING (user_id = get_user_id_from_auth());

CREATE POLICY "messages_delete_own" ON "messages"
  FOR DELETE USING (user_id = get_user_id_from_auth());

-- ====================================
-- REACTIONS TABLE POLICIES
-- ====================================

CREATE POLICY "reactions_select" ON "reactions"
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM messages WHERE
        room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
        OR room_id IN (SELECT id FROM rooms WHERE is_private = false)
    )
  );

CREATE POLICY "reactions_insert" ON "reactions"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

CREATE POLICY "reactions_delete_own" ON "reactions"
  FOR DELETE USING (user_id = get_user_id_from_auth());

-- ====================================
-- POSTS TABLE POLICIES
-- ====================================

CREATE POLICY "posts_select_public" ON "posts"
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "posts_insert_own" ON "posts"
  FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

CREATE POLICY "posts_update_own" ON "posts"
  FOR UPDATE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

CREATE POLICY "posts_delete_own" ON "posts"
  FOR DELETE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- ====================================
-- COMMENTS TABLE POLICIES
-- ====================================

CREATE POLICY "comments_select_public" ON "comments"
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "comments_insert" ON "comments"
  FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

CREATE POLICY "comments_update_own" ON "comments"
  FOR UPDATE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

CREATE POLICY "comments_delete_own" ON "comments"
  FOR DELETE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- ====================================
-- LIKES TABLE POLICIES
-- ====================================

CREATE POLICY "likes_select_public" ON "likes"
  FOR SELECT USING (true);

CREATE POLICY "likes_insert_own" ON "likes"
  FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

CREATE POLICY "likes_delete_own" ON "likes"
  FOR DELETE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- ====================================
-- REPOSTS TABLE POLICIES
-- ====================================

CREATE POLICY "reposts_select_public" ON "reposts"
  FOR SELECT USING (true);

CREATE POLICY "reposts_insert_own" ON "reposts"
  FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

CREATE POLICY "reposts_delete_own" ON "reposts"
  FOR DELETE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- ====================================
-- FOLLOWS TABLE POLICIES
-- ====================================

CREATE POLICY "follows_select_public" ON "follows"
  FOR SELECT USING (true);

CREATE POLICY "follows_insert_own" ON "follows"
  FOR INSERT WITH CHECK (follower_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

CREATE POLICY "follows_delete_own" ON "follows"
  FOR DELETE USING (follower_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- ====================================
-- PLAYLISTS (CRATES) TABLE POLICIES
-- ====================================

CREATE POLICY "playlists_select_public" ON "playlists"
  FOR SELECT USING (
    is_public = true OR
    owner_user_id = get_user_id_from_auth() OR
    id IN (SELECT playlist_id FROM playlist_collaborators WHERE user_id = get_user_id_from_auth())
  );

CREATE POLICY "playlists_insert_own" ON "playlists"
  FOR INSERT WITH CHECK (owner_user_id = get_user_id_from_auth());

CREATE POLICY "playlists_update_own" ON "playlists"
  FOR UPDATE USING (owner_user_id = get_user_id_from_auth());

CREATE POLICY "playlists_delete_own" ON "playlists"
  FOR DELETE USING (owner_user_id = get_user_id_from_auth());

-- ====================================
-- PLAYLIST ITEMS TABLE POLICIES
-- ====================================

CREATE POLICY "playlist_items_select" ON "playlist_items"
  FOR SELECT USING (
    playlist_id IN (
      SELECT id FROM playlists WHERE
        is_public = true OR
        owner_user_id = get_user_id_from_auth() OR
        id IN (SELECT playlist_id FROM playlist_collaborators WHERE user_id = get_user_id_from_auth())
    )
  );

CREATE POLICY "playlist_items_insert" ON "playlist_items"
  FOR INSERT WITH CHECK (
    added_by_user_id = get_user_id_from_auth() AND
    playlist_id IN (
      SELECT id FROM playlists WHERE
        owner_user_id = get_user_id_from_auth() OR
        (is_collaborative = true AND id IN (SELECT playlist_id FROM playlist_collaborators WHERE user_id = get_user_id_from_auth()))
    )
  );

CREATE POLICY "playlist_items_delete" ON "playlist_items"
  FOR DELETE USING (
    playlist_id IN (SELECT id FROM playlists WHERE owner_user_id = get_user_id_from_auth())
    OR added_by_user_id = get_user_id_from_auth()
  );

-- ====================================
-- PLAYLIST COLLABORATORS TABLE POLICIES
-- ====================================

CREATE POLICY "playlist_collaborators_select" ON "playlist_collaborators"
  FOR SELECT USING (
    playlist_id IN (
      SELECT id FROM playlists WHERE
        owner_user_id = get_user_id_from_auth() OR
        id IN (SELECT playlist_id FROM playlist_collaborators WHERE user_id = get_user_id_from_auth())
    )
  );

CREATE POLICY "playlist_collaborators_insert" ON "playlist_collaborators"
  FOR INSERT WITH CHECK (
    playlist_id IN (SELECT id FROM playlists WHERE owner_user_id = get_user_id_from_auth())
  );

CREATE POLICY "playlist_collaborators_delete" ON "playlist_collaborators"
  FOR DELETE USING (
    playlist_id IN (SELECT id FROM playlists WHERE owner_user_id = get_user_id_from_auth())
    OR user_id = get_user_id_from_auth()
  );

-- ====================================
-- DJ SESSIONS TABLE POLICIES
-- ====================================

CREATE POLICY "dj_sessions_select" ON "dj_sessions"
  FOR SELECT USING (
    is_private = false OR
    host_id = get_user_id_from_auth() OR
    room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
  );

CREATE POLICY "dj_sessions_insert" ON "dj_sessions"
  FOR INSERT WITH CHECK (host_id = get_user_id_from_auth());

CREATE POLICY "dj_sessions_update" ON "dj_sessions"
  FOR UPDATE USING (host_id = get_user_id_from_auth());

CREATE POLICY "dj_sessions_delete" ON "dj_sessions"
  FOR DELETE USING (host_id = get_user_id_from_auth());

-- ====================================
-- QUEUE ITEMS TABLE POLICIES
-- ====================================

CREATE POLICY "queue_items_select" ON "queue_items"
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM dj_sessions WHERE
        is_private = false OR
        host_id = get_user_id_from_auth() OR
        room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
    )
  );

CREATE POLICY "queue_items_insert" ON "queue_items"
  FOR INSERT WITH CHECK (
    added_by = get_user_id_from_auth() AND
    session_id IN (
      SELECT id FROM dj_sessions WHERE
        is_private = false OR
        host_id = get_user_id_from_auth() OR
        room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
    )
  );

CREATE POLICY "queue_items_update" ON "queue_items"
  FOR UPDATE USING (
    session_id IN (SELECT id FROM dj_sessions WHERE host_id = get_user_id_from_auth())
  );

CREATE POLICY "queue_items_delete" ON "queue_items"
  FOR DELETE USING (
    session_id IN (SELECT id FROM dj_sessions WHERE host_id = get_user_id_from_auth())
    OR added_by = get_user_id_from_auth()
  );

-- ====================================
-- VOTES TABLE POLICIES
-- ====================================

CREATE POLICY "votes_select" ON "votes"
  FOR SELECT USING (true);

CREATE POLICY "votes_insert" ON "votes"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

CREATE POLICY "votes_update_own" ON "votes"
  FOR UPDATE USING (user_id = get_user_id_from_auth());

CREATE POLICY "votes_delete_own" ON "votes"
  FOR DELETE USING (user_id = get_user_id_from_auth());

-- ====================================
-- MARKETPLACE PRODUCTS TABLE POLICIES
-- ====================================

CREATE POLICY "marketplace_products_select_public" ON "marketplace_products"
  FOR SELECT USING (status = 'PUBLISHED' OR artist_id = get_user_id_from_auth());

CREATE POLICY "marketplace_products_insert" ON "marketplace_products"
  FOR INSERT WITH CHECK (artist_id = get_user_id_from_auth());

CREATE POLICY "marketplace_products_update" ON "marketplace_products"
  FOR UPDATE USING (artist_id = get_user_id_from_auth());

CREATE POLICY "marketplace_products_delete" ON "marketplace_products"
  FOR DELETE USING (artist_id = get_user_id_from_auth());

-- ====================================
-- PURCHASES TABLE POLICIES
-- ====================================

CREATE POLICY "purchases_select" ON "purchases"
  FOR SELECT USING (
    buyer_id = get_user_id_from_auth() OR
    product_id IN (SELECT id FROM marketplace_products WHERE artist_id = get_user_id_from_auth())
  );

CREATE POLICY "purchases_insert" ON "purchases"
  FOR INSERT WITH CHECK (buyer_id = get_user_id_from_auth());

CREATE POLICY "purchases_update" ON "purchases"
  FOR UPDATE USING (
    product_id IN (SELECT id FROM marketplace_products WHERE artist_id = get_user_id_from_auth())
  );

-- ====================================
-- ARTIST REVENUE TABLE POLICIES
-- ====================================

CREATE POLICY "artist_revenue_select" ON "artist_revenue"
  FOR SELECT USING (artist_id = get_user_id_from_auth());

-- ====================================
-- ARTIST ANALYTICS TABLE POLICIES
-- ====================================

CREATE POLICY "artist_analytics_select" ON "artist_analytics"
  FOR SELECT USING (artist_id = get_user_id_from_auth());

-- ====================================
-- FAN ENGAGEMENTS TABLE POLICIES
-- ====================================

CREATE POLICY "fan_engagements_select" ON "fan_engagements"
  FOR SELECT USING (artist_id = get_user_id_from_auth() OR fan_id = get_user_id_from_auth());

-- ====================================
-- ARTIST PAYOUTS TABLE POLICIES
-- ====================================

CREATE POLICY "artist_payouts_select" ON "artist_payouts"
  FOR SELECT USING (artist_id = get_user_id_from_auth());

-- ====================================
-- USER PROGRESSION TABLE POLICIES
-- ====================================

CREATE POLICY "user_progression_select" ON "user_progression"
  FOR SELECT USING (user_id = get_user_id_from_auth());

-- ====================================
-- BADGES TABLE POLICIES
-- ====================================

CREATE POLICY "badges_select_public" ON "badges"
  FOR SELECT USING (true);

-- ====================================
-- USER BADGES TABLE POLICIES
-- ====================================

CREATE POLICY "user_badges_select_public" ON "user_badges"
  FOR SELECT USING (true);

-- ====================================
-- CONVERSATIONS TABLE POLICIES
-- ====================================

CREATE POLICY "conversations_select" ON "conversations"
  FOR SELECT USING (get_user_id_from_auth() = ANY(participant_ids));

CREATE POLICY "conversations_insert" ON "conversations"
  FOR INSERT WITH CHECK (get_user_id_from_auth() = ANY(participant_ids));

-- ====================================
-- DIRECT MESSAGES TABLE POLICIES
-- ====================================

CREATE POLICY "direct_messages_select" ON "direct_messages"
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE get_user_id_from_auth() = ANY(participant_ids)
    )
  );

CREATE POLICY "direct_messages_insert" ON "direct_messages"
  FOR INSERT WITH CHECK (
    sender_id = get_user_id_from_auth() AND
    conversation_id IN (
      SELECT id FROM conversations WHERE get_user_id_from_auth() = ANY(participant_ids)
    )
  );

CREATE POLICY "direct_messages_update" ON "direct_messages"
  FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE get_user_id_from_auth() = ANY(participant_ids)
    )
  );

-- ====================================
-- AI DETECTION RESULTS TABLE POLICIES
-- ====================================

CREATE POLICY "ai_detection_results_select" ON "ai_detection_results"
  FOR SELECT USING (uploaded_by = get_user_id_from_auth());

-- ====================================
-- COMMUNITY REPORTS TABLE POLICIES
-- ====================================

CREATE POLICY "community_reports_select" ON "community_reports"
  FOR SELECT USING (reported_by = get_user_id_from_auth());

CREATE POLICY "community_reports_insert" ON "community_reports"
  FOR INSERT WITH CHECK (reported_by = get_user_id_from_auth());

-- ====================================
-- STREAMING CONNECTIONS TABLE POLICIES (SENSITIVE)
-- ====================================

CREATE POLICY "streaming_connections_select_own" ON "streaming_connections"
  FOR SELECT USING (user_id = get_user_id_from_auth());

CREATE POLICY "streaming_connections_insert_own" ON "streaming_connections"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

CREATE POLICY "streaming_connections_update_own" ON "streaming_connections"
  FOR UPDATE USING (user_id = get_user_id_from_auth());

CREATE POLICY "streaming_connections_delete_own" ON "streaming_connections"
  FOR DELETE USING (user_id = get_user_id_from_auth());

-- ====================================
-- SHOPIFY CONNECTIONS TABLE POLICIES (SENSITIVE)
-- ====================================

CREATE POLICY "shopify_connections_select_own" ON "shopify_connections"
  FOR SELECT USING (artist_id = get_user_id_from_auth());

CREATE POLICY "shopify_connections_update_own" ON "shopify_connections"
  FOR UPDATE USING (artist_id = get_user_id_from_auth());

CREATE POLICY "shopify_connections_delete_own" ON "shopify_connections"
  FOR DELETE USING (artist_id = get_user_id_from_auth());

-- ====================================
-- SHOPIFY PRODUCTS TABLE POLICIES
-- ====================================

CREATE POLICY "shopify_products_select_public" ON "shopify_products"
  FOR SELECT USING (
    status = 'active' AND available_for_sale = true
  );

CREATE POLICY "shopify_products_select_own" ON "shopify_products"
  FOR SELECT USING (
    connection_id IN (SELECT id FROM shopify_connections WHERE artist_id = get_user_id_from_auth())
  );

-- ====================================
-- MERCH DROPS TABLE POLICIES
-- ====================================

CREATE POLICY "merch_drops_select_public" ON "merch_drops"
  FOR SELECT USING (
    (status = 'LIVE' AND gating_type = 'PUBLIC') OR
    artist_id = get_user_id_from_auth()
  );

CREATE POLICY "merch_drops_insert" ON "merch_drops"
  FOR INSERT WITH CHECK (artist_id = get_user_id_from_auth());

CREATE POLICY "merch_drops_update" ON "merch_drops"
  FOR UPDATE USING (artist_id = get_user_id_from_auth());

CREATE POLICY "merch_drops_delete" ON "merch_drops"
  FOR DELETE USING (artist_id = get_user_id_from_auth());

-- ====================================
-- MERCH DROP ITEMS TABLE POLICIES
-- ====================================

CREATE POLICY "merch_drop_items_select" ON "merch_drop_items"
  FOR SELECT USING (
    drop_id IN (
      SELECT id FROM merch_drops WHERE
        (status = 'LIVE' AND gating_type = 'PUBLIC') OR
        artist_id = get_user_id_from_auth()
    )
  );

CREATE POLICY "merch_drop_items_insert" ON "merch_drop_items"
  FOR INSERT WITH CHECK (
    drop_id IN (SELECT id FROM merch_drops WHERE artist_id = get_user_id_from_auth())
  );

CREATE POLICY "merch_drop_items_update" ON "merch_drop_items"
  FOR UPDATE USING (
    drop_id IN (SELECT id FROM merch_drops WHERE artist_id = get_user_id_from_auth())
  );

CREATE POLICY "merch_drop_items_delete" ON "merch_drop_items"
  FOR DELETE USING (
    drop_id IN (SELECT id FROM merch_drops WHERE artist_id = get_user_id_from_auth())
  );

-- ====================================
-- TRACK REFS TABLE POLICIES
-- ====================================

CREATE POLICY "track_refs_select_public" ON "track_refs"
  FOR SELECT USING (true);

-- ====================================
-- VERIFICATION REQUESTS TABLE POLICIES
-- ====================================

CREATE POLICY "verification_requests_select" ON "verification_requests"
  FOR SELECT USING (user_id = get_user_id_from_auth());

CREATE POLICY "verification_requests_insert" ON "verification_requests"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

-- ====================================
-- MODERATION LOGS TABLE POLICIES
-- ====================================

CREATE POLICY "moderation_logs_select" ON "moderation_logs"
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM room_memberships
      WHERE user_id = get_user_id_from_auth() AND role = 'ADMIN'
    ) OR
    room_id IN (SELECT id FROM rooms WHERE created_by = get_user_id_from_auth())
  );

-- ====================================
-- DONE!
-- ====================================
-- RLS is now enabled on all tables with appropriate policies.
-- The backend service role bypasses RLS, so API operations are unaffected.
-- Direct Supabase client access is now properly secured.
