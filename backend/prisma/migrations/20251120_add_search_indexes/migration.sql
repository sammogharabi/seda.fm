-- Add search indexes for better query performance

-- Profile search indexes
CREATE INDEX IF NOT EXISTS "idx_profile_username_search" ON "profiles" USING gin (to_tsvector('english', "username"));
CREATE INDEX IF NOT EXISTS "idx_profile_displayname_search" ON "profiles" USING gin (to_tsvector('english', COALESCE("display_name", '')));
CREATE INDEX IF NOT EXISTS "idx_profile_bio_search" ON "profiles" USING gin (to_tsvector('english', COALESCE("bio", '')));

-- TrackRef search indexes
CREATE INDEX IF NOT EXISTS "idx_trackref_title_search" ON "track_refs" USING gin (to_tsvector('english', "title"));
CREATE INDEX IF NOT EXISTS "idx_trackref_artist_search" ON "track_refs" USING gin (to_tsvector('english', "artist"));

-- ArtistProfile search indexes
CREATE INDEX IF NOT EXISTS "idx_artistprofile_name_search" ON "artist_profiles" USING gin (to_tsvector('english', "artist_name"));
CREATE INDEX IF NOT EXISTS "idx_artistprofile_bio_search" ON "artist_profiles" USING gin (to_tsvector('english', COALESCE("bio", '')));

-- Playlist search indexes
CREATE INDEX IF NOT EXISTS "idx_playlist_title_search" ON "playlists" USING gin (to_tsvector('english', "title"));
CREATE INDEX IF NOT EXISTS "idx_playlist_desc_search" ON "playlists" USING gin (to_tsvector('english', COALESCE("description", '')));
CREATE INDEX IF NOT EXISTS "idx_playlist_genre_search" ON "playlists" USING gin (to_tsvector('english', COALESCE("genre", '')));

-- Room search indexes
CREATE INDEX IF NOT EXISTS "idx_room_name_search" ON "rooms" USING gin (to_tsvector('english', "name"));
CREATE INDEX IF NOT EXISTS "idx_room_desc_search" ON "rooms" USING gin (to_tsvector('english', COALESCE("description", '')));
