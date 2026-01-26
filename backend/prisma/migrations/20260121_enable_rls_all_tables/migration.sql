-- Enable Row Level Security on all public tables
-- This migration addresses Supabase security warnings about tables without RLS

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
-- CREATE RLS POLICIES
-- ====================================

-- Note: The backend uses a service role key which bypasses RLS.
-- These policies are for direct Supabase client access and security.
-- The auth.uid() function returns the Supabase auth user ID.

-- Helper function to get internal user ID from Supabase auth ID
CREATE OR REPLACE FUNCTION get_user_id_from_auth()
RETURNS TEXT AS $$
  SELECT id FROM users WHERE supabase_id = auth.uid()::text;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ====================================
-- USERS TABLE POLICIES
-- ====================================

-- Users can read their own data
CREATE POLICY "users_select_own" ON "users"
  FOR SELECT USING (supabase_id = auth.uid()::text);

-- Users can update their own data
CREATE POLICY "users_update_own" ON "users"
  FOR UPDATE USING (supabase_id = auth.uid()::text);

-- Service role can do everything (handled by bypassing RLS)

-- ====================================
-- PROFILES TABLE POLICIES
-- ====================================

-- Anyone can read public profiles
CREATE POLICY "profiles_select_public" ON "profiles"
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON "profiles"
  FOR UPDATE USING (user_id = get_user_id_from_auth());

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON "profiles"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

-- ====================================
-- ARTIST PROFILES TABLE POLICIES
-- ====================================

-- Anyone can read artist profiles (public info)
CREATE POLICY "artist_profiles_select_public" ON "artist_profiles"
  FOR SELECT USING (true);

-- Artists can update their own profile
CREATE POLICY "artist_profiles_update_own" ON "artist_profiles"
  FOR UPDATE USING (user_id = get_user_id_from_auth());

-- ====================================
-- ROOMS TABLE POLICIES
-- ====================================

-- Anyone can see public rooms
CREATE POLICY "rooms_select_public" ON "rooms"
  FOR SELECT USING (is_private = false OR created_by = get_user_id_from_auth());

-- Room creator can update their room
CREATE POLICY "rooms_update_owner" ON "rooms"
  FOR UPDATE USING (created_by = get_user_id_from_auth());

-- Room creator can delete their room
CREATE POLICY "rooms_delete_owner" ON "rooms"
  FOR DELETE USING (created_by = get_user_id_from_auth());

-- Authenticated users can create rooms
CREATE POLICY "rooms_insert_authenticated" ON "rooms"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ====================================
-- ROOM MEMBERSHIPS TABLE POLICIES
-- ====================================

-- Members can see memberships for rooms they're in
CREATE POLICY "room_memberships_select" ON "room_memberships"
  FOR SELECT USING (
    user_id = get_user_id_from_auth() OR
    room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
  );

-- Users can join rooms (insert their own membership)
CREATE POLICY "room_memberships_insert_own" ON "room_memberships"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

-- Users can leave rooms (delete their own membership)
CREATE POLICY "room_memberships_delete_own" ON "room_memberships"
  FOR DELETE USING (user_id = get_user_id_from_auth());

-- ====================================
-- MESSAGES TABLE POLICIES
-- ====================================

-- Users can see messages in rooms they're members of
CREATE POLICY "messages_select" ON "messages"
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
    OR room_id IN (SELECT id FROM rooms WHERE is_private = false)
  );

-- Users can post messages in rooms they're members of
CREATE POLICY "messages_insert" ON "messages"
  FOR INSERT WITH CHECK (
    user_id = get_user_id_from_auth() AND
    (room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
     OR room_id IN (SELECT id FROM rooms WHERE is_private = false))
  );

-- Users can update their own messages
CREATE POLICY "messages_update_own" ON "messages"
  FOR UPDATE USING (user_id = get_user_id_from_auth());

-- Users can delete their own messages
CREATE POLICY "messages_delete_own" ON "messages"
  FOR DELETE USING (user_id = get_user_id_from_auth());

-- ====================================
-- REACTIONS TABLE POLICIES
-- ====================================

-- Users can see reactions on messages they can see
CREATE POLICY "reactions_select" ON "reactions"
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM messages WHERE
        room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
        OR room_id IN (SELECT id FROM rooms WHERE is_private = false)
    )
  );

-- Users can add reactions
CREATE POLICY "reactions_insert" ON "reactions"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

-- Users can remove their own reactions
CREATE POLICY "reactions_delete_own" ON "reactions"
  FOR DELETE USING (user_id = get_user_id_from_auth());

-- ====================================
-- POSTS TABLE POLICIES
-- ====================================

