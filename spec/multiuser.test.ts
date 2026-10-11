import { randomBytes } from "node:crypto";
import { expect, inject, it } from "vitest";

// Accounts, the read-only share link, and the crit 9 real-time line: a change
// one person makes reaches every other open session within about a second.
const baseUrl = inject("baseUrl");
const at = (path: string): URL => new URL(path, baseUrl);

const form = (data: Record<string, string>): RequestInit => ({
  method: "POST",
  redirect: "manual",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(data).toString(),
});

async function signUp(): Promise<string> {
  const username = `t${randomBytes(6).toString("hex")}`;
  const res = await fetch(at("/signup"), form({ username, password: "correct horse" }));
  expect(res.status).toBe(303);
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  expect(cookie).toMatch(/^sid=/);
  return cookie as string;
}

const post = (path: string, cookie: string, data: Record<string, string> = {}): Promise<Response> =>
  fetch(at(path), { ...form(data), headers: { ...form(data).headers, Cookie: cookie } });

async function shareToken(cookie: string): Promise<string> {
  await post("/me/share", cookie);
  const page = await (await fetch(at("/me"), { headers: { Cookie: cookie } })).text();
  const token = page.match(/\/s\/([A-Za-z0-9_-]+)/)?.[1];
  expect(token).toBeTruthy();
  return token as string;
}

// Reads server-sent events off a share link's stream, one at a time.
async function openStream(token: string) {
  const controller = new AbortController();
  const res = await fetch(at(`/s/${token}/events`), { signal: controller.signal });
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

it("keeps /me behind a login", async () => {
  const res = await fetch(at("/me"), { redirect: "manual" });
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toMatch(/\/$/);

  const cookie = await signUp();
  expect((await fetch(at("/me"), { headers: { Cookie: cookie } })).status).toBe(200);
});

it("refuses owner actions without a session", async () => {
  expect((await fetch(at("/me/fields"), form({ title: "x", content: "y" }))).status).toBe(401);
  expect((await fetch(at("/me/share"), form({}))).status).toBe(401);
});

it("404s an unknown share link, and the share page can't edit anything", async () => {
  expect((await fetch(at(`/s/${randomBytes(24).toString("base64url")}`))).status).toBe(404);

  const cookie = await signUp();
  const token = await shareToken(cookie);
  const res = await fetch(at(`/s/${token}`));
  expect(res.status).toBe(200);
  expect(await res.text()).not.toMatch(/<form/i);
});

it("pushes adds and removals to an open share view within a second", async () => {
  const cookie = await signUp();
  const token = await shareToken(cookie);
  const stream = await openStream(token);
  try {
    expect(titles((await stream.next(1000)).data)).toEqual([]);

    await post("/me/fields", cookie, { title: "board games", content: "Mostly co-op." });
    const added = await stream.next(1000);
    expect(added.event).toBe("fields");
    expect(titles(added.data)).toEqual(["board games"]);

    const page = await (await fetch(at("/me"), { headers: { Cookie: cookie } })).text();
    const removePath = page.match(/\/me\/fields\/[^"/]+\/delete/)?.[0];
    expect(removePath).toBeTruthy();
    await post(removePath as string, cookie);
    expect(titles((await stream.next(1000)).data)).toEqual([]);
  } finally {
    stream.close();
  }
});

it("ends the old link when it's regenerated", async () => {
  const cookie = await signUp();
  const token = await shareToken(cookie);
  const stream = await openStream(token);
  try {
    await stream.next(1000);
    const fresh = await shareToken(cookie);
    expect(fresh).not.toBe(token);
    expect((await stream.next(1000)).event).toBe("revoked");
    expect((await fetch(at(`/s/${token}`))).status).toBe(404);
    expect((await fetch(at(`/s/${fresh}`))).status).toBe(200);
  } finally {
    stream.close();
  }
});
