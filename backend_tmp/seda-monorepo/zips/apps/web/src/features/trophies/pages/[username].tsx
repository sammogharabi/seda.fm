import React from "react";
import { FEATURE_TROPHY_CASE } from "../../../lib/flags_wave_b";

export default function TrophyCasePage() {
  if (!FEATURE_TROPHY_CASE) return <div>Trophies are coming soon.</div>;
  return (
    <main style={{ padding: 24 }}>
      <h1>Trophy Case</h1>
      <div>🏆 Earned badges will appear here.</div>
    </main>
  );
}
