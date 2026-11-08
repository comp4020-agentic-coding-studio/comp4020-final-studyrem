// Accounts, each editing their own profile, plus a read-only share link that
// updates live. Plain node:http rather than a framework: the routes fit in one
// file, and a dependency should earn its place.
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { marked } from "marked";
import { audit } from "./audit.ts";
import {
  addField,
  editField,
  bumpSessionVersion,
  createUser,
  DUMMY_PASSWORD_HASH,
  DUMMY_SECURITY_QUESTIONS,
  findUserById,
  findUserByUsername,
  hasSecurityQuestions,
  loadFields,
  loadSecurityQuestions,
  matchingTitles,
  MIN_PASSWORD_LENGTH,
  mutualFields,
  recordSuggestionShown,
  removeField,
  searchFields,
  SECURITY_ANSWER_MIN_LENGTH,
  SECURITY_QUESTION_CHOICES,
  setPendingSuggestion,
  setSecurityQuestions,
  suggestField,
  takePendingSuggestion,
  updatePassword,
  verifyPassword,
  verifySecurityAnswers,
} from "./data.ts";
import type { User } from "./data.ts";
import { notifyFieldsChanged, subscribeMutualView, subscribeOwnView } from "./live.ts";
import {
  renderAccount,
  renderForgotPassword,
  renderForgotPasswordQuestions,
  renderLogin,
  renderManual,
  renderMutualProfile,
  renderNotFound,
  renderOwner,
  renderReadme,
  renderSearch,
} from "./page.ts";
import type { SearchRow } from "./page.ts";
import { clearedCookie, sessionCookie, sessionPayload } from "./session.ts";

const PORT = Number(process.env.PORT ?? 8080);

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const html = (res: ServerResponse, status: number, body: string): void => {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(body);
};

const json = (res: ServerResponse, status: number, body: unknown): void => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
};

const redirect = (res: ServerResponse, location: string, cookie?: string): void => {
  res.writeHead(303, cookie ? { Location: location, "Set-Cookie": cookie } : { Location: location });
  res.end();
};

const currentUser = (req: IncomingMessage): User | undefined => {
  const payload = sessionPayload(req);
  if (!payload) return undefined;
  const user = findUserById(payload.userId);
  // A stale sessionVersion means this cookie was issued before the user's
  // most recent logout (or any other future event that bumps it) — treat it
  // exactly like no session at all, not a lookup failure.
  if (!user || user.sessionVersion !== payload.sessionVersion) return undefined;
  return user;
};

function profileUrl(req: IncomingMessage, username: string): string {
  const proto = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  return `${proto}://${req.headers.host ?? "localhost"}/u/${encodeURIComponent(username)}`;
}

