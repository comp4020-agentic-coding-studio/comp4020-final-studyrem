// Accounts and their profiles, as JSON files on the Fly volume. Each user owns
// an ordered list of fields; a user may hold one share token, which is the only
// way anyone else reaches their profile.
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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

// Fly mounts the one persistent volume at /data (see fly.toml). Outside that
// container — running locally, or in CI's throwaway tmpfs — /data may not be
// writable, so this falls back to a repo-local, gitignored directory rather
// than crashing. Either way, DATA_DIR can override it directly.
function resolveDataDir(): string {
  const preferred = process.env.DATA_DIR ?? "/data";
  try {
    mkdirSync(preferred, { recursive: true });
    return preferred;
  } catch {
    const fallback = "./data";
    mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

export const DATA_DIR = resolveDataDir();
const USERS_PATH = join(DATA_DIR, "users.json");
const FIELDS_DIR = join(DATA_DIR, "fields");
// The single shared profile from crit 8, before accounts existed.
const LEGACY_PROFILE_PATH = join(DATA_DIR, "profile.json");
mkdirSync(FIELDS_DIR, { recursive: true });

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    // A corrupt file shouldn't take the whole app down on every request.
    return fallback;
  }
}

// Write-then-rename, so a crash mid-write leaves the old file, never half a file.
function writeJson(path: string, value: unknown): void {
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(value, null, 2));
  renameSync(tmp, path);
}

const loadUsers = (): User[] => readJson<User[]>(USERS_PATH, []);
const saveUsers = (users: User[]): void => writeJson(USERS_PATH, users);

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
  return loadUsers().find((u) => u.username === wanted);
}

export function findUserById(id: string): User | undefined {
  return loadUsers().find((u) => u.id === id);
}

export function findUserByShareToken(token: string): User | undefined {
  if (!token) return undefined;
  return loadUsers().find((u) => u.shareToken === token);
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
  const users = loadUsers();
  if (users.some((u) => u.username === name)) throw new Error("That username is taken.");

  const user: User = {
    id: randomUUID(),
    username: name,
    passwordHash: hashPassword(password),
    shareToken: null,
    createdAt: new Date().toISOString(),
  };
  // The first account inherits crit 8's shared profile; the old file is kept,
  // renamed, rather than deleted.
  if (users.length === 0 && existsSync(LEGACY_PROFILE_PATH)) {
    saveFields(user.id, readJson<Field[]>(LEGACY_PROFILE_PATH, []));
    renameSync(LEGACY_PROFILE_PATH, `${LEGACY_PROFILE_PATH}.migrated`);
  }
  users.push(user);
  saveUsers(users);
  return user;
}

// Issues a fresh token, invalidating any previous one. Returns the new token.
export function rotateShareToken(userId: string): string {
  const users = loadUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("no such user");
  user.shareToken = randomBytes(24).toString("base64url");
  saveUsers(users);
  return user.shareToken;
}

const fieldsPath = (userId: string): string => join(FIELDS_DIR, `${userId}.json`);
const saveFields = (userId: string, fields: Field[]): void => writeJson(fieldsPath(userId), fields);

export function loadFields(userId: string): Field[] {
  return readJson<Field[]>(fieldsPath(userId), []);
}

export function addField(userId: string, title: string, content: string): Field[] {
  const fields = loadFields(userId);
  fields.push({ id: randomUUID(), title, content, createdAt: new Date().toISOString() });
  saveFields(userId, fields);
  return fields;
}

export function removeField(userId: string, fieldId: string): Field[] {
  const fields = loadFields(userId).filter((f) => f.id !== fieldId);
  saveFields(userId, fields);
  return fields;
}
