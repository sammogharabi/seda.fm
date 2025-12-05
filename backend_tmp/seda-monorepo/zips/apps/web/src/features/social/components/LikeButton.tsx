import React, { useState } from "react";
import { FEATURE_SOCIAL } from "../../../lib/flags_wave_b";

export function LikeButton({ entityType, entityId }: { entityType: "playlist_item"|"track"|"message"|"post"; entityId: string }) {
  const [liked, setLiked] = useState(false);
  if (!FEATURE_SOCIAL) return null;
  return (
    <button onClick={() => setLiked(!liked)} aria-pressed={liked}>
      {liked ? "♥ Liked" : "♡ Like"}
    </button>
  );
}
