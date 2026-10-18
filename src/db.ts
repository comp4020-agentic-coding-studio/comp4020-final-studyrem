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
    session_version INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

// IF NOT EXISTS only guards table creation, not columns added after the
// fact — this lets a volume created before session_version existed pick it
// up on the next boot, the same forward-compatible spirit as IF NOT EXISTS.
const userColumns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
if (!userColumns.some((c) => c.name === "session_version")) {
  db.exec("ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0;");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS fields (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL COLLATE NOCASE,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

db.exec("CREATE INDEX IF NOT EXISTS idx_fields_user ON fields(user_id);");
db.exec("CREATE INDEX IF NOT EXISTS idx_fields_title ON fields(title);");

// Decision 9's weekly cap: a (viewer, title) pair that's been suggested
// recently is skipped, regardless of which profile view would otherwise
// surface it again — the cap is per viewer-and-title, not per encounter.
db.exec(`
  CREATE TABLE IF NOT EXISTS suggestions_shown (
    viewer_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL COLLATE NOCASE,
    shown_at TEXT NOT NULL,
    PRIMARY KEY (viewer_id, title)
  );
`);

db.exec("CREATE INDEX IF NOT EXISTS idx_suggestions_shown_viewer ON suggestions_shown(viewer_id);");
