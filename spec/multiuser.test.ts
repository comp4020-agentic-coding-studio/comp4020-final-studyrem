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