-- Anyone can see non-deleted posts
CREATE POLICY "posts_select_public" ON "posts"
  FOR SELECT USING (deleted_at IS NULL);

-- Users can create their own posts
CREATE POLICY "posts_insert_own" ON "posts"
  FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- Users can update their own posts
CREATE POLICY "posts_update_own" ON "posts"
  FOR UPDATE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- Users can delete their own posts
CREATE POLICY "posts_delete_own" ON "posts"
  FOR DELETE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- ====================================
-- COMMENTS TABLE POLICIES
-- ====================================

-- Anyone can see non-deleted comments
CREATE POLICY "comments_select_public" ON "comments"
  FOR SELECT USING (deleted_at IS NULL);

-- Users can create comments
CREATE POLICY "comments_insert" ON "comments"
  FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- Users can update their own comments
CREATE POLICY "comments_update_own" ON "comments"
  FOR UPDATE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- Users can delete their own comments
CREATE POLICY "comments_delete_own" ON "comments"
  FOR DELETE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- ====================================
-- LIKES TABLE POLICIES
-- ====================================

-- Anyone can see likes
CREATE POLICY "likes_select_public" ON "likes"
  FOR SELECT USING (true);

-- Users can create their own likes
CREATE POLICY "likes_insert_own" ON "likes"
  FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- Users can delete their own likes
CREATE POLICY "likes_delete_own" ON "likes"
  FOR DELETE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- ====================================
-- REPOSTS TABLE POLICIES
-- ====================================

-- Anyone can see reposts
CREATE POLICY "reposts_select_public" ON "reposts"
  FOR SELECT USING (true);

-- Users can create their own reposts
CREATE POLICY "reposts_insert_own" ON "reposts"
  FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- Users can delete their own reposts
CREATE POLICY "reposts_delete_own" ON "reposts"
  FOR DELETE USING (user_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- ====================================
-- FOLLOWS TABLE POLICIES
-- ====================================

-- Anyone can see follows
CREATE POLICY "follows_select_public" ON "follows"
  FOR SELECT USING (true);

-- Users can create follows (follow others)
CREATE POLICY "follows_insert_own" ON "follows"
  FOR INSERT WITH CHECK (follower_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- Users can delete their own follows (unfollow)
CREATE POLICY "follows_delete_own" ON "follows"
  FOR DELETE USING (follower_id = (SELECT user_id FROM profiles WHERE user_id = get_user_id_from_auth()));

-- ====================================
-- PLAYLISTS (CRATES) TABLE POLICIES
-- ====================================

-- Anyone can see public playlists
CREATE POLICY "playlists_select_public" ON "playlists"
  FOR SELECT USING (
    is_public = true OR
    owner_user_id = get_user_id_from_auth() OR
    id IN (SELECT playlist_id FROM playlist_collaborators WHERE user_id = get_user_id_from_auth())
  );

-- Users can create playlists
CREATE POLICY "playlists_insert_own" ON "playlists"
  FOR INSERT WITH CHECK (owner_user_id = get_user_id_from_auth());

-- Owners can update their playlists
CREATE POLICY "playlists_update_own" ON "playlists"
  FOR UPDATE USING (owner_user_id = get_user_id_from_auth());

-- Owners can delete their playlists
CREATE POLICY "playlists_delete_own" ON "playlists"
  FOR DELETE USING (owner_user_id = get_user_id_from_auth());

-- ====================================
-- PLAYLIST ITEMS TABLE POLICIES
-- ====================================

-- Users can see items in playlists they can access
CREATE POLICY "playlist_items_select" ON "playlist_items"
  FOR SELECT USING (
    playlist_id IN (
      SELECT id FROM playlists WHERE
        is_public = true OR
        owner_user_id = get_user_id_from_auth() OR
        id IN (SELECT playlist_id FROM playlist_collaborators WHERE user_id = get_user_id_from_auth())
    )
  );

-- Users can add items to playlists they own or collaborate on
CREATE POLICY "playlist_items_insert" ON "playlist_items"
  FOR INSERT WITH CHECK (
    added_by_user_id = get_user_id_from_auth() AND
    playlist_id IN (
      SELECT id FROM playlists WHERE
        owner_user_id = get_user_id_from_auth() OR
        (is_collaborative = true AND id IN (SELECT playlist_id FROM playlist_collaborators WHERE user_id = get_user_id_from_auth()))
    )
  );

-- Playlist owners can delete items
CREATE POLICY "playlist_items_delete" ON "playlist_items"
  FOR DELETE USING (
    playlist_id IN (SELECT id FROM playlists WHERE owner_user_id = get_user_id_from_auth())
    OR added_by_user_id = get_user_id_from_auth()
  );

-- ====================================
-- PLAYLIST COLLABORATORS TABLE POLICIES
-- ====================================

-- Users can see collaborators on playlists they own or collaborate on
CREATE POLICY "playlist_collaborators_select" ON "playlist_collaborators"
  FOR SELECT USING (
    playlist_id IN (
      SELECT id FROM playlists WHERE
        owner_user_id = get_user_id_from_auth() OR
        id IN (SELECT playlist_id FROM playlist_collaborators WHERE user_id = get_user_id_from_auth())
    )
  );

-- Playlist owners can add collaborators
CREATE POLICY "playlist_collaborators_insert" ON "playlist_collaborators"
  FOR INSERT WITH CHECK (
    playlist_id IN (SELECT id FROM playlists WHERE owner_user_id = get_user_id_from_auth())
  );

-- Playlist owners can remove collaborators
CREATE POLICY "playlist_collaborators_delete" ON "playlist_collaborators"
  FOR DELETE USING (
    playlist_id IN (SELECT id FROM playlists WHERE owner_user_id = get_user_id_from_auth())
    OR user_id = get_user_id_from_auth()
  );

-- ====================================
-- DJ SESSIONS TABLE POLICIES
-- ====================================

-- Anyone can see public sessions
CREATE POLICY "dj_sessions_select" ON "dj_sessions"
  FOR SELECT USING (
    is_private = false OR
    host_id = get_user_id_from_auth() OR
    room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
  );

-- Authenticated users can create sessions
CREATE POLICY "dj_sessions_insert" ON "dj_sessions"
  FOR INSERT WITH CHECK (host_id = get_user_id_from_auth());

-- Session host can update
CREATE POLICY "dj_sessions_update" ON "dj_sessions"
  FOR UPDATE USING (host_id = get_user_id_from_auth());

-- Session host can delete
CREATE POLICY "dj_sessions_delete" ON "dj_sessions"
  FOR DELETE USING (host_id = get_user_id_from_auth());

-- ====================================
-- QUEUE ITEMS TABLE POLICIES
-- ====================================

-- Users can see queue items for sessions they can access
CREATE POLICY "queue_items_select" ON "queue_items"
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM dj_sessions WHERE
        is_private = false OR
        host_id = get_user_id_from_auth() OR
        room_id IN (SELECT room_id FROM room_memberships WHERE user_id = get_user_id_from_auth())
    )
  );

