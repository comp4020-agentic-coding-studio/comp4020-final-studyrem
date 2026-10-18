import { randomBytes } from "node:crypto";
import { expect, inject, it } from "vitest";

// Decision 4, live: a viewer sees a field on someone else's profile only if
// they hold that same field themselves, and an already-open view refreshes
// within ~1s when EITHER side's matching fields change — not just the
// owner's, since what's shown depends on both people's data.
const baseUrl = inject("baseUrl");
const at = (path: string): URL => new URL(path, baseUrl);

const form = (data: Record<string, string>): RequestInit => ({
  method: "POST",
  redirect: "manual",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(data).toString(),
});

interface Account {
  cookie: string;
  username: string;
}

async function signUp(): Promise<Account> {
  const username = `t${randomBytes(6).toString("hex")}`;
  const res = await fetch(at("/signup"), form({ username, password: "correct horse" }));
  expect(res.status).toBe(303);
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  expect(cookie).toMatch(/^sid=/);
  return { cookie: cookie as string, username };
}

const post = (path: string, cookie: string, data: Record<string, string> = {}): Promise<Response> =>
  fetch(at(path), { ...form(data), headers: { ...form(data).headers, Cookie: cookie } });

const addField = (account: Account, title: string, content: string): Promise<Response> =>
  post("/me/fields", account.cookie, { title, content });

const fieldTitle = (): string => `field-${randomBytes(4).toString("hex")}`;

const viewProfile = (viewer: Account, ownerUsername: string): Promise<Response> =>
  fetch(at(`/u/${ownerUsername}`), { headers: { Cookie: viewer.cookie } });

// Reads server-sent events off a mutual-profile stream, one at a time.
async function openStream(viewer: Account, ownerUsername: string) {
  const controller = new AbortController();
  const res = await fetch(at(`/u/${ownerUsername}/events`), {
    headers: { Cookie: viewer.cookie },
    signal: controller.signal,
  });
  expect(res.status).toBe(200);
  const reader = (res.body as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  return {
    async next(timeoutMs: number): Promise<{ event: string; data: unknown }> {
      const deadline = Date.now() + timeoutMs;
      for (;;) {
        const end = buffer.indexOf("\n\n");
        if (end !== -1) {
          const block = buffer.slice(0, end);
          buffer = buffer.slice(end + 2);
          const event = block.match(/^event: (.*)$/m)?.[1];
          const data = block.match(/^data: (.*)$/m)?.[1];
          if (event && data !== undefined) return { event, data: JSON.parse(data) };
          continue;
        }
        const left = deadline - Date.now();
        if (left <= 0) throw new Error(`no event within ${timeoutMs}ms`);
        const chunk = await Promise.race([
          reader.read(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`no event within ${timeoutMs}ms`)), left)),
        ]);
        if (chunk.done) throw new Error("stream ended");
        buffer += decoder.decode(chunk.value, { stream: true });
      }
    },
    close: () => controller.abort(),
  };
}

const titles = (data: unknown): string[] => (data as { title: string }[]).map((f) => f.title);

it("redirects an anonymous visitor to log in", async () => {
  const owner = await signUp();
  const res = await fetch(at(`/u/${owner.username}`), { redirect: "manual" });
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toMatch(/\/$/);
});

it("redirects viewing your own username to /me", async () => {
  const a = await signUp();
  const res = await fetch(at(`/u/${a.username}`), { headers: { Cookie: a.cookie }, redirect: "manual" });
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toMatch(/\/me$/);
});

it("404s an unknown username", async () => {
  const viewer = await signUp();
  const res = await viewProfile(viewer, `nobody-${randomBytes(6).toString("hex")}`);
  expect(res.status).toBe(404);
});

it("shows only fields both people hold, not the owner's other fields", async () => {
  const title = fieldTitle();
  const otherTitle = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Mostly co-op.");
  await addField(owner, otherTitle, "A field the viewer doesn't hold.");
  await addField(viewer, title, "Whatever the viewer wrote, irrelevant to what's shown.");

  const res = await viewProfile(viewer, owner.username);
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toMatch(/Mostly co-op\./);
  expect(text).not.toMatch(/A field the viewer doesn't hold\./);
});

it("shows the empty state, not an error, when there's no overlap", async () => {
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, fieldTitle(), "Something the viewer doesn't hold.");

  const res = await viewProfile(viewer, owner.username);
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toMatch(/don't share any fields/);
});

it("pushes a live update when the OWNER adds a matching field", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(viewer, title, "The viewer's own matching field.");

  const stream = await openStream(viewer, owner.username);
  try {
    expect(titles((await stream.next(1000)).data)).toEqual([]);
    await addField(owner, title, "Owner just added this.");
    const update = await stream.next(1000);
    expect(update.event).toBe("fields");
    expect(titles(update.data)).toEqual([title]);
  } finally {
    stream.close();
  }
});

it("pushes a live update when the VIEWER adds a matching field (not just the owner)", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Owner already had this.");

  const stream = await openStream(viewer, owner.username);
  try {
    // Viewer doesn't hold the field yet, so nothing shows.
    expect(titles((await stream.next(1000)).data)).toEqual([]);
    await addField(viewer, title, "Viewer just added this on their own page.");
    const update = await stream.next(1000);
    expect(update.event).toBe("fields");
    expect(titles(update.data)).toEqual([title]);
  } finally {
    stream.close();
  }
});
