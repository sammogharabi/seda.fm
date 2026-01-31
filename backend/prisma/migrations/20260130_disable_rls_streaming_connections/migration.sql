-- Disable RLS on streaming_connections table
-- The backend authenticates users through its own AuthGuard and controls all access.
-- RLS policies using auth.uid() don't work because the backend uses a pooled postgres connection
-- that doesn't have a Supabase auth session.

-- Drop existing RLS policies first
DROP POLICY IF EXISTS "streaming_connections_select_own" ON "streaming_connections";
DROP POLICY IF EXISTS "streaming_connections_insert_own" ON "streaming_connections";
DROP POLICY IF EXISTS "streaming_connections_update_own" ON "streaming_connections";
DROP POLICY IF EXISTS "streaming_connections_delete_own" ON "streaming_connections";

-- Disable RLS on the table
ALTER TABLE "streaming_connections" DISABLE ROW LEVEL SECURITY;