-- Users can add to queue in sessions they can access
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

-- Session hosts can update queue items
CREATE POLICY "queue_items_update" ON "queue_items"
  FOR UPDATE USING (
    session_id IN (SELECT id FROM dj_sessions WHERE host_id = get_user_id_from_auth())
  );

-- Session hosts can delete queue items
CREATE POLICY "queue_items_delete" ON "queue_items"
  FOR DELETE USING (
    session_id IN (SELECT id FROM dj_sessions WHERE host_id = get_user_id_from_auth())
    OR added_by = get_user_id_from_auth()
  );

-- ====================================
-- VOTES TABLE POLICIES
-- ====================================

-- Anyone can see votes
CREATE POLICY "votes_select" ON "votes"
  FOR SELECT USING (true);

-- Users can vote
CREATE POLICY "votes_insert" ON "votes"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

-- Users can change/remove their vote
CREATE POLICY "votes_update_own" ON "votes"
  FOR UPDATE USING (user_id = get_user_id_from_auth());

CREATE POLICY "votes_delete_own" ON "votes"
  FOR DELETE USING (user_id = get_user_id_from_auth());

-- ====================================
-- MARKETPLACE PRODUCTS TABLE POLICIES
-- ====================================

-- Anyone can see published products
CREATE POLICY "marketplace_products_select_public" ON "marketplace_products"
  FOR SELECT USING (status = 'PUBLISHED' OR artist_id = get_user_id_from_auth());

-- Artists can create products
CREATE POLICY "marketplace_products_insert" ON "marketplace_products"
  FOR INSERT WITH CHECK (artist_id = get_user_id_from_auth());

-- Artists can update their own products
CREATE POLICY "marketplace_products_update" ON "marketplace_products"
  FOR UPDATE USING (artist_id = get_user_id_from_auth());

-- Artists can delete their own products
CREATE POLICY "marketplace_products_delete" ON "marketplace_products"
  FOR DELETE USING (artist_id = get_user_id_from_auth());

-- ====================================
-- PURCHASES TABLE POLICIES
-- ====================================

