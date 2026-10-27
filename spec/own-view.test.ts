import { randomBytes } from "node:crypto";
import { expect, inject, it } from "vitest";

// Regression test: opening two tabs on your OWN profile and editing a field
// in one left the other stale until reload. GET /me/events (src/server.ts)
// and subscribeOwnView (src/live.ts) push every field add/remove to every
// other open /me tab for the same account.
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

// Reads server-sent events off an own-profile stream, one at a time.
async function openStream(account: Account) {
  const controller = new AbortController();
  const res = await fetch(at("/me/events"), {
    headers: { Cookie: account.cookie },
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

it("redirects an anonymous visitor away from /me/events", async () => {
  const res = await fetch(at("/me/events"), { redirect: "manual" });
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toMatch(/\/$/);
});

it("pushes the current field list as soon as a tab connects", async () => {
  const user = await signUp();
  const title = fieldTitle();
  await addField(user, title, "Written before either tab was open.");

  const stream = await openStream(user);
  try {
    const first = await stream.next(1000);
    expect(first.event).toBe("fields");
    expect(titles(first.data)).toEqual([title]);
  } finally {
    stream.close();
  }
});

it("pushes a live update to one open tab when another tab adds a field", async () => {
  const user = await signUp();
  const stream = await openStream(user);
  try {
    expect(titles((await stream.next(1000)).data)).toEqual([]);

    const title = fieldTitle();
    await addField(user, title, "Added from a second tab.");

    const update = await stream.next(1000);
    expect(update.event).toBe("fields");
    expect(titles(update.data)).toEqual([title]);
  } finally {
    stream.close();
  }
});

it("pushes a live update to one open tab when another tab removes a field", async () => {
  const user = await signUp();
  const title = fieldTitle();
  const addRes = await addField(user, title, "About to be removed from a second tab.");
  expect(addRes.status).toBe(303);

  const stream = await openStream(user);
  try {
    expect(titles((await stream.next(1000)).data)).toEqual([title]);

    const mePage = await (await fetch(at("/me"), { headers: { Cookie: user.cookie } })).text();
    const fieldId = mePage.match(/\/me\/fields\/([^"]+)\/delete/)?.[1];
    expect(fieldId).toBeTruthy();
    const deleteRes = await post(`/me/fields/${fieldId}/delete`, user.cookie);
    expect(deleteRes.status).toBe(303);

    const update = await stream.next(1000);
    expect(update.event).toBe("fields");
    expect(titles(update.data)).toEqual([]);
  } finally {
    stream.close();
  }
});

it("never pushes another account's edits onto this account's own-view stream", async () => {
  const user = await signUp();
  const other = await signUp();

  const stream = await openStream(user);
  try {
    expect(titles((await stream.next(1000)).data)).toEqual([]);

    await addField(other, fieldTitle(), "Someone else's field, unrelated account.");

    await expect(stream.next(300)).rejects.toThrow(/no event within/);
  } finally {
    stream.close();
  }
});
