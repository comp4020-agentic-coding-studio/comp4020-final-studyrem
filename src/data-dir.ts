// Fly mounts the one persistent volume at /data (see fly.toml). Outside that
// container — running locally, or in CI's throwaway tmpfs — /data may not be
// writable, so this falls back to a repo-local, gitignored directory rather
// than crashing. Either way, DATA_DIR can override it directly.
import { mkdirSync } from "node:fs";

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