-- Buyers can see their own purchases
-- Artists can see purchases of their products
CREATE POLICY "purchases_select" ON "purchases"
  FOR SELECT USING (
    buyer_id = get_user_id_from_auth() OR
    product_id IN (SELECT id FROM marketplace_products WHERE artist_id = get_user_id_from_auth())
  );

-- Users can create purchases (buy)
CREATE POLICY "purchases_insert" ON "purchases"
  FOR INSERT WITH CHECK (buyer_id = get_user_id_from_auth());

-- Artists can update order status
CREATE POLICY "purchases_update" ON "purchases"
  FOR UPDATE USING (
    product_id IN (SELECT id FROM marketplace_products WHERE artist_id = get_user_id_from_auth())
  );

-- ====================================
-- ARTIST REVENUE TABLE POLICIES
-- ====================================

-- Artists can see their own revenue
CREATE POLICY "artist_revenue_select" ON "artist_revenue"
  FOR SELECT USING (artist_id = get_user_id_from_auth());

-- ====================================
-- ARTIST ANALYTICS TABLE POLICIES
-- ====================================

-- Artists can see their own analytics
CREATE POLICY "artist_analytics_select" ON "artist_analytics"
  FOR SELECT USING (artist_id = get_user_id_from_auth());

-- ====================================
-- FAN ENGAGEMENTS TABLE POLICIES
-- ====================================

-- Artists can see their fan engagements
CREATE POLICY "fan_engagements_select" ON "fan_engagements"
  FOR SELECT USING (artist_id = get_user_id_from_auth() OR fan_id = get_user_id_from_auth());

-- ====================================
-- ARTIST PAYOUTS TABLE POLICIES
-- ====================================

-- Artists can see their own payouts
CREATE POLICY "artist_payouts_select" ON "artist_payouts"
  FOR SELECT USING (artist_id = get_user_id_from_auth());

-- ====================================
-- USER PROGRESSION TABLE POLICIES
-- ====================================

-- Users can see their own progression
CREATE POLICY "user_progression_select" ON "user_progression"
  FOR SELECT USING (user_id = get_user_id_from_auth());

-- ====================================
-- BADGES TABLE POLICIES
-- ====================================

-- Anyone can see badges (they're public)
CREATE POLICY "badges_select_public" ON "badges"
  FOR SELECT USING (true);

-- ====================================
-- USER BADGES TABLE POLICIES
-- ====================================

-- Anyone can see user badges (achievements are public)
CREATE POLICY "user_badges_select_public" ON "user_badges"
  FOR SELECT USING (true);

-- ====================================
-- CONVERSATIONS TABLE POLICIES
-- ====================================

-- Users can see conversations they're part of
CREATE POLICY "conversations_select" ON "conversations"
  FOR SELECT USING (get_user_id_from_auth() = ANY(participant_ids));

-- Users can create conversations
CREATE POLICY "conversations_insert" ON "conversations"
  FOR INSERT WITH CHECK (get_user_id_from_auth() = ANY(participant_ids));

-- ====================================
-- DIRECT MESSAGES TABLE POLICIES
-- ====================================

-- Users can see messages in their conversations
CREATE POLICY "direct_messages_select" ON "direct_messages"
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE get_user_id_from_auth() = ANY(participant_ids)
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "direct_messages_insert" ON "direct_messages"
  FOR INSERT WITH CHECK (
    sender_id = get_user_id_from_auth() AND
    conversation_id IN (
      SELECT id FROM conversations WHERE get_user_id_from_auth() = ANY(participant_ids)
    )
  );

-- Users can update their own messages (mark as read, edit)
CREATE POLICY "direct_messages_update" ON "direct_messages"
  FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE get_user_id_from_auth() = ANY(participant_ids)
    )
  );

-- ====================================
-- AI DETECTION RESULTS TABLE POLICIES
-- ====================================

-- Users can see detection results for their uploads
CREATE POLICY "ai_detection_results_select" ON "ai_detection_results"
  FOR SELECT USING (uploaded_by = get_user_id_from_auth());

-- ====================================
-- COMMUNITY REPORTS TABLE POLICIES
-- ====================================

-- Users can see their own reports
CREATE POLICY "community_reports_select" ON "community_reports"
  FOR SELECT USING (reported_by = get_user_id_from_auth());

-- Users can create reports
CREATE POLICY "community_reports_insert" ON "community_reports"
  FOR INSERT WITH CHECK (reported_by = get_user_id_from_auth());

-- ====================================
-- STREAMING CONNECTIONS TABLE POLICIES (SENSITIVE)
-- ====================================

-- Users can ONLY see their own streaming connections
CREATE POLICY "streaming_connections_select_own" ON "streaming_connections"
  FOR SELECT USING (user_id = get_user_id_from_auth());

