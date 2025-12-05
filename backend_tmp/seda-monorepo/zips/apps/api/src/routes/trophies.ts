import { Router } from "express";
import { TrophyGrantSchema } from "../schemas/leaderboards_trophies";

const router = Router();

// GET /trophies/:username
router.get("/:username", async (req, res) => {
  const username = req.params.username;
  // TODO: find user_id by username; return trophies for that user
  return res.json({ username, trophies: [] });
});

// POST /trophies (internal/admin)
router.post("/", async (req, res) => {
  const parse = TrophyGrantSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  // TODO: grant a badge trophy to user
  return res.status(201).json({ ok: true });
});

export default router;
