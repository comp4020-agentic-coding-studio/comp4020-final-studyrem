// Who did what. Written twice: to stdout (`flyctl logs -a <repo>`, for
// watching it live) and to `audit_log` on the same SQLite volume everything
// else persists to, since stdout alone doesn't survive a machine stop or a
// redeploy — see /manual/ for how to read the durable copy back.
import { db } from "./db.ts";

export function audit(event: string, fields: Record<string, string | undefined> = {}): void {
  const present = Object.entries(fields).filter((e): e is [string, string] => e[1] !== undefined);
  const parts = present.map(([k, v]) => `${k}=${JSON.stringify(v)}`);
  console.log(["audit", `event=${event}`, ...parts].join(" "));
  db.prepare("INSERT INTO audit_log (created_at, event, fields) VALUES (?, ?, ?)").run(
    new Date().toISOString(),
    event,
    JSON.stringify(Object.fromEntries(present)),
  );
}
