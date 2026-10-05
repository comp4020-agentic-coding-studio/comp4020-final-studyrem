# Process overview

Decision-record style (after the format Cognitect's blog popularized for
architecture decisions): context, decision, consequences, status. First
version, written for crit 8 — expect it to be revisited, with a new record
rather than a silent edit, if the app outgrows these choices.

## Context

Crit 8 asks for "proof of life," not the final project: a stranger visits,
does the core thing, and finds their trace still there on return. The
feature list, real-time layer, and matching/search logic that the full
project eventually needs (multi-user, ~1s propagation, persistence across
restarts) are explicitly out of scope this week. The course harness fixes
the deploy shape regardless of stack: one Fly machine, one volume mounted at
`/data`, HTTP on `0.0.0.0:$PORT`.

The app itself (see `README.md`) is a profile made of fields, where a
viewer's access to another person's content is gated by reciprocity. For
crit 8, only the single-profile core needs to exist: add a field, have it
persist.

## Decision

**Stack:** plain Node (`node:http`) and TypeScript, run directly with
`node src/server.ts` — no framework, no build step. Node 24 runs TypeScript
natively as long as the syntax is erasable (type annotations, interfaces,
`import type`), which is all this needs. Three routes (`GET /`,
`POST /fields`, `GET /readme/`) don't justify a framework's weight, and
skipping a bundler means the Docker image is just the source files plus one
dependency.

**Persistence:** the profile is a flat JSON array of `{id, title, content,
createdAt}` written to `/data/profile.json` — see
[`9d1a4b2`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/9d1a4b2cd0f4f25d4d589895f3b442018a963014).
That's the smallest schema that carries this week's core interaction: one
profile, one list, no relations. It falls back to a local directory when
`/data` isn't writable (local dev, this week's test runs), so the same code
path runs everywhere without a `NODE_ENV` branch.

**Rendering:** `marked` is the one runtime dependency, used only to publish
`README.md` at `/readme/` — see
[`d6ebc0f`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/d6ebc0f6e74a8244c813260ae021ec9fd3733ab5).
Hand-rolling a markdown renderer under this week's deadline wasn't a good
trade; the page itself (`src/page.ts`) is template literals, since one page
and one form don't need a templating library either.

**Docker:** `node:24-slim`, `pnpm install --frozen-lockfile --prod`, then
`node src/server.ts` directly — see
[`32f032c`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/32f032c8d67dca95f037c0df93b0047b540ca676).
No separate build stage, since there's nothing to compile.

## Alternatives considered

- **Astro** (used in earlier static-prototype crits) — fits a site that
  ships HTML, not an app that needs to read and write state on every
  request. Dropped once the final project's multi-user/persistence
  requirements were clear, not partway through.
- **A real database** (SQLite, or a managed Postgres) — would be the right
  call once multiple profiles need querying against each other (weeks 9-10's
  matching and search), but is more machinery than one profile needs now.
  Revisit then, as its own decision record, rather than guessing now at
  what the matching logic will actually need to query.

## Consequences

The flat-JSON approach does not survive multi-user concurrent writes safely
and has no query capability beyond "the whole list" — both fine for one
profile, both likely wrong once matching/search land. That's a known,
accepted limit of this version, not an oversight: the brief says to start
from the smallest schema that carries the *current* interaction, and widen
it when a real requirement appears.

## Status

First version, crit 8. To be rewritten, not patched, when real-time and
multi-user visibility are added — see
[`999a02a`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/999a02af9adb75a64ea7a6021123e80ef0dc609e)
for the rules this agent is being held to in the meantime.
