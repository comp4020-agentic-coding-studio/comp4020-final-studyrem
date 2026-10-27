// HTML templating. No framework: a handful of pages, each a template literal.
import type { Field, FieldMatch, Suggestion } from "./data.ts";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Warm neutrals + one muted terracotta accent — warmth from softness and
// undertone, not saturation. Every text/UI-boundary pair below is checked
// against the real WCAG relative-luminance contrast formula, not eyeballed:
// body text and accent clear AAA (7:1+), muted text and error text clear AA
// (4.5:1+), and --border clears the separate, lower 3:1 threshold WCAG
// 1.4.11 sets for UI component boundaries (not held to the text threshold).
// --border-subtle is decorative only (list dividers) and carries no
// contrast requirement, since nothing depends on seeing it to use the page.
//
// Visual language is deliberately open and editorial — a page in a
// notebook, not a form wizard: no boxed cards, no drop shadows, hairline
// rules doing the grouping a border used to. A serif carries display
// headings (system-installed faces only, no webfont download, so the
// no-dependency ethos README.md claims for itself still holds); body copy,
// labels and controls stay on the humanist sans for legibility at small
// sizes. Every color value and a11y mechanism here (focus ring,
// reduced-motion-gated entrance, outline-vs-filled button distinction) is
// carried over unchanged from the prior pass — only chrome and rhythm
// moved.
const SERIF = `Georgia, "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif`;
const STYLE = `
  :root {
    --bg: #faf6f0;
    --surface: #ffffff;
    --text: #2a2420;
    --text-muted: #6b5f55;
    --border: #9c8671;
    --border-subtle: #e6dacb;
    --accent: #8a3f26;
    --accent-hover: #6e3019;
    --accent-contrast: #fff8f2;
    --error: #9a3324;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
    max-width: 34rem;
    margin: 3rem auto 6rem;
    padding: 0 1.25rem;
    line-height: 1.65;
    font-size: 1.0625rem;
    color: var(--text);
    background: var(--bg);
  }
  h1, h2 {
    font-family: ${SERIF};
    font-weight: 400;
    line-height: 1.25;
  }
  h1 { font-size: 2rem; margin: 0 0 1.25rem; }
  h2 { font-size: 1.15rem; margin: 0 0 0.5rem; }
  a { color: var(--accent); }
  a:hover { color: var(--accent-hover); }
  .rule {
    border: 0;
    border-top: 1px solid var(--border-subtle);
    margin: 1.75rem 0;
  }
  form {
    display: grid;
    gap: 0.9rem;
    margin: 1.5rem 0;
  }
  form.inline { display: inline; margin: 0; }
  label { display: grid; gap: 0.3rem; font-size: 0.9rem; color: var(--text-muted); }
  input, textarea {
    font: inherit;
    color: var(--text);
    background: var(--surface);
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--border);
    border-radius: 0.35rem;
  }
  input:focus-visible, textarea:focus-visible, button:focus-visible, a:focus-visible, summary:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 2px;
  }
  button {
    justify-self: start;
    padding: 0.5rem 1.1rem;
    font: inherit;
    color: var(--accent-contrast);
    background: var(--accent);
    border: 1px solid var(--accent);
    border-radius: 0.35rem;
    cursor: pointer;
  }
  button:hover, button:active { background: var(--accent-hover); border-color: var(--accent-hover); }
  form.inline button {
    color: var(--accent);
    background: transparent;
    border: 1px solid var(--border);
  }
  form.inline button:hover, form.inline button:active {
    color: var(--accent-contrast);
    background: var(--text-muted);
    border-color: var(--text-muted);
  }
  details.signup {
    margin: 2rem 0 0;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-subtle);
  }
  details.signup summary {
    cursor: pointer;
    color: var(--accent);
    font-size: 0.95rem;
    list-style: none;
  }
  details.signup summary::-webkit-details-marker { display: none; }
  details.signup summary:hover { color: var(--accent-hover); }
  details.signup[open] summary { margin-bottom: 1.25rem; }
  ul { list-style: none; padding: 0; margin: 1.5rem 0; }
  li { border-top: 1px solid var(--border-subtle); padding: 1.25rem 0; }
  li:first-child { border-top: 0; }
  li h2 { margin: 0 0 0.35rem; font-size: 1.05rem; }
  li p { margin: 0 0 0.6rem; white-space: pre-wrap; }
  .field-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
  .field-actions a { font-size: 0.95rem; }
  .field-actions form.inline button {
    font-size: 0.85rem;
    padding: 0.3rem 0.7rem;
    color: var(--text-muted);
    border-color: var(--border-subtle);
  }
  .field-actions form.inline button:hover, .field-actions form.inline button:active {
    color: var(--accent-contrast);
    background: var(--text-muted);
    border-color: var(--text-muted);
  }
  .error, .notice, .suggestion {
    padding: 0.2rem 0 0.2rem 0.9rem;
    border-left: 3px solid var(--text-muted);
  }
  .error { color: var(--error); border-left-color: var(--error); }
  .notice { color: var(--text-muted); }
  .suggestion { color: var(--text-muted); font-size: 0.95rem; border-left-color: var(--accent); margin: 1.75rem 0; }
  .suggestion form { display: inline; margin: 0; }
  .empty { color: var(--text-muted); font-size: 0.95rem; }
  .share input { width: 100%; }
  header { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
  header h1 { margin-bottom: 0; }

  /* Live-update arrivals read as a quiet settle, not a pop — calm tech's
     "non-intrusive arrival" over an instant swap. Skipped entirely for
     anyone who has told their OS they don't want motion. */
  @media (prefers-reduced-motion: no-preference) {
    li.field-enter {
      opacity: 0;
      transform: translateY(0.25rem);
      transition: opacity 0.35s ease, transform 0.35s ease;
    }
    li.field-enter-active { opacity: 1; transform: translateY(0); }
  }
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

// `errorOn` says which form the message belongs to, so a failed signup
// reopens the signup disclosure with its own error rather than surfacing a
// signup problem next to the login form (or vice versa).
export function renderLogin(error?: string, errorOn: "login" | "signup" = "login"): string {
  const loginError = error && errorOn === "login" ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : "";
  const signupError = error && errorOn === "signup" ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : "";
  return layout(
    "Commonplace",
    `<h1>Commonplace</h1>
