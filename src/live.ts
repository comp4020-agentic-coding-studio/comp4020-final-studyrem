// Server-sent events for live mutual-profile views. A viewer's screen depends
// on two people's data — their own fields decide the filter, the owner's
// fields are what's filtered (see data.ts: mutualFields) — so an edit by
// either side can change what's shown, not just an edit by the owner. The
// relay is in memory, so every viewer must be connected to the same machine
// as the writer: the app has to stay at one Fly machine (see fly.toml).
import type { ServerResponse } from "node:http";
import type { Field } from "./data.ts";
import { mutualFields } from "./data.ts";

interface ViewSub {
  viewerId: string;
  ownerId: string;
  res: ServerResponse;
}

const subs = new Set<ViewSub>();

const send = (res: ServerResponse, event: string, data: unknown): void => {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

export function subscribeMutualView(
  viewerId: string,
  ownerId: string,
  res: ServerResponse,
  initial: Field[],
): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  send(res, "fields", initial);

  const sub: ViewSub = { viewerId, ownerId, res };
  subs.add(sub);

  // Fly's proxy drops connections that stay silent too long.
  const heartbeat = setInterval(() => res.write(": keep-alive\n\n"), 25_000);
  res.on("close", () => {
    clearInterval(heartbeat);
    subs.delete(sub);
  });
}

// Called after editorId adds/removes a field. Recomputes and pushes to every
// open view editorId could affect: as the owner being viewed (their fields
// changed what's shown) or as a viewer (their own fields changed the filter).
export function notifyFieldsChanged(editorId: string): void {
  for (const sub of subs) {
    if (sub.ownerId === editorId || sub.viewerId === editorId) {
      send(sub.res, "fields", mutualFields(sub.ownerId, sub.viewerId));
    }
  }
}
