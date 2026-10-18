// Stateless signed-cookie sessions. The signing secret lives on the volume so
// a redeploy, or Fly stopping an idle machine, doesn't log everyone out. The
// payload carries the user's session_version so logout can invalidate every
// outstanding cookie for that user at once (bumping it in data.ts), without
// a server-side revocation list to store or garbage-collect.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { join } from "node:path";
import { DATA_DIR } from "./data.ts";

const SECRET_PATH = join(DATA_DIR, "session-secret");
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const COOKIE = "sid";

function loadSecret(): Buffer {
  if (existsSync(SECRET_PATH)) return readFileSync(SECRET_PATH);
  const secret = randomBytes(32);
  writeFileSync(SECRET_PATH, secret, { mode: 0o600 });
  return secret;
}
const SECRET = loadSecret();

const sign = (payload: string): string => createHmac("sha256", SECRET).update(payload).digest("base64url");

// Fly terminates TLS and forwards plain HTTP; CI's spec run is plain HTTP on
// localhost, where a Secure cookie would never be sent back.
const secureFlag = (req: IncomingMessage): string =>
  req.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";

export function sessionCookie(req: IncomingMessage, userId: string, sessionVersion: number): string {
  const payload = `${userId}.${sessionVersion}.${Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS}`;
  return `${COOKIE}=${payload}.${sign(payload)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}${secureFlag(req)}`;
}

export function clearedCookie(req: IncomingMessage): string {
  return `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureFlag(req)}`;
}

export interface SessionPayload {
  userId: string;
  sessionVersion: number;
}

// The claims from a valid, unexpired session cookie, or undefined. Doesn't
// touch the database — comparing sessionVersion against the user's current
// one (and treating a mismatch as logged out) is the caller's job.
export function sessionPayload(req: IncomingMessage): SessionPayload | undefined {
  const raw = (req.headers.cookie ?? "")
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return undefined;
  const [userId, sessionVersion, expiry, mac] = raw.split(".");
  if (!userId || !sessionVersion || !expiry || !mac) return undefined;
  const expected = Buffer.from(sign(`${userId}.${sessionVersion}.${expiry}`));
  const given = Buffer.from(mac);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return undefined;
  if (Number(expiry) < Date.now() / 1000) return undefined;
  return { userId, sessionVersion: Number(sessionVersion) };
}
