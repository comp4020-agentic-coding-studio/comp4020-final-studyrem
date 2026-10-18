// Accounts and their profiles, in SQLite on the Fly volume (see db.ts). Each
// user owns an ordered list of fields; a user may hold one share token, which
// is the only way anyone else reaches their profile.
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
  shareToken: string | null;
  createdAt: string;
}

export { DATA_DIR };

// The single shared profile from crit 8, before accounts existed.
const LEGACY_PROFILE_PATH = join(DATA_DIR, "profile.json");

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  share_token: string | null;
  created_at: string;
}

const toUser = (row: UserRow): User => ({
  id: row.id,
  username: row.username,
  passwordHash: row.password_hash,
  shareToken: row.share_token,
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

export function verifyPassword(user: User, password: string): boolean {
  const [, saltHex, hashHex] = user.passwordHash.split(":");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

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

export function findUserByShareToken(token: string): User | undefined {
  if (!token) return undefined;
  const row = db.prepare("SELECT * FROM users WHERE share_token = ?").get(token) as UserRow | undefined;
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
    shareToken: null,
    createdAt: new Date().toISOString(),
  };
  db.prepare(
    "INSERT INTO users (id, username, password_hash, share_token, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(user.id, user.username, user.passwordHash, user.shareToken, user.createdAt);

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

// Issues a fresh token, invalidating any previous one. Returns the new token.
export function rotateShareToken(userId: string): string {
  const token = randomBytes(24).toString("base64url");
  const result = db.prepare("UPDATE users SET share_token = ? WHERE id = ?").run(token, userId);
  if (result.changes === 0) throw new Error("no such user");
  return token;
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