-- Users can create their own connections
CREATE POLICY "streaming_connections_insert_own" ON "streaming_connections"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

-- Users can update their own connections
CREATE POLICY "streaming_connections_update_own" ON "streaming_connections"
  FOR UPDATE USING (user_id = get_user_id_from_auth());

-- Users can delete their own connections
CREATE POLICY "streaming_connections_delete_own" ON "streaming_connections"
  FOR DELETE USING (user_id = get_user_id_from_auth());

-- ====================================
-- SHOPIFY CONNECTIONS TABLE POLICIES (SENSITIVE)
-- ====================================

-- Artists can ONLY see their own Shopify connection
CREATE POLICY "shopify_connections_select_own" ON "shopify_connections"
  FOR SELECT USING (artist_id = get_user_id_from_auth());

-- Artists can update their own connection
CREATE POLICY "shopify_connections_update_own" ON "shopify_connections"
  FOR UPDATE USING (artist_id = get_user_id_from_auth());

-- Artists can delete their own connection
CREATE POLICY "shopify_connections_delete_own" ON "shopify_connections"
  FOR DELETE USING (artist_id = get_user_id_from_auth());

-- ====================================
-- SHOPIFY PRODUCTS TABLE POLICIES
-- ====================================

-- Anyone can see products from active connections
CREATE POLICY "shopify_products_select_public" ON "shopify_products"
  FOR SELECT USING (
    status = 'active' AND available_for_sale = true
  );

-- Artists can see all their synced products
CREATE POLICY "shopify_products_select_own" ON "shopify_products"
  FOR SELECT USING (
    connection_id IN (SELECT id FROM shopify_connections WHERE artist_id = get_user_id_from_auth())
  );

-- ====================================
-- MERCH DROPS TABLE POLICIES
-- ====================================

-- Anyone can see live public drops
CREATE POLICY "merch_drops_select_public" ON "merch_drops"
  FOR SELECT USING (
    (status = 'LIVE' AND gating_type = 'PUBLIC') OR
    artist_id = get_user_id_from_auth()
  );

-- Artists can create drops
CREATE POLICY "merch_drops_insert" ON "merch_drops"
  FOR INSERT WITH CHECK (artist_id = get_user_id_from_auth());

-- Artists can update their own drops
CREATE POLICY "merch_drops_update" ON "merch_drops"
  FOR UPDATE USING (artist_id = get_user_id_from_auth());

-- Artists can delete their own drops
CREATE POLICY "merch_drops_delete" ON "merch_drops"
  FOR DELETE USING (artist_id = get_user_id_from_auth());

-- ====================================
-- MERCH DROP ITEMS TABLE POLICIES
-- ====================================

-- Anyone can see items in visible drops
CREATE POLICY "merch_drop_items_select" ON "merch_drop_items"
  FOR SELECT USING (
    drop_id IN (
      SELECT id FROM merch_drops WHERE
        (status = 'LIVE' AND gating_type = 'PUBLIC') OR
        artist_id = get_user_id_from_auth()
    )
  );

-- Drop owners can manage items
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

-- Anyone can see track refs (they're just metadata)
CREATE POLICY "track_refs_select_public" ON "track_refs"
  FOR SELECT USING (true);

-- ====================================
-- CRAWLER CACHE TABLE POLICIES
-- ====================================

-- No direct access to crawler cache (service role only)
-- This is an internal table

-- ====================================
-- VERIFICATION REQUESTS TABLE POLICIES
-- ====================================

-- Users can see their own verification requests
CREATE POLICY "verification_requests_select" ON "verification_requests"
  FOR SELECT USING (user_id = get_user_id_from_auth());

-- Users can create verification requests
CREATE POLICY "verification_requests_insert" ON "verification_requests"
  FOR INSERT WITH CHECK (user_id = get_user_id_from_auth());

-- ====================================
-- ADMIN ACTIONS TABLE POLICIES
-- ====================================

-- No direct access (admin only, via service role)

-- ====================================
-- ADMIN USERS TABLE POLICIES
-- ====================================

-- No direct access to admin users table (service role only)
-- Admin authentication is handled by the backend

-- ====================================
-- MODERATION LOGS TABLE POLICIES
-- ====================================

-- Room admins can see moderation logs for their rooms
CREATE POLICY "moderation_logs_select" ON "moderation_logs"
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM room_memberships
      WHERE user_id = get_user_id_from_auth() AND role = 'ADMIN'
    ) OR
    room_id IN (SELECT id FROM rooms WHERE created_by = get_user_id_from_auth())
  );
