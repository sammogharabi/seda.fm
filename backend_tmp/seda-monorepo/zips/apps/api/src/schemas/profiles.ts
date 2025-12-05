import { z } from "zod";

export const UsernameSchema = z
  .string()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9_]+$/i, "Alphanumeric and underscore only");

export const ProfileCreateSchema = z.object({
  username: UsernameSchema,
  display_name: z.string().min(1).max(80).optional(),
  bio: z.string().max(280).optional(),
  avatar_url: z.string().url().optional(),
});

export const ProfileUpdateSchema = ProfileCreateSchema.partial();

export type ProfileCreate = z.infer<typeof ProfileCreateSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
