// The whole app for crit 8: one profile, one form to add a field, one page
// publishing README.md at /readme/. No accounts, no matching, no real-time —
// those are weeks 9 and 10 (see PROCESS.md). Plain node:http rather than a
// framework: there's exactly three routes, and a dependency should earn its
// place.
import { createServer } from "node:http";
import type { IncomingMessage } from "node:http";
import { readFileSync } from "node:fs";
import { marked } from "marked";
import { addField, loadFields } from "./data.ts";
import { renderIndex, renderReadme } from "./page.ts";

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

const server = createServer((req, res) => {
  void (async () => {
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

      if (req.method === "GET" && url.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(renderIndex(loadFields()));
        return;
      }

      if (req.method === "POST" && url.pathname === "/fields") {
        const body = await readBody(req);
        const params = new URLSearchParams(body);
        const title = (params.get("title") ?? "").trim();
        const content = (params.get("content") ?? "").trim();
        if (title && content) addField(title, content);
        res.writeHead(303, { Location: "/" });
        res.end();
        return;
      }

      if (req.method === "GET" && url.pathname === "/readme/") {
        const markdown = readFileSync("README.md", "utf8");
        const bodyHtml = await marked.parse(markdown);
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(renderReadme(bodyHtml));
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("not found");
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("internal error");
    }
  })();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on 0.0.0.0:${PORT}`);
});
