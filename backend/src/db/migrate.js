// Скрипт ручного запуска миграций базы данных SQLite.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const db = await getDb();
  const migrationPath = path.resolve(__dirname, "../../migrations/001_init.sql");
  const sql = fs.readFileSync(migrationPath, "utf-8");
  await db.exec(sql);
  await db.close();
  // eslint-disable-next-line no-console
  console.log("Migrations applied successfully.");
}

runMigrations().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Migration failed:", error);
  process.exit(1);
});
