import { randomBytes } from "node:crypto";
import { expect, inject, it } from "vitest";

// Decision 10: suggest existing field titles while typing a new one, to
// nudge toward a shared vocabulary without a rigid admin-curated list.
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

const addField = (cookie: string, title: string, content: string): Promise<Response> =>
  post("/me/fields", cookie, { title, content });

const suggest = (cookie: string | undefined, q: string): Promise<Response> =>
  fetch(at(`/fields/suggest?q=${encodeURIComponent(q)}`), cookie ? { headers: { Cookie: cookie } } : {});

const fieldTitle = (): string => `title-${randomBytes(4).toString("hex")}`;

it("refuses an anonymous suggestion request", async () => {
  const res = await suggest(undefined, "x");
  expect(res.status).toBe(401);
});

it("returns nothing for an empty query, even with matching titles in the database", async () => {
  const title = fieldTitle();
  const cookie = await signUp();
  await addField(cookie, title, "something");

  const res = await suggest(cookie, "");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual([]);
});

it("matches by prefix, not substring", async () => {
  const prefix = fieldTitle();
  const matching = `${prefix}-games`;
  const notMatching = `something-${prefix}`;
  const a = await signUp();
  await addField(a, matching, "content a");
  await addField(a, notMatching, "content b");

  const res = await suggest(a, prefix);
  const suggestions = (await res.json()) as { title: string; count: number }[];
  const titles = suggestions.map((s) => s.title);
  expect(titles).toContain(matching);
  expect(titles).not.toContain(notMatching);
});

it("ranks a title held by more users above one held by fewer", async () => {
  const popular = fieldTitle();
  const rare = `${popular}-rare`;
  const a = await signUp();
  const b = await signUp();
  await addField(a, popular, "a's content");
  await addField(b, popular, "b's content");
  await addField(a, rare, "only one holder");

  const res = await suggest(a, popular.slice(0, 6));
  const suggestions = (await res.json()) as { title: string; count: number }[];
  const popularEntry = suggestions.find((s) => s.title === popular);
  const rareEntry = suggestions.find((s) => s.title === rare);
  expect(popularEntry?.count).toBe(2);
  expect(rareEntry?.count).toBe(1);
  expect(suggestions.indexOf(popularEntry!)).toBeLessThan(suggestions.indexOf(rareEntry!));
});

it("a suggestion carries only the title and a count, never content or who holds it", async () => {
  const title = fieldTitle();
  const a = await signUp();
  await addField(a, title, "secret content nobody else should see here");

  const res = await suggest(a, title);
  const text = await res.text();
  expect(text).not.toMatch(/secret content/);
  const suggestions = JSON.parse(text) as Record<string, unknown>[];
  expect(Object.keys(suggestions[0]).sort()).toEqual(["count", "title"]);
});
