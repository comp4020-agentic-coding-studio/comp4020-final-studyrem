import { randomBytes } from "node:crypto";
import { expect, inject, it } from "vitest";

// Decisions 4/5/33: search is scoped to fields you already hold — one
// criterion per field, built from the searcher's own fields server-side,
// never from request params — and only returns users who also hold that
// exact field, nothing else of theirs.
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

// Rows on /search are positional, in the same order fields were added
// (loadFields' own ORDER BY created_at) — queries[i] searches the i-th
// field the signed-in user holds.
const search = (cookie: string, queries: string[], opts: { partial?: boolean } = {}): Promise<Response> => {
  const params = new URLSearchParams({ searched: "1" });
  queries.forEach((q, i) => params.set(`q_${i}`, q));
  if (opts.partial) params.set("partial", "on");
  return fetch(at(`/search?${params.toString()}`), { headers: { Cookie: cookie } });
};

// Each test picks its own field title so tests running against the same
// live app/database never see each other's fields.
const fieldTitle = (): string => `field-${randomBytes(4).toString("hex")}`;

it("redirects an anonymous search request to log in", async () => {
  const res = await fetch(at("/search"), { redirect: "manual" });
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toMatch(/\/$/);
});

it("a user with no fields sees the search page with no criteria to fill in", async () => {
  const cookie = await signUp();
  const res = await fetch(at("/search"), { headers: { Cookie: cookie } });
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toMatch(/Add a field on your profile first/);
});

it("finds another user who holds the same field, matching on content", async () => {
  const title = fieldTitle();
  const a = await signUp();
  const b = await signUp();
  await addField(a, title, "Mostly co-op, love Hanabi.");
  await addField(b, title, "Big fan of Wingspan.");

  const res = await search(a, ["wingspan"]);
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

  const res = await search(a, ["co-op"]);
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).not.toMatch(/jazz/i);
});

it("never includes the searcher's own field in their own results", async () => {
  const title = fieldTitle();
  const a = await signUp();
  await addField(a, title, "Mostly co-op.");

  const res = await search(a, ["co-op"]);
  const text = await res.text();
  expect(text).toMatch(/Nobody matches every field yet\./);
});

it("a result shows only the matched username and field content, nothing else of theirs", async () => {
  const title = fieldTitle();
  const otherTitle = fieldTitle();
  const a = await signUp();
  const b = await signUp();
  await addField(a, title, "Mostly co-op.");
  await addField(b, title, "Love party games.");
  await addField(b, otherTitle, "Secretly into polka.");

  const res = await search(a, ["party"]);
  const text = await res.text();
  expect(text).toMatch(/party games/i);
  expect(text).not.toMatch(/polka/i);
});

it("blank criteria show the form with no results, not every holder of the field", async () => {
  const title = fieldTitle();
  const a = await signUp();
  const b = await signUp();
  await addField(a, title, "Mostly co-op.");
  await addField(b, title, "Love party games.");

  const res = await search(a, [""]);
  const text = await res.text();
  expect(text).not.toMatch(/party games/i);
  expect(text).not.toMatch(/Nobody matches every field yet\./);
});

it("matches titles case-insensitively, per the fields.title column's own collation", async () => {
  const title = fieldTitle();
  const a = await signUp();
  const b = await signUp();
  await addField(a, title.toLowerCase(), "Mostly co-op.");
  await addField(b, title.toUpperCase(), "Love party games.");

  const res = await search(a, ["party"]);
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toMatch(/party games/i);
});

it("decision 33: with partial matching off (default), a user matching only one of two fields never appears", async () => {
  const titleA = fieldTitle();
  const titleB = fieldTitle();
  const a = await signUp();
  const partialOnly = await signUp();
  await addField(a, titleA, "Dune");
  await addField(a, titleB, "Chess");
  await addField(partialOnly, titleA, "Dune");
  await addField(partialOnly, titleB, "Go"); // doesn't match "chess"

  const res = await search(a, ["dune", "chess"]);
  const text = await res.text();
  expect(text).not.toMatch(/Matches some/);
});

it("decision 33: with partial matching off (default), only full matches across every field appear", async () => {
  const titleA = fieldTitle();
  const titleB = fieldTitle();
  const a = await signUp();
  const full = await signUp();
  const partialOnly = await signUp();
  await addField(a, titleA, "Dune");
  await addField(a, titleB, "Chess");
  await addField(full, titleA, "Dune");
  await addField(full, titleB, "Chess variant");
  await addField(partialOnly, titleA, "Dune");
  await addField(partialOnly, titleB, "Go");

  const res = await search(a, ["dune", "chess"]);
  const text = await res.text();
  expect(text).toMatch(/Matches all 2/);
  expect(text).not.toMatch(/Matches some/);
});

it("decision 33: with partial matching on, a user matching only some fields appears under 'Matches some'", async () => {
  const titleA = fieldTitle();
  const titleB = fieldTitle();
  const a = await signUp();
  const full = await signUp();
  const partialOnly = await signUp();
  await addField(a, titleA, "Dune");
  await addField(a, titleB, "Chess");
  await addField(full, titleA, "Dune");
  await addField(full, titleB, "Chess variant");
  await addField(partialOnly, titleA, "Dune");
  await addField(partialOnly, titleB, "Go");

  const res = await search(a, ["dune", "chess"], { partial: true });
  const text = await res.text();
  const allIdx = text.indexOf("Matches all 2");
  const someIdx = text.indexOf("Matches some");
  expect(allIdx).toBeGreaterThanOrEqual(0);
  expect(someIdx).toBeGreaterThan(allIdx);
});
