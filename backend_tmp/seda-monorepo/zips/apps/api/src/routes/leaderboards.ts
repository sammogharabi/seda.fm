import { Router } from "express";
import { LeaderboardQuerySchema } from "../schemas/leaderboards_trophies";

const router = Router();

// GET /leaderboards?scope=global|genre:...|channel:...|artist:...
router.get("/", async (req, res) => {
  const parse = LeaderboardQuerySchema.safeParse({ scope: req.query.scope, limit: req.query.limit ? Number(req.query.limit) : undefined });
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  // TODO: read most recent snapshot for scope, join entries
  return res.json({ scope: parse.data.scope, entries: [] });
});

export default router;
