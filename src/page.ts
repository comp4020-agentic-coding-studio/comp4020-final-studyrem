// HTML templating. No framework: for one page and one form, a template
// literal is the smallest thing that works.
import type { Field } from "./data.ts";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const STYLE = `
  body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #1a1a1a; }
  form { display: grid; gap: 0.5rem; margin: 1.5rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 0.5rem; }
  label { display: grid; gap: 0.25rem; font-size: 0.9rem; }
  input, textarea { font: inherit; padding: 0.4rem; border: 1px solid #bbb; border-radius: 0.25rem; }
  button { justify-self: start; padding: 0.4rem 1rem; }
  ul { list-style: none; padding: 0; }
  li { border-top: 1px solid #ddd; padding: 0.75rem 0; }
  li h2 { margin: 0 0 0.25rem; font-size: 1rem; }
  li p { margin: 0; white-space: pre-wrap; }
`;

export function renderIndex(fields: Field[]): string {
  const items = fields
    .map((f) => `<li><h2>${escapeHtml(f.title)}</h2><p>${escapeHtml(f.content)}</p></li>`)
    .join("\n");
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Commonplace</title>
<style>${STYLE}</style>
</head>
<body>
<main>
<h1>Commonplace</h1>
<p>A profile is a set of fields: a title, and whatever you want to say about
it. Add one below &mdash; it stays here.</p>
<form method="post" action="/fields">
  <label>Field title <input name="title" required maxlength="80" /></label>
  <label>What you want to say <textarea name="content" required maxlength="2000" rows="4"></textarea></label>
  <button type="submit">Add field</button>
</form>
<ul>
${items || "<li>No fields yet &mdash; add the first one.</li>"}
</ul>
<p><a href="/readme/">What good means for this app</a></p>
</main>
</body>
</html>
`;
}

export function renderReadme(bodyHtml: string): string {
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>About &mdash; Commonplace</title>
<style>${STYLE}</style>
</head>
<body>
<main>
${bodyHtml}
<p><a href="/">&larr; Back</a></p>
</main>
</body>
</html>
`;
}
