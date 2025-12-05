import React from "react";
import { FEATURE_LEADERBOARDS } from "../../../lib/flags_wave_b";

export default function LeaderboardGlobalPage() {
  if (!FEATURE_LEADERBOARDS) return <div>Leaderboards are coming soon.</div>;
  return (
    <main style={{ padding: 24 }}>
      <h1>Global Leaderboard</h1>
      <ol>
        <li>#1 — @username — score</li>
      </ol>
    </main>
  );
}
