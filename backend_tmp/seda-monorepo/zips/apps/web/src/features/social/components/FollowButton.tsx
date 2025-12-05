import React, { useState } from "react";
import { FEATURE_SOCIAL } from "../../../lib/flags_wave_b";

export function FollowButton({ targetUserId }: { targetUserId: string }) {
  const [following, setFollowing] = useState(false);
  if (!FEATURE_SOCIAL) return null;
  return (
    <button onClick={() => setFollowing(!following)} aria-pressed={following}>
      {following ? "Following" : "Follow"}
    </button>
  );
}
