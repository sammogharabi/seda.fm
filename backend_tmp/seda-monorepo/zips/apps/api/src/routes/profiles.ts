import { Router } from "express";
import { z } from "zod";
import { ProfileCreateSchema, ProfileUpdateSchema } from "../schemas/profiles";

const router = Router();

// GET /profiles/:username
router.get("/:username", async (req, res) => {
  const username = req.params.username;
  // TODO: fetch from DB
  return res.json({ username, display_name: "TBD", bio: "", avatar_url: null });
});

// POST /profiles (create profile for current user)
router.post("/", async (req, res) => {
  const parse = ProfileCreateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  // TODO: insert into DB; user_id from auth
  return res.status(201).json({ id: "uuid", ...parse.data });
});

// PATCH /profiles/:username
router.patch("/:username", async (req, res) => {
  const parse = ProfileUpdateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  // TODO: authorization + update
  return res.json({ username: req.params.username, ...parse.data });
});

export default router;
