// Server-sent events for share-link viewers. The relay is in memory, so every
// viewer must be connected to the same machine as the writer: the app has to
// stay at one Fly machine (see fly.toml).
import type { ServerResponse } from "node:http";
import type { Field } from "./data.ts";

const streams = new Map<string, Set<ServerResponse>>();

const send = (res: ServerResponse, event: string, data: unknown): void => {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

export function subscribe(userId: string, res: ServerResponse, fields: Field[]): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  send(res, "fields", fields);

  let set = streams.get(userId);
  if (!set) streams.set(userId, (set = new Set()));
  set.add(res);

  // Fly's proxy drops connections that stay silent too long.
  const heartbeat = setInterval(() => res.write(": keep-alive\n\n"), 25_000);
  res.on("close", () => {
    clearInterval(heartbeat);
    set.delete(res);
    if (set.size === 0) streams.delete(userId);
  });
}

export function publish(userId: string, fields: Field[]): void {
  for (const res of streams.get(userId) ?? []) send(res, "fields", fields);
}

// Ends every open stream for this user's current link, e.g. on regenerate.
export function revoke(userId: string): void {
  for (const res of streams.get(userId) ?? []) {
    send(res, "revoked", null);
    res.end();
  }
  streams.delete(userId);
}
