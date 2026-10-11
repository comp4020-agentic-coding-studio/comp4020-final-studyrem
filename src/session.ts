// Stateless signed-cookie sessions. The signing secret lives on the volume so
// a redeploy, or Fly stopping an idle machine, doesn't log everyone out.
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

export function sessionCookie(req: IncomingMessage, userId: string): string {
  const payload = `${userId}.${Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS}`;
  return `${COOKIE}=${payload}.${sign(payload)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}${secureFlag(req)}`;
}

export function clearedCookie(req: IncomingMessage): string {
  return `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureFlag(req)}`;
}

// The user id from a valid, unexpired session cookie, or undefined.
export function sessionUserId(req: IncomingMessage): string | undefined {
  const raw = (req.headers.cookie ?? "")
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return undefined;
  const [userId, expiry, mac] = raw.split(".");
  if (!userId || !expiry || !mac) return undefined;
  const expected = Buffer.from(sign(`${userId}.${expiry}`));
  const given = Buffer.from(mac);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return undefined;
  if (Number(expiry) < Date.now() / 1000) return undefined;
  return userId;
}
