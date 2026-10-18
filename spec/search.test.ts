import { randomBytes } from "node:crypto";
import { expect, inject, it } from "vitest";

// Decisions 5/6: search is scoped to a field you already hold, and only
// returns users who also hold that exact field — nothing else of theirs.
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

const search = (cookie: string, title: string, q: string): Promise<Response> =>
  fetch(at(`/search?title=${encodeURIComponent(title)}&q=${encodeURIComponent(q)}`), {
    headers: { Cookie: cookie },
  });

// Each test picks its own field title so tests running against the same
// live app/database never see each other's fields.
const fieldTitle = (): string => `field-${randomBytes(4).toString("hex")}`;

it("refuses to search a field you don't hold yourself", async () => {
  const cookie = await signUp();
  const res = await search(cookie, fieldTitle(), "");
  expect(res.status).toBe(403);
});

it("redirects an anonymous search request to log in", async () => {
  const res = await fetch(at("/search?title=x&q=y"), { redirect: "manual" });
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toMatch(/\/$/);
});

it("finds another user who holds the same field, matching on content", async () => {
  const title = fieldTitle();
  const a = await signUp();
  const b = await signUp();
  await addField(a, title, "Mostly co-op, love Hanabi.");
  await addField(b, title, "Big fan of Wingspan.");

  const res = await search(a, title, "wingspan");
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toMatch(/Wingspan/i);
});

it("never surfaces a user without the searched field, even with matching text elsewhere", async () => {
  const title = fieldTitle();
  const otherTitle = fieldTitle();
  const a = await signUp();
  const c = await signUp();
  await addField(a, title, "Mostly co-op.");
  // c has matching text, but under a different field title.
  await addField(c, otherTitle, "Mostly co-op jazz, actually.");

  const res = await search(a, title, "co-op");
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).not.toMatch(/jazz/i);
});

it("never includes the searcher's own field in their own results", async () => {
  const title = fieldTitle();
  const a = await signUp();
  await addField(a, title, "Mostly co-op.");

  const res = await search(a, title, "co-op");
  const text = await res.text();
  expect(text).toMatch(/Nobody else has this field yet\./);
});

it("a result shows only the matched username and field content, nothing else of theirs", async () => {
  const title = fieldTitle();
  const otherTitle = fieldTitle();
  const a = await signUp();
  const b = await signUp();
  await addField(a, title, "Mostly co-op.");
  await addField(b, title, "Love party games.");
  await addField(b, otherTitle, "Secretly into polka.");

  const res = await search(a, title, "party");
  const text = await res.text();
  expect(text).toMatch(/party games/i);
  expect(text).not.toMatch(/polka/i);
});

it("an empty query shows the form with no results, not every holder of the field", async () => {
  const title = fieldTitle();
  const a = await signUp();
  const b = await signUp();
  await addField(a, title, "Mostly co-op.");
  await addField(b, title, "Love party games.");

  const res = await search(a, title, "");
  const text = await res.text();
  expect(text).not.toMatch(/party games/i);
  expect(text).not.toMatch(/Nobody else has this field yet\./);
});

it("treats the ownership check as case-insensitive, matching the title's own case-insensitive storage", async () => {
  const title = fieldTitle();
  const a = await signUp();
  const b = await signUp();
  await addField(a, title.toLowerCase(), "Mostly co-op.");
  await addField(b, title.toUpperCase(), "Love party games.");

  const res = await search(a, title.toUpperCase(), "party");
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toMatch(/party games/i);
});