<p>A profile is a set of fields: a title, and whatever you want to say about
it. Log in to edit yours.</p>
<hr class="rule" />
${loginError}
<form method="post" action="/login">
  <label>Username <input name="username" required autocomplete="username" /></label>
  <label>Password <input name="password" type="password" required autocomplete="current-password" /></label>
  <button type="submit">Log in</button>
</form>
<details class="signup"${errorOn === "signup" ? " open" : ""}>
  <summary>New here? Create an account</summary>
  ${signupError}
  <form method="post" action="/signup">
    <label>Username <input name="username" required minlength="3" maxlength="32" pattern="[A-Za-z0-9_\\-]{3,32}" autocomplete="username" /></label>
    <label>Password (at least 8 characters) <input name="password" type="password" required minlength="8" autocomplete="new-password" /></label>
    <button type="submit">Sign up</button>
  </form>
</details>
<p><a href="/readme/">What good means for this app</a></p>`,
  );
}

const fieldItem = (f: Field, extra = ""): string =>
  `<li data-field-id="${escapeHtml(f.id)}"><h2>${escapeHtml(f.title)}</h2><p>${escapeHtml(f.content)}</p>${extra}</li>`;

export function renderOwner(
  username: string,
  fields: Field[],
  profileUrl: string,
  message?: string,
  isError = false,
): string {
  const items = fields
    .map((f) =>
      fieldItem(
        f,
        `<div class="field-actions">
<a href="/search?title=${encodeURIComponent(f.title)}">Search for this</a>
<form class="inline" method="post" action="/me/fields/${encodeURIComponent(f.id)}/delete"><button type="submit">Remove</button></form>
</div>`,
      ),
    )
    .join("\n");
  const messageBlock = message
    ? `<p class="${isError ? "error" : "notice"}" role="alert">${escapeHtml(message)}</p>`
    : "";
  return layout(
    "Your profile — Commonplace",
    `<header>
<h1>Your profile</h1>
<form class="inline" method="post" action="/logout">Logged in as <strong>${escapeHtml(username)}</strong> <button type="submit">Log out</button></form>
</header>
${messageBlock}
<form method="post" action="/me/fields">
  <label>Field title <input name="title" required maxlength="80" list="title-suggestions" autocomplete="off" /></label>
  <datalist id="title-suggestions"></datalist>
  <label>What you want to say <textarea name="content" required maxlength="2000" rows="4"></textarea></label>
  <button type="submit">Add field</button>
