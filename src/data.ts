// Accounts and their profiles, in SQLite on the Fly volume (see db.ts). Each
// user owns an ordered list of fields; another user sees a field only if
// they hold that same field themselves (decision 4) — enforced in
// mutualFields() and searchField(), not by any token or ACL on the row.
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import { DATA_DIR } from "./data-dir.ts";
import { db } from "./db.ts";

export interface Field {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  sessionVersion: number;
  createdAt: string;
}

export { DATA_DIR };

// The single shared profile from crit 8, before accounts existed.
const LEGACY_PROFILE_PATH = join(DATA_DIR, "profile.json");

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  session_version: number;
  created_at: string;
}

const toUser = (row: UserRow): User => ({
  id: row.id,
  username: row.username,
  passwordHash: row.password_hash,
  sessionVersion: row.session_version,
  createdAt: row.created_at,
});

interface FieldRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

const toField = (row: FieldRow): Field => ({
  id: row.id,
  title: row.title,
  content: row.content,
  createdAt: row.created_at,
});

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(passwordHash: string, password: string): boolean {
  const [, saltHex, hashHex] = passwordHash.split(":");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

// A fixed-cost hash to compare against when the username doesn't exist, so a
// login attempt always does one scrypt compare — otherwise an unknown
// username short-circuits before hashing, and the timing gap (a real compare
// vs. none at all) defeats the point of the generic "doesn't match" message.
export const DUMMY_PASSWORD_HASH = hashPassword("not a real password, just a timing decoy");

export const USERNAME_PATTERN = /^[a-z0-9_-]{3,32}$/;
export const MIN_PASSWORD_LENGTH = 8;

export function findUserByUsername(username: string): User | undefined {
  const wanted = username.toLowerCase();
  const row = db.prepare("SELECT * FROM users WHERE username = ?").get(wanted) as UserRow | undefined;
  return row ? toUser(row) : undefined;
}

export function findUserById(id: string): User | undefined {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? toUser(row) : undefined;
}

// Throws with a user-facing message on invalid input or a taken username.
export function createUser(username: string, password: string): User {
  const name = username.toLowerCase();
  if (!USERNAME_PATTERN.test(name)) {
    throw new Error("Usernames are 3–32 characters: letters, digits, _ or -.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Passwords need at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (findUserByUsername(name)) throw new Error("That username is taken.");

  const isFirstUser = (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n === 0;

  const user: User = {
    id: randomUUID(),
    username: name,
    passwordHash: hashPassword(password),
    sessionVersion: 0,
    createdAt: new Date().toISOString(),
  };
  db.prepare("INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)").run(
    user.id,
    user.username,
    user.passwordHash,
    user.createdAt,
  );

  // The first account inherits crit 8's shared profile; the old file is kept,
  // renamed, rather than deleted.
  if (isFirstUser && existsSync(LEGACY_PROFILE_PATH)) {
    let legacyFields: Field[] = [];
    try {
      legacyFields = JSON.parse(readFileSync(LEGACY_PROFILE_PATH, "utf8")) as Field[];
    } catch {
      legacyFields = [];
    }
    for (const f of legacyFields) {
      db.prepare("INSERT INTO fields (id, user_id, title, content, created_at) VALUES (?, ?, ?, ?, ?)").run(
        f.id,
        user.id,
        f.title,
        f.content,
        f.createdAt,
      );
    }
    renameSync(LEGACY_PROFILE_PATH, `${LEGACY_PROFILE_PATH}.migrated`);
  }

  return user;
}

// Invalidates every session for this user at once (logout-everywhere, not
// per-device) by making every previously-issued cookie's embedded version
// stale. Simpler than a revocation list: nothing to garbage-collect.
export function bumpSessionVersion(userId: string): void {
  db.prepare("UPDATE users SET session_version = session_version + 1 WHERE id = ?").run(userId);
}

export function loadFields(userId: string): Field[] {
  const rows = db
    .prepare("SELECT * FROM fields WHERE user_id = ? ORDER BY created_at")
    .all(userId) as unknown as FieldRow[];
  return rows.map(toField);
}

export function addField(userId: string, title: string, content: string): Field[] {
  const field: Field = { id: randomUUID(), title, content, createdAt: new Date().toISOString() };
  db.prepare("INSERT INTO fields (id, user_id, title, content, created_at) VALUES (?, ?, ?, ?, ?)").run(
    field.id,
    userId,
    field.title,
    field.content,
    field.createdAt,
  );
  return loadFields(userId);
}

export function removeField(userId: string, fieldId: string): Field[] {
  db.prepare("DELETE FROM fields WHERE id = ? AND user_id = ?").run(fieldId, userId);
  return loadFields(userId);
}

// Decision 4, enforced directly: the fields a viewer may see on someone
// else's profile are exactly the ones whose title the viewer also holds.
export function mutualFields(ownerId: string, viewerId: string): Field[] {
  const rows = db
    .prepare(
      `SELECT * FROM fields WHERE user_id = ?
       AND title IN (SELECT title FROM fields WHERE user_id = ?)
       ORDER BY created_at`,
    )
    .all(ownerId, viewerId) as unknown as FieldRow[];
  return rows.map(toField);
}

export interface TitleSuggestion {
  title: string;
  count: number;
}

// Prefix match, ranked by how many existing fields already use that title —
// decision 10's "nudge toward a shared vocabulary." An empty prefix returns
// nothing: without this check the endpoint would be a de facto browse-all
// list of every title in the system, which decision 5 (no browse page)
// already ruled out.
export function matchingTitles(prefix: string, limit = 8): TitleSuggestion[] {
  if (prefix === "") return [];
  const escaped = prefix.replace(/[\\%_]/g, (c) => `\\${c}`);
  const rows = db
    .prepare(
      `SELECT title, COUNT(*) AS count FROM fields
       WHERE title LIKE ? || '%' ESCAPE '\\'
       GROUP BY title
       ORDER BY count DESC, title ASC
       LIMIT ?`,
    )
    .all(escaped, limit) as unknown as TitleSuggestion[];
  return rows;
}

export interface FieldMatch {
  username: string;
  content: string;
}

// Scoped to one field title, excludes the searcher's own fields. Only
// username + the matching field's content ever come back — decision 6
// shares exactly that one field, nothing else of the matched person.
export function searchField(title: string, query: string, excludeUserId: string): FieldMatch[] {
  const escaped = query.replace(/[\\%_]/g, (c) => `\\${c}`);
  const rows = db
    .prepare(
      `SELECT u.username, f.content FROM fields f
       JOIN users u ON u.id = f.user_id
       WHERE f.title = ? AND u.id != ? AND f.content LIKE '%' || ? || '%' ESCAPE '\\'
       ORDER BY f.created_at`,
    )
    .all(title, excludeUserId, escaped) as unknown as FieldMatch[];
  return rows;
}
