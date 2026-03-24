// Маршруты регистрации и входа пользователя с выдачей JWT.
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { getDb } from "../config/db.js";
import { validate } from "../utils/validators.js";

const router = express.Router();

router.post(
  "/register",
  [body("email").isEmail(), body("password").isLength({ min: 6 }), validate],
  async (req, res) => {
    const db = await getDb();
    const { email, password } = req.body;
    const existing = await db.get("SELECT id FROM users WHERE email = ?", email);

    if (existing) {
      await db.close();
      return res.status(409).json({ message: "Пользователь с таким email уже существует" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.run(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      email,
      passwordHash
    );
    await db.close();

    const token = jwt.sign(
      { userId: result.lastID, email },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    return res.status(201).json({ token, user: { id: result.lastID, email } });
  }
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty(), validate],
  async (req, res) => {
    const db = await getDb();
    const { email, password } = req.body;
    const user = await db.get(
      "SELECT id, email, password_hash FROM users WHERE email = ?",
      email
    );
    await db.close();

    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    return res.json({ token, user: { id: user.id, email: user.email } });
  }
);

export default router;
