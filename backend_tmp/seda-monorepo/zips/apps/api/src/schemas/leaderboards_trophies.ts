import { z } from "zod";

export const LeaderboardScopeSchema = z.string().regex(/^(global|genre:[a-z0-9-]+|channel:[a-f0-9-]+|artist:[a-z0-9_]+)$/i);

export const TrophyGrantSchema = z.object({
  user_id: z.string().uuid(),
  badge_code: z.string().min(1),
});

export const LeaderboardQuerySchema = z.object({
  scope: LeaderboardScopeSchema,
  limit: z.number().int().min(1).max(100).default(50)
});
