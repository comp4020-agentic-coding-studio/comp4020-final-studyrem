// HTML templating. No framework: a handful of pages, each a template literal.
import type { Field, FieldMatch } from "./data.ts";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const STYLE = `
  body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #1a1a1a; }
  form { display: grid; gap: 0.5rem; margin: 1.5rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 0.5rem; }
  form.inline { display: inline; margin: 0; padding: 0; border: 0; }
  label { display: grid; gap: 0.25rem; font-size: 0.9rem; }
  input, textarea { font: inherit; padding: 0.4rem; border: 1px solid #bbb; border-radius: 0.25rem; }
  button { justify-self: start; padding: 0.4rem 1rem; }
  ul { list-style: none; padding: 0; }
  li { border-top: 1px solid #ddd; padding: 0.75rem 0; }
  li h2 { margin: 0 0 0.25rem; font-size: 1rem; }
  li p { margin: 0 0 0.25rem; white-space: pre-wrap; }
  .error { color: #a00; }
  .share input { width: 100%; box-sizing: border-box; }
  header { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap; }
`;

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>${STYLE}</style>
</head>
<body>
<main>
${body}
</main>
</body>
</html>
`;
}

export function renderLogin(error?: string): string {
  return layout(
    "Commonplace",
    `<h1>Commonplace</h1>
<p>A profile is a set of fields: a title, and whatever you want to say about
it. Log in to edit yours.</p>
${error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : ""}
<form method="post" action="/login">
  <h2>Log in</h2>
  <label>Username <input name="username" required autocomplete="username" /></label>
  <label>Password <input name="password" type="password" required autocomplete="current-password" /></label>
  <button type="submit">Log in</button>
</form>
<form method="post" action="/signup">
  <h2>Create an account</h2>
  <label>Username <input name="username" required minlength="3" maxlength="32" pattern="[A-Za-z0-9_\\-]{3,32}" autocomplete="username" /></label>
  <label>Password (at least 8 characters) <input name="password" type="password" required minlength="8" autocomplete="new-password" /></label>
  <button type="submit">Sign up</button>
</form>
<p><a href="/readme/">What good means for this app</a></p>`,
  );
}

const fieldItem = (f: Field, extra = ""): string =>
  `<li><h2>${escapeHtml(f.title)}</h2><p>${escapeHtml(f.content)}</p>${extra}</li>`;

export function renderOwner(username: string, fields: Field[], shareUrl: string | null): string {
  const items = fields
    .map((f) =>
      fieldItem(
        f,
        `<form class="inline" method="post" action="/me/fields/${encodeURIComponent(f.id)}/delete"><button type="submit">Remove</button></form>
<a href="/search?title=${encodeURIComponent(f.title)}">Search for this</a>`,
      ),
    )
    .join("\n");
  const share = shareUrl
    ? `<p>Anyone with this link can see your whole profile, read-only, and watch it change live:</p>
  <input readonly value="${escapeHtml(shareUrl)}" aria-label="Your share link" onfocus="this.select()" />
  <button type="submit">Regenerate link (the old one stops working)</button>`
    : `<p>You have no share link yet. Nobody can see your profile until you make one.</p>
  <button type="submit">Make a share link</button>`;
  return layout(
    "Your profile — Commonplace",
    `<header>
<h1>Your profile</h1>
<form class="inline" method="post" action="/logout">Logged in as <strong>${escapeHtml(username)}</strong> <button type="submit">Log out</button></form>
</header>
<form method="post" action="/me/fields">
  <label>Field title <input name="title" required maxlength="80" /></label>
  <label>What you want to say <textarea name="content" required maxlength="2000" rows="4"></textarea></label>
  <button type="submit">Add field</button>
</form>
<ul>
${items || "<li>No fields yet &mdash; add the first one.</li>"}
</ul>
<form class="share" method="post" action="/me/share">
  <h2>Share link</h2>
  ${share}
</form>
<p><a href="/readme/">What good means for this app</a></p>`,
  );
}

// Read-only. The list is server-rendered so it works without JS; the script
// then keeps it current from the event stream, writing user text only through
// textContent.
export function renderShared(username: string, fields: Field[]): string {
  const items = fields.map((f) => fieldItem(f)).join("\n");
  return layout(
    `${escapeHtml(username)} — Commonplace`,
    `<h1>${escapeHtml(username)}</h1>
<ul id="fields">
${items || '<li class="empty">Nothing here yet.</li>'}
</ul>
<script>
(() => {
  const list = document.getElementById("fields");
  const source = new EventSource(location.pathname.replace(/\\/$/, "") + "/events");
  source.addEventListener("fields", (e) => {
    const fields = JSON.parse(e.data);
    list.replaceChildren(...fields.map((f) => {
      const li = document.createElement("li");
      const h = document.createElement("h2");
      const p = document.createElement("p");
      h.textContent = f.title;
      p.textContent = f.content;
      li.append(h, p);
      return li;
    }));
    if (fields.length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Nothing here yet.";
      list.append(li);
    }
  });
  source.addEventListener("revoked", () => {
    source.close();
    const main = document.querySelector("main");
    const p = document.createElement("p");
    p.textContent = "This link is no longer active.";
    main.replaceChildren(p);
  });
})();
</script>`,
  );
}

// Scoped to one field title the searcher already holds (checked in
// server.ts, not here). No link out to a full profile: that would leak
// more than the one field decision 6 says this page may share.
export function renderSearch(title: string, query: string, results: FieldMatch[]): string {
  const items = results
    .map((r) => `<li><h2>${escapeHtml(r.username)}</h2><p>${escapeHtml(r.content)}</p></li>`)
    .join("\n");
  const resultsBlock =
    query.trim() === ""
      ? ""
      : `<ul>
${items || "<li>Nobody else has this field yet.</li>"}
</ul>`;
  return layout(
    `Search "${escapeHtml(title)}" — Commonplace`,
    `<h1>Search within <q>${escapeHtml(title)}</q></h1>
<p>Only people who also hold this field, and only what they wrote under it.</p>
<form method="get" action="/search">
  <input type="hidden" name="title" value="${escapeHtml(title)}" />
  <label>Search text <input name="q" value="${escapeHtml(query)}" autofocus /></label>
  <button type="submit">Search</button>
</form>
${resultsBlock}
<p><a href="/me">&larr; Back to your profile</a></p>`,
  );
}

export function renderNotFound(): string {
  return layout("Not found — Commonplace", `<h1>Not found</h1><p>This link isn't active.</p>`);
}

export function renderReadme(bodyHtml: string): string {
  return layout("About &mdash; Commonplace", `${bodyHtml}\n<p><a href="/">&larr; Back</a></p>`);
}
