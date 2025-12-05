// features/profiles/pages/[username].tsx
import React from "react";
import { FEATURE_PROFILES } from "../../../lib/flags";

export default function ProfilePage() {
  if (!FEATURE_PROFILES) return <div>Profiles are coming soon.</div>;
  // TODO: fetch by username from API route
  return (
    <main style={{ padding: 24 }}>
      <h1>@username</h1>
      <p>Bio goes here.</p>
      <section>
        <h2>Trophy Case</h2>
        <div>🏆 (badges will appear here)</div>
      </section>
      <section>
        <h2>Public Playlists</h2>
        <ul><li>Playlist A</li></ul>
      </section>
    </main>
  );
}
