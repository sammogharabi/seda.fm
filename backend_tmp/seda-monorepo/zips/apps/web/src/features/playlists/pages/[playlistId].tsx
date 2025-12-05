// features/playlists/pages/[playlistId].tsx
import React from "react";
import { FEATURE_PLAYLISTS } from "../../../lib/flags";

export default function PlaylistPage() {
  if (!FEATURE_PLAYLISTS) return <div>Playlists are coming soon.</div>;
  // TODO: fetch playlist from API and render tracks
  return (
    <main style={{ padding: 24 }}>
      <h1>Playlist Title</h1>
      <p>Description</p>
      <ol>
        <li>Track 1 — Artist</li>
      </ol>
    </main>
  );
}
