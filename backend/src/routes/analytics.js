// Маршруты аналитики: статистика и прогноз по историческим записям.
import express from "express";
import { query } from "express-validator";
import { getDb } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../utils/validators.js";

const router = express.Router();
router.use(requireAuth);

router.get(
  "/stats",
  [query("bossId").isInt({ min: 1 }), query("threshold").optional().isInt({ min: 1, max: 5 }), validate],
  async (req, res) => {
    const db = await getDb();
    const bossId = Number(req.query.bossId);
    const threshold = Number(req.query.threshold || 2);
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);

    const [weekAvg, monthAvg, dangerDays, dangerHours, outbursts] = await Promise.all([
      db.get(
        "SELECT ROUND(AVG(mood_rating), 2) AS value FROM mood_entries WHERE user_id = ? AND boss_id = ? AND observed_at >= ?",
        req.user.userId,
        bossId,
        weekAgo.toISOString()
      ),
      db.get(
        "SELECT ROUND(AVG(mood_rating), 2) AS value FROM mood_entries WHERE user_id = ? AND boss_id = ? AND observed_at >= ?",
        req.user.userId,
        bossId,
        monthAgo.toISOString()
      ),
      db.all(
        `SELECT strftime('%w', observed_at) AS weekday, ROUND(AVG(mood_rating),2) AS avg_mood, COUNT(*) as count
         FROM mood_entries
         WHERE user_id = ? AND boss_id = ?
         GROUP BY weekday
         ORDER BY avg_mood ASC, count DESC
         LIMIT 3`,
        req.user.userId,
        bossId
      ),
      db.all(
        `SELECT strftime('%H', observed_at) AS hour, ROUND(AVG(mood_rating),2) AS avg_mood, COUNT(*) as count
         FROM mood_entries
         WHERE user_id = ? AND boss_id = ?
         GROUP BY hour
         ORDER BY avg_mood ASC, count DESC
         LIMIT 3`,
        req.user.userId,
        bossId
      ),
      db.get(
        "SELECT COUNT(*) AS total FROM mood_entries WHERE user_id = ? AND boss_id = ? AND mood_rating <= ?",
        req.user.userId,
        bossId,
        threshold
      )
    ]);

    await db.close();
    return res.json({
      averages: {
        week: weekAvg?.value ?? null,
        month: monthAvg?.value ?? null
      },
      dangerDays,
      dangerHours,
      outbursts: outbursts?.total ?? 0,
      threshold
    });
  }
);

router.get(
  "/prediction",
  [query("bossId").isInt({ min: 1 }), validate],
  async (req, res) => {
    const db = await getDb();
    const bossId = Number(req.query.bossId);

    const rows = await db.all(
      `SELECT strftime('%w', observed_at) AS weekday, AVG(mood_rating) AS avg_mood, COUNT(*) as count
       FROM mood_entries
       WHERE user_id = ? AND boss_id = ? AND observed_at >= datetime('now', '-30 day')
       GROUP BY weekday`,
      req.user.userId,
      bossId
    );

    const map = new Map(rows.map((r) => [Number(r.weekday), Number(r.avg_mood)]));
    const today = new Date();
    const forecast = [];

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.getDay();
      const predictedMood = map.has(day) ? Number(map.get(day).toFixed(2)) : null;
      forecast.push({
        date: date.toISOString().slice(0, 10),
        weekday: day,
        predictedMood,
        risk:
          predictedMood === null
            ? "unknown"
            : predictedMood <= 2.5
              ? "high"
              : predictedMood <= 3.5
                ? "medium"
                : "low"
      });
    }

    await db.close();
    return res.json({ basisDays: 30, forecast });
  }
);

export default router;
