// Маршруты управления профилями руководителей текущего пользователя.
import express from "express";
import { body } from "express-validator";
import { getDb } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../utils/validators.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const db = await getDb();
  const bosses = await db.all(
    "SELECT id, name, role, created_at FROM bosses WHERE user_id = ? ORDER BY created_at DESC",
    req.user.userId
  );
  await db.close();
  return res.json(bosses);
});

router.post(
  "/",
  [body("name").isLength({ min: 1, max: 100 }), body("role").optional().isLength({ max: 100 }), validate],
  async (req, res) => {
    const db = await getDb();
    const { name, role } = req.body;
    const result = await db.run(
      "INSERT INTO bosses (user_id, name, role) VALUES (?, ?, ?)",
      req.user.userId,
      name,
      role || null
    );
    const created = await db.get("SELECT id, name, role, created_at FROM bosses WHERE id = ?", result.lastID);
    await db.close();
    return res.status(201).json(created);
  }
);

export default router;
