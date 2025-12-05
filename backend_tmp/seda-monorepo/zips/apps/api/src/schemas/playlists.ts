import { z } from "zod";

export const ProviderEnum = z.enum([
  "spotify","apple","beatport","youtube","deezer","tidal","bandcamp","amazon","pandora"
]);

export const PlaylistCreateSchema = z.object({
  title: z.string().min(1).max(140),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(true),
  is_collaborative: z.boolean().default(false),
});

export const PlaylistUpdateSchema = PlaylistCreateSchema.partial();

export const PlaylistItemCreateSchema = z.object({
  playlist_id: z.string().uuid(),
  position: z.number().int().nonnegative(),
  provider: ProviderEnum,
  provider_track_id: z.string().min(1),
  title: z.string().optional(),
  artist: z.string().optional(),
  artwork_url: z.string().url().optional(),
});

export type PlaylistCreate = z.infer<typeof PlaylistCreateSchema>;
export type PlaylistUpdate = z.infer<typeof PlaylistUpdateSchema>;
export type PlaylistItemCreate = z.infer<typeof PlaylistItemCreateSchema>;
