import { randomBytes } from "node:crypto";
import { expect, inject, it } from "vitest";

// Decision 9: a contextual per-encounter suggestion, computed from the
// specific profile being viewed, capped at once per field per viewer per
// week, and anonymized toward the owner (never logged or surfaced back to
// them that a suggestion was shown).
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

const viewProfile = (viewer: Account, ownerUsername: string): Promise<string> =>
  fetch(at(`/u/${ownerUsername}`), { headers: { Cookie: viewer.cookie } }).then((r) => r.text());

it("suggests a field the owner holds and the viewer doesn't", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Owner's content under this field.");

  const text = await viewProfile(viewer, owner.username);
  expect(text).toMatch(new RegExp(title, "i"));
  expect(text).toMatch(/has a field you don't/);
});

it("never shows the owner's content under the suggested field, only its title", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Something only the owner should be shown having said.");

  const text = await viewProfile(viewer, owner.username);
  expect(text).not.toMatch(/Something only the owner should be shown having said\./);
});

it("suggests nothing when the viewer already holds every field the owner has", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Owner's content.");
  await addField(viewer, title, "Viewer already has this one too.");

  const text = await viewProfile(viewer, owner.username);
  expect(text).not.toMatch(/has a field you don't/);
});

it("suggests nothing when the owner has no fields at all", async () => {
  const owner = await signUp();
  const viewer = await signUp();

  const text = await viewProfile(viewer, owner.username);
  expect(text).not.toMatch(/has a field you don't/);
});

it("doesn't repeat the same suggestion to the same viewer on an immediate second view (the weekly cap)", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Owner's only extra field.");

  const first = await viewProfile(viewer, owner.username);
  expect(first).toMatch(/has a field you don't/);

  const second = await viewProfile(viewer, owner.username);
  expect(second).not.toMatch(/has a field you don't/);
});

it("adding the suggested field works through the normal field-add flow", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Owner's content.");

  const before = await viewProfile(viewer, owner.username);
  expect(before).toMatch(/has a field you don't/);

  const added = await post("/me/fields", viewer.cookie, { title, content: "Viewer's own take." });
  expect(added.status).toBe(303);

  const after = await viewProfile(viewer, owner.username);
  expect(after).toMatch(/Owner's content\./);
  expect(after).not.toMatch(/has a field you don't/);
});