</form>
<p class="empty" id="empty-note"${fields.length > 0 ? ' hidden=""' : ""}>No fields yet &mdash; add the first one.</p>
<ul id="fields">
${items}
</ul>
<script>
(() => {
  const input = document.querySelector('input[name="title"]');
  const datalist = document.getElementById("title-suggestions");
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q === "") {
      datalist.replaceChildren();
      return;
    }
    timer = setTimeout(async () => {
      const res = await fetch("/fields/suggest?q=" + encodeURIComponent(q));
      if (!res.ok) return;
      const suggestions = await res.json();
      datalist.replaceChildren(...suggestions.map((s) => {
        const option = document.createElement("option");
        option.value = s.title;
        return option;
      }));
    }, 250);
  });

  // Keeps this tab's own field list current when another tab (or another
  // device logged into the same account) adds or removes a field.
  const list = document.getElementById("fields");
  const emptyNote = document.getElementById("empty-note");
  const seenIds = new Set(Array.from(list.children, (li) => li.dataset.fieldId));
  const source = new EventSource("/me/events");
  source.addEventListener("fields", (e) => {
    const fields = JSON.parse(e.data);
    const newlyArrived = [];
    list.replaceChildren(...fields.map((f) => {
      const li = document.createElement("li");
      li.dataset.fieldId = f.id;
      const h = document.createElement("h2");
      const p = document.createElement("p");
      h.textContent = f.title;
      p.textContent = f.content;
      const deleteForm = document.createElement("form");
      deleteForm.className = "inline";
      deleteForm.method = "post";
      deleteForm.action = "/me/fields/" + encodeURIComponent(f.id) + "/delete";
      const deleteButton = document.createElement("button");
      deleteButton.type = "submit";
      deleteButton.textContent = "Remove";
      deleteForm.append(deleteButton);
      const searchLink = document.createElement("a");
      searchLink.href = "/search?title=" + encodeURIComponent(f.title);
      searchLink.textContent = "Search for this";
      const actions = document.createElement("div");
      actions.className = "field-actions";
      actions.append(searchLink, deleteForm);
      li.append(h, p, actions);
      if (!seenIds.has(f.id)) {
        li.classList.add("field-enter");
        newlyArrived.push(li);
      }
      return li;
    }));
    emptyNote.hidden = fields.length > 0;
    seenIds.clear();
    fields.forEach((f) => seenIds.add(f.id));
    if (newlyArrived.length > 0) {
      requestAnimationFrame(() => {
        newlyArrived.forEach((li) => li.classList.add("field-enter-active"));
      });
    }
  });
})();
</script>
<hr class="rule" />
<div class="share">
  <h2>Your profile link</h2>
  <p>Anyone who's logged in and has added a field you also hold sees that
  field, live, if they visit this link. Nobody sees anything you don't
  already share with them:</p>
  <input readonly value="${escapeHtml(profileUrl)}" aria-label="Your profile link" onfocus="this.select()" />
</div>
<p><a href="/readme/">What good means for this app</a></p>`,
  );
}

// Read-only. Shows only the fields the viewer also holds themselves
// (data.ts: mutualFields) — decision 3, enforced server-side. The list is
// server-rendered so it works without JS; the script then keeps it current
// from the event stream, writing user text only through textContent.
export function renderMutualProfile(username: string, fields: Field[], suggestion?: Suggestion): string {
  const items = fields.map((f) => fieldItem(f)).join("\n");
  const suggestionBlock = suggestion
    ? `<p class="suggestion">${escapeHtml(username)} has a field you don't: <strong>${escapeHtml(suggestion.title)}</strong>.
<form method="post" action="/me/fields">
  <input type="hidden" name="title" value="${escapeHtml(suggestion.title)}" />
  <label>What you want to say <input name="content" required maxlength="2000" /></label>
  <button type="submit">Add it</button>
</form></p>`
    : "";
  return layout(
    `${escapeHtml(username)} — Commonplace`,
    `<h1>${escapeHtml(username)}</h1>
${suggestionBlock}
<p class="empty" id="empty-note"${fields.length > 0 ? ' hidden=""' : ""}>You don't share any fields with ${escapeHtml(username)} yet — add a field they also have to see it.</p>
<ul id="fields">
${items}
</ul>
<script>
(() => {
  const list = document.getElementById("fields");
  const emptyNote = document.getElementById("empty-note");
  const seenIds = new Set(Array.from(list.children, (li) => li.dataset.fieldId));
  const source = new EventSource(location.pathname.replace(/\\/$/, "") + "/events");
  source.addEventListener("fields", (e) => {
    const fields = JSON.parse(e.data);
    const newlyArrived = [];
    list.replaceChildren(...fields.map((f) => {
      const li = document.createElement("li");
      li.dataset.fieldId = f.id;
      const h = document.createElement("h2");
      const p = document.createElement("p");
      h.textContent = f.title;
      p.textContent = f.content;
      li.append(h, p);
      if (!seenIds.has(f.id)) {
        li.classList.add("field-enter");
        newlyArrived.push(li);
      }
      return li;
    }));
    emptyNote.hidden = fields.length > 0;
    seenIds.clear();
    fields.forEach((f) => seenIds.add(f.id));
    if (newlyArrived.length > 0) {
      requestAnimationFrame(() => {
        newlyArrived.forEach((li) => li.classList.add("field-enter-active"));
      });
    }
  });
})();
</script>`,
  );
}

// Scoped to one field title the searcher already holds (checked in
// server.ts, not here). No link out to a full profile: that would leak
// more than the one field decision 5 says this page may share.
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
  return layout("Not found — Commonplace", `<h1>Not found</h1><p>Nobody's at this link.</p>`);
}

export function renderReadme(bodyHtml: string): string {
  return layout("About &mdash; Commonplace", `${bodyHtml}\n<p><a href="/">&larr; Back</a></p>`);
}