const server = createServer((req, res) => {
  void (async () => {
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      const path = url.pathname;
      const method = req.method ?? "GET";

      if (method === "GET" && path === "/") {
        if (currentUser(req)) return redirect(res, "/me");
        const notice =
          url.searchParams.get("notice") === "password-reset"
            ? "Your password was reset. Log in with your new one."
            : undefined;
        return html(res, 200, renderLogin(undefined, "login", notice));
      }

      if (method === "POST" && (path === "/signup" || path === "/login")) {
        const params = new URLSearchParams(await readBody(req));
        const username = (params.get("username") ?? "").trim();
        const password = params.get("password") ?? "";
        if (path === "/signup") {
          try {
            const user = createUser(username, password);
            audit("signup", { userId: user.id, username: user.username });
            return redirect(res, "/me", sessionCookie(req, user.id, user.sessionVersion));
          } catch (err) {
            return html(res, 400, renderLogin((err as Error).message, "signup"));
          }
        }
        const user = findUserByUsername(username);
        // Always runs a hash compare, existing username or not — otherwise
        // an unknown username short-circuits before hashing and the timing
        // gap (microseconds vs. a deliberately slow scrypt compare) leaks
        // which usernames exist even though the response body doesn't.
        const valid = verifyPassword(user?.passwordHash ?? DUMMY_PASSWORD_HASH, password);
        if (!user || !valid) {
          audit("login_failed", { username });
          return html(res, 401, renderLogin("That username and password don't match."));
        }
        audit("login", { userId: user.id, username: user.username });
        return redirect(res, "/me", sessionCookie(req, user.id, user.sessionVersion));
      }

      if (method === "POST" && path === "/logout") {
        const user = currentUser(req);
        if (user) {
          bumpSessionVersion(user.id);
          audit("logout", { userId: user.id, username: user.username });
        }
        return redirect(res, "/", clearedCookie(req));
      }

      // Password recovery: there's no email to verify a reset through, so
      // this only works for an account that opted into security questions
      // (decision: old accounts, and anyone who hasn't set these up, simply
      // can't recover — stated plainly in renderForgotPassword, not hidden).
      // Step 1 only ever shows one generic message, whatever the actual
      // reason recovery can't proceed — nonexistent username and
      // exists-but-no-questions-set-up read identically, so this page can't
      // be used to probe which usernames are registered.
      const NO_RECOVERY_MESSAGE =
        "If that account exists and has security questions set up, you'll see them next. Otherwise, there's nothing more this page can do — recovery only works for accounts that opted in.";

      if (method === "GET" && path === "/forgot-password") {
        return html(res, 200, renderForgotPassword());
      }

      if (method === "POST" && path === "/forgot-password") {
        const params = new URLSearchParams(await readBody(req));
        const username = (params.get("username") ?? "").trim();
        const user = findUserByUsername(username);
        const questions = user ? loadSecurityQuestions(user.id) : [];
        if (!user || questions.length !== 3) {
          audit("password_reset_requested", { username, outcome: "no-recovery-available" });
          return html(res, 200, renderForgotPassword(NO_RECOVERY_MESSAGE));
        }
        audit("password_reset_requested", { username, outcome: "questions-shown" });
        return html(
          res,
          200,
          renderForgotPasswordQuestions(
            user.username,
            questions.map((q) => q.question),
          ),
        );
      }

      if (method === "POST" && path === "/forgot-password/reset") {
        const params = new URLSearchParams(await readBody(req));
        const username = (params.get("username") ?? "").trim();
        const newPassword = params.get("new_password") ?? "";
        const user = findUserByUsername(username);
        const stored = user ? loadSecurityQuestions(user.id) : [];
        // No real questions to answer — shouldn't happen via the normal
        // step 1 → step 2 flow, but reachable by posting here directly.
        // Falls back to the same generic step-1 message rather than
        // rendering a fake question form. `stored` only has 3 rows when
        // `user` exists (loadSecurityQuestions is only ever called just
        // above, guarded by `user ?`), so `user` is defined from here on.
        if (!user || stored.length !== 3) {
          audit("password_reset_failed", { username });
          return html(res, 200, renderForgotPassword(NO_RECOVERY_MESSAGE));
        }
        // Always verifies all 3 answers, correct account or not, so this
        // path doesn't resolve measurably faster for a wrong answer than a
        // right one — the same timing discipline as DUMMY_PASSWORD_HASH.
        const answers = [0, 1, 2].map((i) => params.get(`answer-${i}`) ?? "");
        const answersCorrect = verifySecurityAnswers(stored, answers);
        if (!answersCorrect || newPassword.length < MIN_PASSWORD_LENGTH) {
          audit("password_reset_failed", { username });
          const message =
            newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH
              ? `New passwords need at least ${MIN_PASSWORD_LENGTH} characters.`
              : "One or more answers didn't match. Try again.";
          return html(
            res,
            200,
            renderForgotPasswordQuestions(
              username,
              stored.map((q) => q.question),
              message,
            ),
          );
        }
        updatePassword(user.id, newPassword);
        // Same reasoning as a normal password change: logs out every
        // existing session, since a credential just changed through a
        // weaker-assurance channel than a real login.
        bumpSessionVersion(user.id);
        audit("password_reset", { userId: user.id, username: user.username });
        return redirect(res, "/?notice=password-reset");
      }

      if (path === "/me" || path.startsWith("/me/")) {
        const user = currentUser(req);
        if (!user) {
          if (method === "GET") return redirect(res, "/");
          audit("unauthorized", { path, method });
          res.writeHead(401, { "Content-Type": "text/plain" });
          return res.end("log in first");
        }

        if (method === "GET" && path === "/me/events") {
          return subscribeOwnView(user.id, res, loadFields(user.id));
        }

        if (method === "GET" && path === "/me") {
          const message = {
            "empty-field": "A field needs both a title and something to say — nothing was added.",
            truncated: "That was added, but trimmed to fit the length limits.",
          }[url.searchParams.get("error") ?? url.searchParams.get("notice") ?? ""];
          const isError = url.searchParams.has("error");
          const suggestion = takePendingSuggestion(user.id);
          return html(
            res,
            200,
            renderOwner(
              user.username,
              loadFields(user.id),
              profileUrl(req, user.username),
              message,
              isError,
              suggestion,
            ),
          );
        }

        if (method === "POST" && path === "/me/fields") {
          const params = new URLSearchParams(await readBody(req));
          const rawTitle = (params.get("title") ?? "").trim();
          const rawContent = (params.get("content") ?? "").trim();
          if (!rawTitle || !rawContent) {
            return redirect(res, "/me?error=empty-field");
          }
          const title = rawTitle.slice(0, 80);
          const content = rawContent.slice(0, 2000);
          addField(user.id, title, content);
          notifyFieldsChanged(user.id);
          audit("field_added", { userId: user.id, username: user.username, title });
          const truncated = title.length < rawTitle.length || content.length < rawContent.length;
          return redirect(res, truncated ? "/me?notice=truncated" : "/me");
        }

        const edit = method === "POST" && path.match(/^\/me\/fields\/([^/]+)\/edit$/);
        if (edit) {
          const fieldId = decodeURIComponent(edit[1]);
          const existing = loadFields(user.id).find((f) => f.id === fieldId);
          if (!existing) return redirect(res, "/me");
          const params = new URLSearchParams(await readBody(req));
          const rawTitle = (params.get("title") ?? "").trim();
          const rawContent = (params.get("content") ?? "").trim();
          if (!rawTitle || !rawContent) {
            return redirect(res, "/me?error=empty-field");
          }
          const title = rawTitle.slice(0, 80);
          const content = rawContent.slice(0, 2000);
          editField(user.id, fieldId, title, content);
          notifyFieldsChanged(user.id);
          // Decision 19/35: titles only, never content — same discipline as
          // field_added/field_removed. Both old and new titles are logged
          // since a rename is itself the thing worth being able to reconstruct
          // (it changes who this field is mutually visible to).
          audit("field_edited", {
            userId: user.id,
            username: user.username,
            title: existing.title,
            newTitle: title,
          });
          const truncated = title.length < rawTitle.length || content.length < rawContent.length;
          return redirect(res, truncated ? "/me?notice=truncated" : "/me");
        }

        const del = method === "POST" && path.match(/^\/me\/fields\/([^/]+)\/delete$/);
        if (del) {
          const fieldId = decodeURIComponent(del[1]);
          const title = loadFields(user.id).find((f) => f.id === fieldId)?.title;
          removeField(user.id, fieldId);
          notifyFieldsChanged(user.id);
          audit("field_removed", { userId: user.id, username: user.username, title });
          return redirect(res, "/me");
        }

        if (method === "GET" && path === "/me/account") {
          const message = {
            "wrong-password": "That current password isn't right — nothing was changed.",
            "password-too-short": `New passwords need at least ${MIN_PASSWORD_LENGTH} characters.`,
            "invalid-questions": "Choose 3 different questions and answer each with at least 2 characters.",
            "password-changed": "Your password was changed.",
            "questions-saved": "Your security questions were saved.",
          }[url.searchParams.get("error") ?? url.searchParams.get("notice") ?? ""];
          const isError = url.searchParams.has("error");
          const questions = loadSecurityQuestions(user.id).map((q) => q.question);
          return html(res, 200, renderAccount(user.username, questions, message, isError));
        }

        if (method === "POST" && path === "/me/account/password") {
          const params = new URLSearchParams(await readBody(req));
          const currentPassword = params.get("current_password") ?? "";
          const newPassword = params.get("new_password") ?? "";
          if (!verifyPassword(user.passwordHash, currentPassword)) {
            audit("password_change_failed", { userId: user.id, username: user.username });
            return redirect(res, "/me/account?error=wrong-password");
          }
          if (newPassword.length < MIN_PASSWORD_LENGTH) {
            return redirect(res, "/me/account?error=password-too-short");
          }
          updatePassword(user.id, newPassword);
          // A password change is at least as sensitive as a logout (decision
          // 22) — every other session for this account stops working
          // immediately, same as /logout.
          bumpSessionVersion(user.id);
          audit("password_changed", { userId: user.id, username: user.username });
          return redirect(
            res,
            "/me/account?notice=password-changed",
            sessionCookie(req, user.id, user.sessionVersion + 1),
          );
        }

        if (method === "POST" && path === "/me/account/security-questions") {
          const params = new URLSearchParams(await readBody(req));
          const currentPassword = params.get("current_password") ?? "";
          if (!verifyPassword(user.passwordHash, currentPassword)) {
            audit("security_questions_update_failed", { userId: user.id, username: user.username });
            return redirect(res, "/me/account?error=wrong-password");
          }
          const qas = [0, 1, 2].map((i) => ({
            question: (params.get(`question-${i}`) ?? "").trim(),
            answer: params.get(`answer-${i}`) ?? "",
          }));
          const valid =
            qas.every((qa) => (SECURITY_QUESTION_CHOICES as readonly string[]).includes(qa.question)) &&
            new Set(qas.map((qa) => qa.question)).size === 3 &&
            qas.every((qa) => qa.answer.trim().length >= SECURITY_ANSWER_MIN_LENGTH);
          if (!valid) {
            return redirect(res, "/me/account?error=invalid-questions");
          }
          setSecurityQuestions(user.id, qas);
          // Logged as a bare "set up or changed," never which questions or
          // answers — those are exactly as sensitive as the password they
          // exist to recover, so decision 19's content-never-logged rule
          // applies here too.
          audit("security_questions_updated", { userId: user.id, username: user.username });
          return redirect(res, "/me/account?notice=questions-saved");
        }
      }

      if (method === "GET" && path === "/fields/suggest") {
        const user = currentUser(req);
        if (!user) return json(res, 401, { error: "log in first" });
        const q = (url.searchParams.get("q") ?? "").trim();
        return json(res, 200, matchingTitles(q));
      }

      if (method === "GET" && path === "/search") {
        const user = currentUser(req);
        if (!user) {
          audit("unauthorized", { path, method });
          return redirect(res, "/");
        }
        // Decision 34: the searcher adds rows one at a time (the "field"
        // param names which of their titles is on the form, repeated once
        // per active row, in the order they were added), rather than every
        // held field being pre-listed. The title is only ever used to look
        // up a title the user actually holds — never trusted outright — so
        // decision 5's "scoped to a field you already hold" can't be
        // bypassed by naming an arbitrary title in the query string.
        const ownFields = loadFields(user.id);
        // Keyed by lowercase so a title is only ever rendered back in its
        // one true (owner-chosen) casing, never whatever casing happened to
        // arrive in the query string.
        const ownTitlesByLower = new Map(ownFields.map((f) => [f.title.toLowerCase(), f.title]));
        const allowPartial = url.searchParams.get("partial") === "on";
        const addedTitles = url.searchParams.getAll("field");
        const queries = url.searchParams.getAll("q");
        const rows: SearchRow[] = [];
        const seenTitles = new Set<string>();
        addedTitles.forEach((rawTitle, i) => {
          const lower = rawTitle.toLowerCase();
          const ownTitle = ownTitlesByLower.get(lower);
          // A title can only appear once on the form — a duplicate "field"
          // param (crafted, or a stale double-submit) is dropped rather than
          // searching the same title twice.
          if (!ownTitle || seenTitles.has(lower)) return;
          seenTitles.add(lower);
          rows.push({ title: ownTitle, query: (queries[i] ?? "").trim() });
        });
        // Add/Remove (plain GETs, no JS required — see renderSearch's own
        // script for the no-reload layer on top): applied to the row set
        // built above, before it's rendered back or searched.
        const removeIndex = url.searchParams.get("remove");
        if (removeIndex !== null) {
          const i = Number(removeIndex);
          if (Number.isInteger(i) && i >= 0 && i < rows.length) rows.splice(i, 1);
        }
        if (url.searchParams.get("add") === "1") {
          const toAdd = ownTitlesByLower.get((url.searchParams.get("add_field") ?? "").toLowerCase());
          if (toAdd && !seenTitles.has(toAdd.toLowerCase())) rows.push({ title: toAdd, query: "" });
        }
        const availableTitles = ownFields
          .map((f) => f.title)
          .filter((title) => !rows.some((r) => r.title.toLowerCase() === title.toLowerCase()));
        const criteria = rows.filter((r) => r.query !== "");
        const hasSearched = url.searchParams.has("searched");
        const results = criteria.length === 0 ? [] : searchFields(criteria, user.id, allowPartial);
        for (const { title } of criteria) {
          audit("field_search", { userId: user.id, username: user.username, title, resultCount: String(results.length) });
        }
        return html(
          res,
          200,
          renderSearch(user.username, rows, availableTitles, allowPartial, hasSearched, criteria.length, results),
        );
      }

      const profile = method === "GET" && path.match(/^\/u\/([^/]+)(\/events)?\/?$/);
      if (profile) {
        const viewer = currentUser(req);
        if (!viewer) return redirect(res, "/");
        const owner = findUserByUsername(decodeURIComponent(profile[1]));
        if (!owner) return html(res, 404, renderNotFound());
        if (owner.id === viewer.id) return redirect(res, "/me");
        if (profile[2]) {
          audit("profile_connected", {
            ownerId: owner.id,
            ownerUsername: owner.username,
            viewerId: viewer.id,
            viewerUsername: viewer.username,
          });
          return subscribeMutualView(viewer.id, owner.id, res, mutualFields(owner.id, viewer.id));
        }
        audit("profile_viewed", {
          ownerId: owner.id,
          ownerUsername: owner.username,
          viewerId: viewer.id,
          viewerUsername: viewer.username,
        });
        // Decision 9: computed from this specific encounter, but never shown
        // here — it's queued for the viewer's own /me instead, so the owner
        // is never named as its source (only the viewer and the title ever
        // appear in what gets logged about it).
        const suggestion = suggestField(owner.id, viewer.id);
        if (suggestion) {
          recordSuggestionShown(viewer.id, suggestion.title);
          setPendingSuggestion(viewer.id, suggestion.title);
          audit("suggestion_shown", {
            viewerId: viewer.id,
            viewerUsername: viewer.username,
            title: suggestion.title,
          });
        }
        return html(
          res,
          200,
          renderMutualProfile(viewer.username, owner.username, mutualFields(owner.id, viewer.id)),
        );
      }

      if (method === "GET" && path === "/readme/") {
        const bodyHtml = await marked.parse(readFileSync("README.md", "utf8"));
        return html(res, 200, renderReadme(bodyHtml));
      }

      if (method === "GET" && path === "/manual/") {
        const bodyHtml = await marked.parse(readFileSync("docs/USER_MANUAL.md", "utf8"));
        return html(res, 200, renderManual(bodyHtml));
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("not found");
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("internal error");
    }
  })();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on 0.0.0.0:${PORT}`);
});
