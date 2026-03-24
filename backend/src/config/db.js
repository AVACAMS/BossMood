// Инициализация подключения к SQLite и создание директории для БД.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

const dbRelativePath = process.env.DB_PATH || "./data/app.db";
const absoluteDbPath = path.resolve(projectRoot, dbRelativePath);

export async function getDb() {
  const dataDir = path.dirname(absoluteDbPath);
  fs.mkdirSync(dataDir, { recursive: true });

  return open({
    filename: absoluteDbPath,
    driver: sqlite3.Database
  });
}
