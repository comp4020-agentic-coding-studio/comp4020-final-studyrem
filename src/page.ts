// HTML templating. No framework: a handful of pages, each a template literal.
import type { Field, SearchResult, Suggestion } from "./data.ts";

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
  /* An author "display" rule otherwise beats the UA [hidden] rule, so a
     <form> hidden via JS (the add-field-fallback form once the dialog
     takes over) would stay visible without this. */
  [hidden] { display: none !important; }
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
  details.edit-field {
    margin-top: 0.6rem;
  }
  details.edit-field summary {
    cursor: pointer;
    color: var(--text-muted);
    font-size: 0.85rem;
    list-style: none;
  }
  details.edit-field summary::-webkit-details-marker { display: none; }
  details.edit-field summary:hover { color: var(--accent); }
  details.edit-field form { margin: 0.75rem 0 0; }
  ul { list-style: none; padding: 0; margin: 1.5rem 0; }
  li { border-top: 1px solid var(--border-subtle); padding: 1.25rem 0; }
  li:first-child { border-top: 0; }
  li h2 { margin: 0 0 0.35rem; font-size: 1.05rem; }
  li p { margin: 0 0 0.6rem; white-space: pre-wrap; }
  li > a { display: block; color: inherit; text-decoration: none; }
  li > a:hover h2, li > a:focus-visible h2 { color: var(--accent); }
  li > a p { color: var(--text-muted); }
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
  .search-options {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin: 0 0 1.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--border-subtle);
  }
  .checkbox-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-muted);
  }
  .checkbox-field input { width: auto; }
  .search-row {
    display: flex;
    align-items: end;
    gap: 0.9rem;
    flex-wrap: wrap;
    margin: 0 0 0.9rem;
  }
  .search-row label { flex: 1; }
  .search-row .remove-row {
    color: var(--text-muted);
    background: transparent;
    border: 1px solid var(--border-subtle);
    font-size: 0.85rem;
    padding: 0.5rem 0.7rem;
  }
  .search-row .remove-row:hover, .search-row .remove-row:active {
    color: var(--accent-contrast);
    background: var(--text-muted);
    border-color: var(--text-muted);
  }
  .add-field {
    display: flex;
    align-items: end;
    gap: 0.9rem;
    flex-wrap: wrap;
    margin: 1.25rem 0;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border-subtle);
  }
  .add-field label { flex: 1; }
  .add-field select {
    font: inherit;
    color: var(--text);
    background: var(--surface);
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--border);
    border-radius: 0.35rem;
    width: 100%;
  }
  #add-field-trigger {
    margin: 1.25rem 0;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border-subtle);
    background: none;
    border-left: none;
    border-right: none;
    border-bottom: none;
    color: var(--accent);
    cursor: pointer;
  }
  #add-field-trigger:hover { color: var(--accent-hover); }
  dialog#add-field-dialog {
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 1.5rem;
    background: var(--surface);
    color: var(--text);
    max-width: 24rem;
    width: calc(100% - 2.5rem);
  }
  dialog#add-field-dialog::backdrop { background: rgba(42, 36, 32, 0.4); }
  dialog#add-field-dialog h2 { margin-top: 0; }
  #add-field-cancel {
    background: none;
    border: 1px solid var(--border-subtle);
    color: var(--text-muted);
  }
  header { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
  header h1 { margin-bottom: 0; }
  nav.site {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-subtle);
    font-size: 0.95rem;
  }
  nav.site .brand {
    font-family: ${SERIF};
    font-size: 1.1rem;
    color: var(--text);
    text-decoration: none;
  }
  nav.site .links { display: flex; align-items: baseline; gap: 1.1rem; flex-wrap: wrap; }
  nav.site form.inline button {
    font: inherit;
    font-size: 0.95rem;
    color: var(--accent);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  nav.site form.inline button:hover { color: var(--accent-hover); }

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

// Shared across every logged-in page (/me, /search, /u/<username>) so a
// reader can always get back to their own profile or log out, regardless
// of how they arrived — a search result, a shared link, or /me itself.
function siteNav(username: string): string {
  return `<nav class="site">
<a class="brand" href="/me">Commonplace</a>
<div class="links">
<a href="/me">Your profile</a>
<a href="/search">Search</a>
<a href="/readme/">What good means for this app</a>
<form class="inline" method="post" action="/logout">Logged in as <strong>${escapeHtml(username)}</strong> <button type="submit">Log out</button></form>
</div>
</nav>`;
}

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
<form class="inline" method="post" action="/me/fields/${encodeURIComponent(f.id)}/delete"><button type="submit">Remove</button></form>
</div>
<details class="edit-field">
  <summary>Edit</summary>
  <form method="post" action="/me/fields/${encodeURIComponent(f.id)}/edit">
    <label>Field title <input name="title" value="${escapeHtml(f.title)}" required maxlength="80" list="title-suggestions" autocomplete="off" /></label>
    <label>What you want to say <textarea name="content" required maxlength="2000" rows="4">${escapeHtml(f.content)}</textarea></label>
    <button type="submit">Save</button>
  </form>
</details>`,
      ),
    )
    .join("\n");
  const messageBlock = message
    ? `<p class="${isError ? "error" : "notice"}" role="alert">${escapeHtml(message)}</p>`
    : "";
  return layout(
    "Your profile — Commonplace",
    `${siteNav(username)}
<h1>Your profile</h1>
${messageBlock}
<form method="post" action="/me/fields" id="add-field-fallback">
  <label>Field title <input name="title" required maxlength="80" list="title-suggestions" autocomplete="off" /></label>
  <datalist id="title-suggestions"></datalist>
  <label>What you want to say <textarea name="content" required maxlength="2000" rows="4"></textarea></label>
  <button type="submit">Add field</button>
</form>
<button type="button" id="add-field-trigger" hidden>+ Add a field</button>
<dialog id="add-field-dialog">
  <h2>Add a field</h2>
  <form method="post" action="/me/fields">
    <label>Field title <input name="title" required maxlength="80" list="title-suggestions" autocomplete="off" /></label>
    <label>What you want to say <textarea name="content" required maxlength="2000" rows="4"></textarea></label>
    <button type="submit">Add field</button>
  </form>
  <button type="button" id="add-field-cancel">Cancel</button>
</dialog>
<p class="empty" id="empty-note"${fields.length > 0 ? ' hidden=""' : ""}>No fields yet &mdash; add the first one.</p>
<ul id="fields">
${items}
</ul>
<script>
(() => {
  // Both the always-present form and the dialog's copy share the same
  // #title-suggestions datalist, so either input's typing keeps it current.
  const titleInputs = document.querySelectorAll('input[name="title"]');
  const datalist = document.getElementById("title-suggestions");
  let timer;
  titleInputs.forEach((input) => {
    input.setAttribute("list", "title-suggestions");
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
  });

  // Decision 36 (moved here from /search): a native <dialog> needs JS to
  // open at all, so the always-present form above is the no-JS path. With
  // JS on, hide it and show a "+ Add a field" trigger that opens the dialog
  // instead — same POST /me/fields either way, just two copies of the form.
  (() => {
    const fallback = document.getElementById("add-field-fallback");
    const trigger = document.getElementById("add-field-trigger");
    const dialog = document.getElementById("add-field-dialog");
    const cancel = document.getElementById("add-field-cancel");
    if (!fallback || !trigger || !dialog || !cancel) return;
    fallback.hidden = true;
    trigger.hidden = false;
    trigger.addEventListener("click", () => dialog.showModal());
    cancel.addEventListener("click", () => dialog.close());
  })();

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
      const actions = document.createElement("div");
      actions.className = "field-actions";
      actions.append(deleteForm);
      // A live-pushed field (another tab's edit/add/remove) keeps whatever
      // open/closed state its own <details> already had, since this whole
      // <li> is only rebuilt from scratch when its id wasn't already on the
      // page — see newlyArrived/seenIds below.
      const editDetails = document.createElement("details");
      editDetails.className = "edit-field";
      const editSummary = document.createElement("summary");
      editSummary.textContent = "Edit";
      const editForm = document.createElement("form");
      editForm.method = "post";
      editForm.action = "/me/fields/" + encodeURIComponent(f.id) + "/edit";
      const titleLabel = document.createElement("label");
      titleLabel.textContent = "Field title ";
      const titleInput = document.createElement("input");
      titleInput.name = "title";
      titleInput.value = f.title;
      titleInput.required = true;
      titleInput.maxLength = 80;
      titleInput.setAttribute("list", "title-suggestions");
      titleInput.autocomplete = "off";
      titleLabel.append(titleInput);
      const contentLabel = document.createElement("label");
      contentLabel.textContent = "What you want to say ";
      const contentInput = document.createElement("textarea");
      contentInput.name = "content";
      contentInput.value = f.content;
      contentInput.required = true;
      contentInput.maxLength = 2000;
      contentInput.rows = 4;
      contentLabel.append(contentInput);
      const saveButton = document.createElement("button");
      saveButton.type = "submit";
      saveButton.textContent = "Save";
      editForm.append(titleLabel, contentLabel, saveButton);
      editDetails.append(editSummary, editForm);
      li.append(h, p, actions, editDetails);
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
</div>`,
  );
}

// Read-only. Shows only the fields the viewer also holds themselves
// (data.ts: mutualFields) — decision 3, enforced server-side. The list is
// server-rendered so it works without JS; the script then keeps it current
// from the event stream, writing user text only through textContent.
export function renderMutualProfile(
  viewerUsername: string,
  username: string,
  fields: Field[],
  suggestion?: Suggestion,
): string {
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
    `${siteNav(viewerUsername)}
<h1>${escapeHtml(username)}</h1>
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

export interface SearchRow {
  title: string;
  query: string;
}

const resultItem = (r: SearchResult): string =>
  `<li><a href="/u/${encodeURIComponent(r.username)}"><h2>${escapeHtml(r.username)}</h2>${r.matches
    .map((m) => `<p><strong>${escapeHtml(m.title)}:</strong> ${escapeHtml(m.content)}</p>`)
    .join("\n")}</a></li>`;

// Decision 34: fields are added to the search one at a time rather than
// every held field being pre-listed — `rows` is only the ones currently
// added, in that order; `availableTitles` is everything else still pickable
// from the dropdown. Decision 33's criteria/matching, decision 5's scoping
// (checked in server.ts against the searcher's own fields, not here), and
// decision 31's links to /u/<username> are all unchanged — this only
// reshapes how the row set gets built.
export function renderSearch(
  username: string,
  rows: SearchRow[],
  availableTitles: string[],
  allowPartial: boolean,
  hasSearched: boolean,
  criteriaCount: number,
  results: SearchResult[],
): string {
  const fieldRows = rows
    .map(
      (r, i) => `<div class="search-row" id="row-${i}">
  <label>${escapeHtml(r.title)}
    <input type="hidden" name="field" value="${escapeHtml(r.title)}" />
    <input id="q-${i}" name="q" value="${escapeHtml(r.query)}" />
  </label>
  <button type="submit" formaction="/search?remove=${i}" formnovalidate class="remove-row">Remove</button>
</div>`,
    )
    .join("\n");

  const addRow =
    availableTitles.length > 0
      ? `<div class="add-field">
  <label>Add a field to search
    <select name="add_field">
${availableTitles.map((t) => `      <option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("\n")}
    </select>
  </label>
  <button type="submit" formaction="/search?add=1" formnovalidate>Add</button>
</div>`
      : "";

  const optionsBlock =
    rows.length > 0
      ? `<div class="search-options">
    <label class="checkbox-field"><input type="checkbox" name="partial" value="on"${allowPartial ? " checked" : ""} /> Allow partial matches</label>
  </div>`
      : "";

  const emptyNotice =
    rows.length === 0 && availableTitles.length === 0
      ? "<p>Add a field on your profile first — search works within fields you already hold.</p>"
      : rows.length === 0
        ? "<p>Add a field below to start searching.</p>"
        : "";

  const form = `<form method="get" action="/search">
  <input type="hidden" name="searched" value="1" />
  ${optionsBlock}
${fieldRows}
${emptyNotice}
${addRow}
  <button type="submit">Search</button>
</form>`;

  let resultsInner = "";
  if (hasSearched && criteriaCount > 0) {
    const all = results.filter((r) => r.matches.length === criteriaCount);
    const some = allowPartial ? results.filter((r) => r.matches.length < criteriaCount) : [];
    const allBlock = `<h2>Matches all ${criteriaCount}</h2><ul>
${all.map(resultItem).join("\n") || "<li>Nobody matches every field yet.</li>"}
</ul>`;
    const someBlock = allowPartial
      ? `<h2>Matches some</h2><ul>
${some.map(resultItem).join("\n") || "<li>Nobody else matches.</li>"}
</ul>`
      : "";
    resultsInner = `${allBlock}\n${someBlock}`;
  }
  const resultsBlock = `<div id="search-results">${resultsInner}</div>`;
  return layout(
    "Search — Commonplace",
    `${siteNav(username)}
<h1>Search</h1>
<p>Only people who also hold the field you're searching in, and only what
they wrote under it.</p>
${form}
${resultsBlock}
<script>
(() => {
  // Decision 34: Add/Remove already work as plain form submits (each
  // button's formaction reloads the page with the row added/removed) — this
  // only intercepts the click to do the same thing without a reload, when
  // JS is available. Falls through to the real submit if anything's missing.
  // The form/results nodes are swapped out on every Add/Remove, so this
  // always re-queries the live ones rather than closing over stale references.
  async function swapIn(url) {
    const res = await fetch(url, { headers: { "X-Requested-With": "fetch" } });
    if (!res.ok) return false;
    const html = await res.text();
    const next = new DOMParser().parseFromString(html, "text/html");
    const nextForm = next.querySelector("form[action='/search']");
    const nextResults = next.querySelector("#search-results");
    const currentForm = document.querySelector("form[action='/search']");
    if (!nextForm || !nextResults || !currentForm) return false;
    document.getElementById("search-results")?.replaceWith(nextResults);
    currentForm.replaceWith(nextForm);
    return true;
  }

  document.body.addEventListener("click", async (e) => {
    const button = e.target.closest("button[formaction]");
    const currentForm = document.querySelector("form[action='/search']");
    if (!button || !currentForm || !currentForm.contains(button)) return;
    e.preventDefault();
    const params = new URLSearchParams(new FormData(currentForm));
    const action = new URL(button.getAttribute("formaction"), location.href);
    action.searchParams.forEach((v, k) => params.set(k, v));
    const ok = await swapIn("/search?" + params.toString());
    if (!ok) button.closest("form").submit();
  });
})();
</script>`,
  );
}

export function renderNotFound(): string {
  return layout("Not found — Commonplace", `<h1>Not found</h1><p>Nobody's at this link.</p>`);
}

export function renderReadme(bodyHtml: string): string {
  return layout("About &mdash; Commonplace", `${bodyHtml}\n<p><a href="/">&larr; Back</a></p>`);
}
