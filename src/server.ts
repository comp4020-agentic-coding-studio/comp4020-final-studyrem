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
  createUser,
  findUserById,
  findUserByUsername,
  loadFields,
  mutualFields,
  removeField,
  searchField,
  verifyPassword,
} from "./data.ts";
import type { User } from "./data.ts";
import { notifyFieldsChanged, subscribeMutualView } from "./live.ts";
import { renderLogin, renderMutualProfile, renderNotFound, renderOwner, renderReadme, renderSearch } from "./page.ts";
import { clearedCookie, sessionCookie, sessionUserId } from "./session.ts";

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

const redirect = (res: ServerResponse, location: string, cookie?: string): void => {
  res.writeHead(303, cookie ? { Location: location, "Set-Cookie": cookie } : { Location: location });
  res.end();
};

const currentUser = (req: IncomingMessage): User | undefined => {
  const id = sessionUserId(req);
  return id ? findUserById(id) : undefined;
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
        return html(res, 200, renderLogin());
      }

      if (method === "POST" && (path === "/signup" || path === "/login")) {
        const params = new URLSearchParams(await readBody(req));
        const username = (params.get("username") ?? "").trim();
        const password = params.get("password") ?? "";
        if (path === "/signup") {
          try {
            const user = createUser(username, password);
            audit("signup", { userId: user.id, username: user.username });
            return redirect(res, "/me", sessionCookie(req, user.id));
          } catch (err) {
            return html(res, 400, renderLogin((err as Error).message));
          }
        }
        const user = findUserByUsername(username);
        if (!user || !verifyPassword(user, password)) {
          audit("login_failed", { username });
          return html(res, 401, renderLogin("That username and password don't match."));
        }
        audit("login", { userId: user.id, username: user.username });
        return redirect(res, "/me", sessionCookie(req, user.id));
      }

      if (method === "POST" && path === "/logout") {
        const user = currentUser(req);
        if (user) audit("logout", { userId: user.id, username: user.username });
        return redirect(res, "/", clearedCookie(req));
      }

      if (path === "/me" || path.startsWith("/me/")) {
        const user = currentUser(req);
        if (!user) {
          if (method === "GET") return redirect(res, "/");
          audit("unauthorized", { path, method });
          res.writeHead(401, { "Content-Type": "text/plain" });
          return res.end("log in first");
        }

        if (method === "GET" && path === "/me") {
          return html(res, 200, renderOwner(user.username, loadFields(user.id), profileUrl(req, user.username)));
        }

        if (method === "POST" && path === "/me/fields") {
          const params = new URLSearchParams(await readBody(req));
          const title = (params.get("title") ?? "").trim().slice(0, 80);
          const content = (params.get("content") ?? "").trim().slice(0, 2000);
          if (title && content) {
            addField(user.id, title, content);
            notifyFieldsChanged(user.id);
            audit("field_added", { userId: user.id, username: user.username, title });
          }
          return redirect(res, "/me");
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
      }

      if (method === "GET" && path === "/search") {
        const user = currentUser(req);
        if (!user) {
          audit("unauthorized", { path, method });
          return redirect(res, "/");
        }
        const title = (url.searchParams.get("title") ?? "").trim();
        const query = (url.searchParams.get("q") ?? "").trim();
        // Decision 6: scoped to a field you already hold — checked here,
        // server-side, not just hidden in the UI.
        const owns = title !== "" && loadFields(user.id).some((f) => f.title === title);
        if (!owns) {
          res.writeHead(403, { "Content-Type": "text/plain" });
          return res.end("you don't have that field");
        }
        const results = query === "" ? [] : searchField(title, query, user.id);
        audit("field_search", { userId: user.id, username: user.username, title, resultCount: String(results.length) });
        return html(res, 200, renderSearch(title, query, results));
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
        return html(res, 200, renderMutualProfile(owner.username, mutualFields(owner.id, viewer.id)));
      }

      if (method === "GET" && path === "/readme/") {
        const bodyHtml = await marked.parse(readFileSync("README.md", "utf8"));
        return html(res, 200, renderReadme(bodyHtml));
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
