// Главная конфигурация Express-приложения и подключение маршрутов API.
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import bossesRoutes from "./routes/bosses.js";
import entriesRoutes from "./routes/entries.js";
import analyticsRoutes from "./routes/analytics.js";
import { getDb } from "./config/db.js";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Разрешаем non-browser запросы (без Origin) и локальную разработку без ограничения.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: origin is not allowed"));
    }
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

const swaggerPath = fileURLToPath(new URL("../openapi.yaml", import.meta.url));
const swaggerDoc = YAML.load(swaggerPath);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.get("/api/health", async (_req, res) => {
  const db = await getDb();
  await db.exec("SELECT 1");
  await db.close();
  return res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/bosses", bossesRoutes);
app.use("/api/entries", entriesRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ message: "Внутренняя ошибка сервера" });
});

export default app;
