// Маршруты для создания и получения записей о настроении руководителя.
import express from "express";
import { body, query } from "express-validator";
import { getDb } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../utils/validators.js";

const router = express.Router();
router.use(requireAuth);

router.get(
  "/",
  [query("bossId").isInt({ min: 1 }), validate],
  async (req, res) => {
    const db = await getDb();
    const bossId = Number(req.query.bossId);
    const entries = await db.all(
      `SELECT id, boss_id, mood_rating, note, observed_at, created_at
       FROM mood_entries
       WHERE user_id = ? AND boss_id = ?
       ORDER BY observed_at DESC`,
      req.user.userId,
      bossId
    );
    await db.close();
    return res.json(entries);
  }
);

router.post(
  "/",
  [
    body("bossId").isInt({ min: 1 }),
    body("moodRating").isInt({ min: 1, max: 5 }),
    body("observedAt").isISO8601(),
    body("note").optional().isLength({ max: 600 }),
    validate
  ],
  async (req, res) => {
    const db = await getDb();
    const { bossId, moodRating, observedAt, note } = req.body;
    const boss = await db.get(
      "SELECT id FROM bosses WHERE id = ? AND user_id = ?",
      bossId,
      req.user.userId
    );
    if (!boss) {
      await db.close();
      return res.status(404).json({ message: "Профиль руководителя не найден" });
    }

    const result = await db.run(
      `INSERT INTO mood_entries (user_id, boss_id, mood_rating, note, observed_at)
       VALUES (?, ?, ?, ?, ?)`,
      req.user.userId,
      bossId,
      moodRating,
      note || null,
      observedAt
    );

    const created = await db.get(
      "SELECT id, boss_id, mood_rating, note, observed_at, created_at FROM mood_entries WHERE id = ?",
      result.lastID
    );
    await db.close();
    return res.status(201).json(created);
  }
);

export default router;
