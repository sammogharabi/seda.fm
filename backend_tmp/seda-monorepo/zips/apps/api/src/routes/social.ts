import { Router } from "express";
import { FollowSchema, LikeSchema } from "../schemas/social";

const router = Router();

// POST /social/follow
router.post("/follow", async (req, res) => {
  const parse = FollowSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  // TODO: insert into follows where follower_user_id = auth user
  return res.status(201).json({ ok: true });
});

// DELETE /social/follow
router.delete("/follow", async (req, res) => {
  const parse = FollowSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  // TODO: delete follows row
  return res.json({ ok: true });
});

// POST /social/like
router.post("/like", async (req, res) => {
  const parse = LikeSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  // TODO: insert like record (idempotent)
  return res.status(201).json({ ok: true });
});

// DELETE /social/like
router.delete("/like", async (req, res) => {
  const parse = LikeSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  // TODO: delete like
  return res.json({ ok: true });
});

export default router;
