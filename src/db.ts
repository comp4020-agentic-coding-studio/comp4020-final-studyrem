// The one SQLite file on the Fly volume (see fly.toml: one machine, one
// volume, no separate DB server). node:sqlite is a Node built-in, so this
// adds no dependency and matches the Node version pinned in mise.toml.
import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import { DATA_DIR } from "./data-dir.ts";

export const db = new DatabaseSync(join(DATA_DIR, "app.db"));

db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS fields (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

db.exec("CREATE INDEX IF NOT EXISTS idx_fields_user ON fields(user_id);");
db.exec("CREATE INDEX IF NOT EXISTS idx_fields_title ON fields(title);");
