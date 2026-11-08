import { randomBytes } from "node:crypto";
import { expect, inject, it } from "vitest";

// Password recovery (security questions), since there's no email to verify a
// reset through. An account with no questions set up can't be recovered at
// all — this suite checks that boundary holds, that the generic
// doesn't-exist/not-set-up message never distinguishes the two, that
// answers are normalized but never echoed back, and that both a direct
// password change and a recovery reset invalidate every existing session.
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
  password: string;
}

const PASSWORD = "correct horse battery";

const QUESTIONS = [
  { question: "What was the name of your first pet?", answer: "Rex" },
  { question: "What city were you born in?", answer: "Canberra" },
  { question: "What was your childhood nickname?", answer: "Bug" },
];

async function signUp(): Promise<Account> {
  const username = `t${randomBytes(6).toString("hex")}`;
  const res = await fetch(at("/signup"), form({ username, password: PASSWORD }));
  expect(res.status).toBe(303);
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  expect(cookie).toMatch(/^sid=/);
  return { cookie: cookie as string, username, password: PASSWORD };
}

const post = (path: string, cookie: string | undefined, data: Record<string, string> = {}): Promise<Response> =>
  fetch(at(path), { ...form(data), headers: { ...form(data).headers, ...(cookie ? { Cookie: cookie } : {}) } });

const text = (res: Response): Promise<string> => res.text();

async function setUpQuestions(account: Account): Promise<void> {
  const data: Record<string, string> = { current_password: account.password };
  QUESTIONS.forEach((q, i) => {
    data[`question-${i}`] = q.question;
    data[`answer-${i}`] = q.answer;
  });
  const res = await post("/me/account/security-questions", account.cookie, data);
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toMatch(/notice=questions-saved/);
}

const loginStatus = (username: string, password: string): Promise<number> =>
  post("/login", undefined, { username, password }).then((r) => r.status);

it("an account with no security questions set up gets the generic message, not a real question", async () => {
  const account = await signUp();
  const res = await post("/forgot-password", undefined, { username: account.username });
  const body = await text(res);
  expect(body).not.toMatch(/What was the name of your first pet/);
  expect(body).toMatch(/recovery only works for accounts that opted in/);
});

it("a nonexistent username gets the exact same generic message as a real account with no questions", async () => {
  const account = await signUp();
  const realNoQuestions = await text(await post("/forgot-password", undefined, { username: account.username }));
  const nonexistent = await text(
    await post("/forgot-password", undefined, { username: `t${randomBytes(6).toString("hex")}` }),
  );
  const extractMessage = (html: string): string => html.match(/<p class="error"[^>]*>([^<]*)<\/p>/)?.[1] ?? "";
  expect(extractMessage(realNoQuestions)).toBe(extractMessage(nonexistent));
});

it("setting up security questions requires the current password", async () => {
  const account = await signUp();
  const data: Record<string, string> = { current_password: "wrong password entirely" };
  QUESTIONS.forEach((q, i) => {
    data[`question-${i}`] = q.question;
    data[`answer-${i}`] = q.answer;
  });
  const res = await post("/me/account/security-questions", account.cookie, data);
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toMatch(/error=wrong-password/);

  // Confirmed not set up: /forgot-password still gives the generic message.
  const body = await text(await post("/forgot-password", undefined, { username: account.username }));
  expect(body).not.toMatch(/What was the name of your first pet/);
});

it("once set up, /forgot-password shows the real questions, in order", async () => {
  const account = await signUp();
  await setUpQuestions(account);

  const body = await text(await post("/forgot-password", undefined, { username: account.username }));
  for (const { question } of QUESTIONS) {
    expect(body).toContain(question);
  }
});

it("answers are never echoed back on the account page after being set", async () => {
  const account = await signUp();
  await setUpQuestions(account);

  const res = await fetch(at("/me/account"), { headers: { Cookie: account.cookie } });
  const body = await text(res);
  expect(body).not.toMatch(/Rex|Canberra|Bug/);
  expect(body).toMatch(/Yours are set up/);
});

it("answers are normalized (trim + case-insensitive) but a wrong answer still fails", async () => {
  const account = await signUp();
  await setUpQuestions(account);

  const wrongRes = await post("/forgot-password/reset", undefined, {
    username: account.username,
    "answer-0": "Definitely Not Rex",
    "answer-1": QUESTIONS[1].answer,
    "answer-2": QUESTIONS[2].answer,
    new_password: "a brand new password 1",
  });
  expect(await text(wrongRes)).toMatch(/didn't match/);
  expect(await loginStatus(account.username, account.password)).toBe(303);

  const rightRes = await post("/forgot-password/reset", undefined, {
    username: account.username,
    "answer-0": "  REX  ",
    "answer-1": "canberra",
    "answer-2": "BUG",
    new_password: "a brand new password 1",
  });
  expect(rightRes.status).toBe(303);
  expect(rightRes.headers.get("location")).toMatch(/notice=password-reset/);
});

it("a successful reset invalidates every existing session, same as logout", async () => {
  const account = await signUp();
  await setUpQuestions(account);

  const preResetMe = await fetch(at("/me"), { headers: { Cookie: account.cookie } });
  expect(preResetMe.status).toBe(200);

  const resetRes = await post("/forgot-password/reset", undefined, {
    username: account.username,
    "answer-0": QUESTIONS[0].answer,
    "answer-1": QUESTIONS[1].answer,
    "answer-2": QUESTIONS[2].answer,
    new_password: "post reset password 1",
  });
  expect(resetRes.status).toBe(303);

  const postResetMe = await fetch(at("/me"), { headers: { Cookie: account.cookie }, redirect: "manual" });
  expect(postResetMe.status).toBe(303); // bounced to / — the old cookie no longer authenticates

  expect(await loginStatus(account.username, account.password)).toBe(401);
  expect(await loginStatus(account.username, "post reset password 1")).toBe(303);
});

it("changing the password directly (not via recovery) also requires the current password and invalidates other sessions", async () => {
  const account = await signUp();

  const wrongRes = await post("/me/account/password", account.cookie, {
    current_password: "not the right password",
    new_password: "irrelevant new password 1",
  });
  expect(wrongRes.headers.get("location")).toMatch(/error=wrong-password/);
  expect(await loginStatus(account.username, account.password)).toBe(303);

  const rightRes = await post("/me/account/password", account.cookie, {
    current_password: account.password,
    new_password: "changed password here 1",
  });
  expect(rightRes.status).toBe(303);
  expect(rightRes.headers.get("location")).toMatch(/notice=password-changed/);

  // The cookie used to make the change is itself now stale (session_version
  // bumped), same as a direct logout would do.
  const postChangeMe = await fetch(at("/me"), { headers: { Cookie: account.cookie }, redirect: "manual" });
  expect(postChangeMe.status).toBe(303);

  expect(await loginStatus(account.username, account.password)).toBe(401);
  expect(await loginStatus(account.username, "changed password here 1")).toBe(303);
});

it("requires 3 distinct questions and refuses a repeated one", async () => {
  const account = await signUp();
  const res = await post("/me/account/security-questions", account.cookie, {
    current_password: account.password,
    "question-0": QUESTIONS[0].question,
    "answer-0": "Rex",
    "question-1": QUESTIONS[0].question, // repeated
    "answer-1": "Rex again",
    "question-2": QUESTIONS[2].question,
    "answer-2": "Bug",
  });
  expect(res.headers.get("location")).toMatch(/error=invalid-questions/);
});
