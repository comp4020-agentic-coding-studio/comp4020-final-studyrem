// The smallest schema that can carry the core interaction for crit 8: one
// profile, which is just an ordered list of fields. No accounts, no matching,
// no multi-user visibility yet — that's weeks 9 and 10. This only has to
// prove one thing: a field a stranger adds is still there when they come
// back, even across a restart or redeploy.
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface Field {
  id: string;
  title: string;
  content: string;
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

const PROFILE_PATH = join(resolveDataDir(), "profile.json");

export function loadFields(): Field[] {
  if (!existsSync(PROFILE_PATH)) return [];
  try {
    return JSON.parse(readFileSync(PROFILE_PATH, "utf8")) as Field[];
  } catch {
    // A corrupt or half-written file shouldn't take the whole app down —
    // treat it as an empty profile rather than crashing on every request.
    return [];
  }
}

export function addField(title: string, content: string): Field {
  const fields = loadFields();
  const field: Field = { id: randomUUID(), title, content, createdAt: new Date().toISOString() };
  fields.push(field);
  writeFileSync(PROFILE_PATH, JSON.stringify(fields, null, 2));
  return field;
}
