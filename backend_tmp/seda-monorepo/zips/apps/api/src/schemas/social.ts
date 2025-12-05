import { z } from "zod";

export const FollowSchema = z.object({
  target_user_id: z.string().uuid(),
});

export const LikeSchema = z.object({
  entity_type: z.enum(["playlist_item","track","message","post"]),
  entity_id: z.string().uuid(),
});
