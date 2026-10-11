// Accounts, each editing their own profile, plus a read-only share link that
// updates live. Plain node:http rather than a framework: the routes fit in one
// file, and a dependency should earn its place.
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { marked } from "marked";
import {
  addField,
  createUser,
  findUserById,
  findUserByShareToken,
  findUserByUsername,
  loadFields,
  removeField,
  rotateShareToken,
  verifyPassword,
} from "./data.ts";
import type { User } from "./data.ts";
import { publish, revoke, subscribe } from "./live.ts";
import { renderLogin, renderNotFound, renderOwner, renderReadme, renderShared } from "./page.ts";
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

function shareUrl(req: IncomingMessage, token: string): string {
  const proto = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  return `${proto}://${req.headers.host ?? "localhost"}/s/${token}`;
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
            return redirect(res, "/me", sessionCookie(req, user.id));
          } catch (err) {
            return html(res, 400, renderLogin((err as Error).message));
          }
        }
        const user = findUserByUsername(username);
        if (!user || !verifyPassword(user, password)) {
          return html(res, 401, renderLogin("That username and password don't match."));
        }
        return redirect(res, "/me", sessionCookie(req, user.id));
      }

      if (method === "POST" && path === "/logout") {
        return redirect(res, "/", clearedCookie(req));
      }

      if (path === "/me" || path.startsWith("/me/")) {
        const user = currentUser(req);
        if (!user) {
          if (method === "GET") return redirect(res, "/");
          res.writeHead(401, { "Content-Type": "text/plain" });
          return res.end("log in first");
        }

        if (method === "GET" && path === "/me") {
          const link = user.shareToken ? shareUrl(req, user.shareToken) : null;
          return html(res, 200, renderOwner(user.username, loadFields(user.id), link));
        }

        if (method === "POST" && path === "/me/fields") {
          const params = new URLSearchParams(await readBody(req));
          const title = (params.get("title") ?? "").trim().slice(0, 80);
          const content = (params.get("content") ?? "").trim().slice(0, 2000);
          if (title && content) publish(user.id, addField(user.id, title, content));
          return redirect(res, "/me");
        }

        const del = method === "POST" && path.match(/^\/me\/fields\/([^/]+)\/delete$/);
        if (del) {
          publish(user.id, removeField(user.id, decodeURIComponent(del[1])));
          return redirect(res, "/me");
        }

        if (method === "POST" && path === "/me/share") {
          revoke(user.id);
          rotateShareToken(user.id);
          return redirect(res, "/me");
        }
      }

      const share = method === "GET" && path.match(/^\/s\/([A-Za-z0-9_-]+)(\/events)?\/?$/);
      if (share) {
        const owner = findUserByShareToken(share[1]);
        if (!owner) return html(res, 404, renderNotFound());
        if (share[2]) return subscribe(owner.id, res, loadFields(owner.id));
        return html(res, 200, renderShared(owner.username, loadFields(owner.id)));
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
