import { Router } from "express";
import { PlaylistCreateSchema, PlaylistUpdateSchema, PlaylistItemCreateSchema } from "../schemas/playlists";

const router = Router();

// GET /playlists/:id
router.get("/:id", async (req, res) => {
  // TODO: fetch playlist + items (respect visibility)
  return res.json({ id: req.params.id, title: "Untitled", items: [] });
});

// POST /playlists
router.post("/", async (req, res) => {
  const result = PlaylistCreateSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });
  // TODO: insert playlist with owner_user_id = auth user
  return res.status(201).json({ id: "uuid", ...result.data });
});

// PATCH /playlists/:id
router.patch("/:id", async (req, res) => {
  const result = PlaylistUpdateSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });
  // TODO: update playlist if owner/collab
  return res.json({ id: req.params.id, ...result.data });
});

// POST /playlists/:id/items
router.post("/:id/items", async (req, res) => {
  const result = PlaylistItemCreateSchema.safeParse({ ...req.body, playlist_id: req.params.id });
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });
  // TODO: insert item with next position if not provided
  return res.status(201).json({ id: "uuid", ...result.data });
});

export default router;
