#!/usr/bin/env node
// Reads the durable audit trail (src/audit.ts writes it to `audit_log` on the
// same SQLite volume everything else persists to) back out as plain text.
// Locally this just opens data/app.db directly. On the deployed app, run it
// over SSH against the live volume: `fly ssh console -a <app> -C "node
// scripts/audit-log.ts"` (see docs/USER_MANUAL.md for the full command,
// including --event and --limit).
import { db } from "../src/db.ts";

interface Args {
  event?: string;
  limit: number;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { limit: 50 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--event") args.event = argv[++i];
    else if (argv[i] === "--limit") args.limit = Number(argv[++i]);
  }
  return args;
}

const { event, limit } = parseArgs(process.argv.slice(2));

const rows = (
  event
    ? db
        .prepare("SELECT created_at, event, fields FROM audit_log WHERE event = ? ORDER BY id DESC LIMIT ?")
        .all(event, limit)
    : db.prepare("SELECT created_at, event, fields FROM audit_log ORDER BY id DESC LIMIT ?").all(limit)
) as { created_at: string; event: string; fields: string }[];

for (const row of rows.reverse()) {
  const parsed = JSON.parse(row.fields) as Record<string, string>;
  const inline = Object.entries(parsed)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(" ");
  console.log(`${row.created_at} event=${row.event} ${inline}`);
}

if (rows.length === 0) {
  console.log(event ? `No "${event}" events logged yet.` : "No audit events logged yet.");
}
