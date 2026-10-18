import { randomBytes } from "node:crypto";
import { expect, inject, it } from "vitest";

// Accounts and the login gate. The mutual-field live view is covered in
// spec/mutual-view.test.ts.
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

it("keeps /me behind a login", async () => {
  const res = await fetch(at("/me"), { redirect: "manual" });
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toMatch(/\/$/);

  const cookie = await signUp();
  expect((await fetch(at("/me"), { headers: { Cookie: cookie } })).status).toBe(200);
});

it("refuses owner actions without a session", async () => {
  expect((await fetch(at("/me/fields"), form({ title: "x", content: "y" }))).status).toBe(401);
});

// Regression test for the audit finding: logout only cleared the cookie
// client-side, so a captured pre-logout cookie kept working indefinitely.
it("invalidates the session on logout, not just the cookie it hands back", async () => {
  const cookie = await signUp();
  expect((await fetch(at("/me"), { headers: { Cookie: cookie } })).status).toBe(200);

  const logoutRes = await post("/logout", cookie);
  expect(logoutRes.status).toBe(303);

  // Replay the OLD cookie value directly — simulates a captured token used
  // after the legitimate user logged out, bypassing the client-side clear.
  const replay = await fetch(at("/me"), { headers: { Cookie: cookie }, redirect: "manual" });
  expect(replay.status).toBe(303);
  expect(replay.headers.get("location")).toMatch(/\/$/);
});

it("tells the owner when a submission was rejected or truncated, not just silently redirecting", async () => {
  const cookie = await signUp();

  const emptyTitle = await post("/me/fields", cookie, { title: "", content: "something" });
  expect(emptyTitle.status).toBe(303);
  expect(emptyTitle.headers.get("location")).toBe("/me?error=empty-field");
  const afterEmpty = await (await fetch(at(emptyTitle.headers.get("location") as string), { headers: { Cookie: cookie } })).text();
  expect(afterEmpty).toMatch(/nothing was added/);

  const oversizedTitle = "A".repeat(200);
  const truncated = await post("/me/fields", cookie, { title: oversizedTitle, content: "fine" });
  expect(truncated.status).toBe(303);
  expect(truncated.headers.get("location")).toBe("/me?notice=truncated");
  const afterTruncated = await (await fetch(at(truncated.headers.get("location") as string), { headers: { Cookie: cookie } })).text();
  expect(afterTruncated).toMatch(/trimmed to fit/);
  expect(afterTruncated).toMatch(new RegExp("A".repeat(80)));
  expect(afterTruncated).not.toMatch(new RegExp("A".repeat(81)));

  const normal = await post("/me/fields", cookie, { title: "normal title", content: "normal content" });
  expect(normal.headers.get("location")).toBe("/me");
});

it("logs back in with a fresh session after logout, fields intact", async () => {
  const username = `t${randomBytes(6).toString("hex")}`;
  const password = "correct horse";
  const signupRes = await fetch(at("/signup"), form({ username, password }));
  const cookie1 = signupRes.headers.get("set-cookie")?.split(";")[0] as string;
  await post("/me/fields", cookie1, { title: "board games", content: "Catan" });
  await post("/logout", cookie1);

  const loginRes = await fetch(at("/login"), form({ username, password }));
  expect(loginRes.status).toBe(303);
  const cookie2 = loginRes.headers.get("set-cookie")?.split(";")[0] as string;
  const page = await (await fetch(at("/me"), { headers: { Cookie: cookie2 } })).text();
  expect(page).toMatch(/board games/);
});
