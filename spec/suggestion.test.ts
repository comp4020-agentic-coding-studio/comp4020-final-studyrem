import { randomBytes } from "node:crypto";
import { expect, inject, it } from "vitest";

// Decision 9: a contextual per-encounter suggestion, computed from the
// specific profile being viewed, capped at once per field per viewer per
// week, and anonymized toward the owner (never logged or surfaced back to
// them that a suggestion was shown). It's computed while viewing the owner's
// profile but only ever shown to the viewer later, on their own /me — never
// on the owner's profile itself, so the owner is never named as its source.
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

const viewOwnProfile = (viewer: Account): Promise<string> =>
  fetch(at("/me"), { headers: { Cookie: viewer.cookie } }).then((r) => r.text());

it("suggests a field the owner holds and the viewer doesn't — on the viewer's own profile, not the owner's", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Owner's content under this field.");

  const ownerPage = await viewProfile(viewer, owner.username);
  expect(ownerPage).not.toMatch(/has a field you don't/);

  const ownPage = await viewOwnProfile(viewer);
  expect(ownPage).toMatch(new RegExp(title, "i"));
  expect(ownPage).toMatch(/has a field you don't/);
});

it("never names the owner, or shows their content, in the suggestion on the viewer's own profile", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Something only the owner should be shown having said.");

  await viewProfile(viewer, owner.username);
  const ownPage = await viewOwnProfile(viewer);
  expect(ownPage).not.toMatch(/Something only the owner should be shown having said\./);
  expect(ownPage).not.toMatch(new RegExp(owner.username, "i"));
});

it("suggests nothing when the viewer already holds every field the owner has", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Owner's content.");
  await addField(viewer, title, "Viewer already has this one too.");

  await viewProfile(viewer, owner.username);
  const ownPage = await viewOwnProfile(viewer);
  expect(ownPage).not.toMatch(/has a field you don't/);
});

it("suggests nothing when the owner has no fields at all", async () => {
  const owner = await signUp();
  const viewer = await signUp();

  await viewProfile(viewer, owner.username);
  const ownPage = await viewOwnProfile(viewer);
  expect(ownPage).not.toMatch(/has a field you don't/);
});

it("doesn't repeat the same suggestion to the same viewer on an immediate second encounter (the weekly cap)", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Owner's only extra field.");

  await viewProfile(viewer, owner.username);
  const first = await viewOwnProfile(viewer);
  expect(first).toMatch(/has a field you don't/);

  await viewProfile(viewer, owner.username);
  const second = await viewOwnProfile(viewer);
  expect(second).not.toMatch(/has a field you don't/);
});

it("a pending suggestion is shown once and then cleared, even without a second encounter", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Owner's content.");

  await viewProfile(viewer, owner.username);
  const first = await viewOwnProfile(viewer);
  expect(first).toMatch(/has a field you don't/);

  const second = await viewOwnProfile(viewer);
  expect(second).not.toMatch(/has a field you don't/);
});

it("adding the suggested field works through the normal field-add flow", async () => {
  const title = fieldTitle();
  const owner = await signUp();
  const viewer = await signUp();
  await addField(owner, title, "Owner's content.");

  await viewProfile(viewer, owner.username);
  const before = await viewOwnProfile(viewer);
  expect(before).toMatch(/has a field you don't/);

  const added = await post("/me/fields", viewer.cookie, { title, content: "Viewer's own take." });
  expect(added.status).toBe(303);

  const after = await viewProfile(viewer, owner.username);
  expect(after).toMatch(/Owner's content\./);
});
