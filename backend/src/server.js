// Точка входа backend: применяет миграции и запускает HTTP-сервер.
import app from "./app.js";
import { getDb } from "./config/db.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureMigrations() {
  const db = await getDb();
  const migrationPath = path.resolve(__dirname, "../migrations/001_init.sql");
  const sql = fs.readFileSync(migrationPath, "utf-8");
  await db.exec(sql);
  await db.close();
}

const port = Number(process.env.PORT || 4000);

ensureMigrations()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Server bootstrap failed:", error);
    process.exit(1);
  });
