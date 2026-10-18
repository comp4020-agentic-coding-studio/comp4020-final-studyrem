# Decision log

What's been decided, and why — context and alternatives where they matter.
Not `PROCESS.md` (that's the curated, written-by-you account for markers);
this is the fuller working record it gets written from. Supersedes
`notes/process-draft.md` and the decisions previously mixed into
`notes/final-project-design.md` (both folded in here, now redundant).

## Product decisions

**1. App concept: a mutual-disclosure profile board.**
Context: started from autism-specific framing, needed something more
specific than a generic social app but defensible to claim.
Why: avoids both the "median answer" (a feed/chat app) and overclaiming
expertise on a clinical population. See decision 3 for the final audience
framing.

**2. Headline principle: nobody is ever exposed to someone's attention
without having opted in first.**
Why: every other product decision below is an instance of this one idea,
not an unrelated pile of safety features — it's what makes the design
choices cohere into a single argument for `README.md`.

**3. Audience: framed around social anxiety broadly, not autism
specifically.**
Context: raised that narrowing to autism risked claiming clinical authority
none of us have.
Why: "social anxiety" is specific enough to drive real design constraints
(no forced live presence, no visible pressure to respond), general enough
not to overclaim expertise. Rejected "anyone who dislikes small talk" as
too broad to be a real constraint.

**4. Core mechanic: mutual field-visibility.**
A viewer sees a field's content only if they've also added that field
themselves.
Why: operationalizes the headline principle directly (this is Helen
Nissenbaum's contextual integrity, essentially implemented rather than
cited as a metaphor), and produces a crisp, testable invariant for free —
most app ideas have to search for a rule like this.

**5. Discovery: no public feed or browse page. Reachable only by direct
link, or by searching inside a field you already hold.**
Context: considered "suggest a profile you might like" (person-first
discovery) and rejected it.
Why: person-first discovery means being matched/recommended as a person,
which is exactly the unsolicited-attention problem the app exists to avoid.
Field-first discovery (you reach someone through a topic you already opted
into) preserves agency; this was the user's own correction to an earlier,
wrong framing that treated "growth" and "calm" as opposed. They aren't —
the axis that matters is *who initiates*, not *whether growth happens at
all*.

**6. Search semantics: scoped to a field you already have; returns only
users who also have that field.**
Context: considered a "teaser" design (reveal a match exists, hide content
until you unlock it) and rejected it in favor of this simpler rule.
Why: this isn't a new privacy mechanism — it's the exact same mutual-field
rule from decision 4, applied to search instead of direct viewing. One
invariant, enforced in two places, is simpler to build and reason about
than two different rules that happen to feel similar.

**7. Real-time interpretation: propagation latency (~1s, no reload),
not interaction pace.**
Context: the spec's "real-time" requirement could be read as "the app
needs to feel like live chat" or as "a change reaches another open session
quickly." Confirmed against the crit 9 brief: it's the latter.
Why: this audience specifically doesn't want forced synchronous pressure.
Decision: the *system* is real-time infrastructure; using it synchronously
(building a profile together live) is one optional use, never a
requirement baked into the UI.

**8. Real-time scope: only an already-open, already-reciprocal profile
view updates live. Discovery and suggestions stay pull-based.**
Context: given decision 5 (no feed) and the suggestion mechanism being
inherently per-encounter, asked directly where real-time actually applies.
Why: the only place two sessions can legitimately both be "present" on the
same data is a profile view that already required reciprocity to exist.
Inventing a second live surface (e.g. making suggestions push live) would
only be for demo appearances, not because the design needs it — rejected.
Consequence: demoing this at the crit 9 pod session requires the pod to
establish reciprocity live first (one adds a field, the other matches it),
then show the live update — a real demo of the actual mechanic, not a
fabricated one.

**9. Growth/suggestion mechanism: contextual per-encounter suggestion
(computed when B views A), capped at once per field per viewer per week,
anonymized.**
Context: two mechanisms were proposed. Mechanism 1 (this one) and
Mechanism 2 (push a new field to some users, widen if most adopt it —
a staged/viral rollout).
Why mechanism 2 was rejected: solves an adoption-at-scale problem that
doesn't exist at the actual target scale (a dozen-ish people), adds real
state-machine complexity (what counts as "some," what threshold is "most"),
and is a growth-optimizing mechanic that sits oddly against every other
restraint-favoring decision in this design. "We chose not to build a
virality mechanism because this is for a dozen people, not a platform" is
the stated justification, not a cop-out.
Why the cap and anonymization: a resurfacing or attributed suggestion
amounts to "someone specific was just looking at you," which risks the
same stress the app exists to avoid.

**10. Field-name collision handling: autocomplete existing field titles
while typing a new one (the pattern many customer-service/blog sites use).**
Why: with many users independently inventing field titles, near-duplicate
titles ("Favourite stim toy" vs "favorite stim toy") would silently never
match. Suggesting existing titles nudges toward a shared vocabulary without
forcing a rigid admin-curated list.

**11. "Decentralized" clarified as governance, not infrastructure.**
Context: the ambition was stated as "a decentralized networking platform,"
which could be read as either (a) no central server/peer-to-peer
infrastructure, or (b) no central curator of the field vocabulary.
Why this matters: (a) is incompatible with the course's fixed harness (one
Fly machine, one volume, no separate database server app) regardless of
ambition — this isn't a course-plugin limitation, it's what the provided
infrastructure physically is. (b) is fully buildable on that same
infrastructure and is what decisions 5, 9, and 10 already deliver. Settled
on (b) as the actual meaning going forward.

## Process/workflow decisions

**12. Crit 8 scope: single profile, add a field, persist. No matching,
search, suggestions, or real-time this week.**
Why: the crit 8 brief explicitly excludes the feature list, the real-time
layer, and polish — "proof of life" only. Confirmed against the published
brief, not assumed.

**13. Stack: plain Node (`node:http`) + TypeScript, run directly with
`node src/server.ts`. No framework, no build step.**
Why: three routes don't justify a framework's weight; Node runs TypeScript
natively (erasable syntax only — no enums/namespaces), confirmed working
on the actual Node version in use, so no bundler is needed either.

**14. Persistence (crit 8 only): flat JSON array at `/data/profile.json`,
with a local-directory fallback when `/data` isn't writable.**
Why: smallest schema that carries the current (single-profile) interaction,
per the crit 8 brief's own instruction to start there. Explicitly a
temporary choice — see decision 19 for the planned successor.

**15. `marked` is the one runtime dependency, used only to render
`README.md` at `/readme/`.**
Why: hand-rolling a markdown renderer under deadline pressure wasn't a
good trade. Everything else (the page template) is template literals,
since one page and one form don't need a templating library.

**16. Docker: `node:24-slim`, `pnpm install --frozen-lockfile --prod`,
then `node src/server.ts` directly. No separate build stage.**
Why: nothing to compile; matches the course's only fixed contract (serve
HTTP on `0.0.0.0:$PORT`, whatever the stack).

**17. Standing working rules (carried from crit2/4/5/7) govern agent
behavior in every repo, regardless of whether that repo's `CLAUDE.md`
currently states them.**
Incident: the final-project repo was cloned directly rather than carried
forward via **start**, so `CLAUDE.md` arrived blank. Built most of crit 8
before checking memory/established practice, resulting in two violations:
`PROCESS.md` written directly (violates "these are the user's to write"),
and a branch pushed + PR opened without being asked that turn (violates
"never touch the remote without being asked again, same turn"). Both
corrected: `CLAUDE.md` now carries all six standing rules plus this
project's own; `PROCESS.md` reverted to template, draft moved to
`notes/process-draft.md` (now folded into this log instead).
Why this is recorded here and not just fixed silently: it's a real example
of "how you directed, grounded, and corrected the agent's work," which the
crit explicitly asks you to be able to account for.

**18. Git workflow: commit locally as you go; push directly to `main` only
when explicitly asked, same turn. No branch/PR layer.**
Context: started the night routing all work through a branch + draft PR,
per a generic background-job caution against ever pushing to `main`
directly. The user asked directly why, pointing out crit7 (and every other
crit) never used this pattern — direct commits to `main` throughout, no
branches, no PRs, matching both the course's own CI design (`checks.yml`
triggers on direct pushes to `main`, no PR gate) and working rule 2 itself
("never push... without being asked again" implies push-when-asked, not
push-via-PR-when-asked).
Why switched: the branch+PR default was calibrated for a different
situation — an agent acting autonomously on a shared repo with no one
watching. Neither applies here: solo repo, no collaborators to protect
from an unreviewed push, and the user is present and directing each step
in real time. Applying the generic policy without checking fit was the
mistake, not the policy itself. From here: commit locally freely, push
straight to `main` only on explicit per-turn request — the "ask before
touching the remote" part of rule 2 stays, the PR layer doesn't.

**19. Removed two rules from `CLAUDE.md`'s project-specific section:
"a dependency earns its place / prefer Node's standard library" and
"keep the schema small."**
Context: the user asked where the first one actually came from, since they
didn't recall saying it. Checked, and neither had: the dependency-minimalism
rule was the agent's own implementation default from scaffolding (never
surfaced as a decision point, then retroactively written up as if it had
come from "tonight's design discussion"); the schema-size rule was a
near-quote of the crit 8 brief itself, not the discussion.
Why dropped rather than relabeled: `CLAUDE.md`'s entire premise is rules
the user actually decided on. Writing the agent's own defaults into it
under a false "we discussed this" attribution undermines that premise even
if the rule itself was reasonable. If either is wanted going forward, it
needs to be adopted as an explicit decision now, not inherited by
mislabeling.

**20. Database for multi-user (crit 10 / final project): `node:sqlite`
(Node's built-in module), not `better-sqlite3`, not a JSON file per user.**
Context: flat JSON (decision 14, explicitly flagged there as temporary)
can't serve the design's own cross-user queries — "who else has field X"
(decisions 5/6's search) and the per-`(viewer, field)` 7-day suggestion cap
(decision 9) both need an index over every user's fields, not just one
user's file. That's a correctness/shape problem, not a scale one: it's
already wrong at today's size, since no single-file layout lets you query
across files without loading and scanning all of them on every request.
Why `node:sqlite` over `better-sqlite3`: confirmed directly against
`node 24.21.0` (the version pinned in `mise.toml`) — `DatabaseSync` runs
with no flags, and `FTS5` (full-text search, for the field-content search
in decisions 5/6) is compiled in and working. `better-sqlite3` needs a
prebuilt native binary matching Node's ABI; Node 24 uses ABI 137, and
versions before 12.0.0 ship no prebuilt binary for it, meaning a silent
fallback to compiling from source — which fails on `node:24-slim` (the
current Dockerfile's base image, no compiler or Python present) unless a
build-toolchain stage is added. `node:sqlite` avoids that risk entirely and
adds no dependency, which fits decision 13's own standard ("a dependency
should earn its place") better than pulling in `better-sqlite3` would.
Raw query performance is a wash between the two for an app this size, so it
didn't factor in.
Caveat carried forward: `node:sqlite` is officially a release candidate
(stability 1.2), not stable — the API could still shift in a later Node
release. Not a live risk here since the Node version is pinned in
`mise.toml`; would need re-checking if that pin is ever bumped.
Scope of the resulting change: replace `src/data.ts`'s JSON-file storage
with `node:sqlite` tables (users, fields, and a suggestions-shown table for
the cap), per the schema already sketched in `DesignDraft.md`. No Dockerfile
change, no new dependency, no framework change. Migration from the existing
JSON on the Fly volume still needs its own plan before this is built.

**21. Framework for the server layer (final project): stays plain
`node:http`, not Express/Fastify/etc.**
Context: re-examined on the assumption the growing feature set (accounts,
real-time, search, suggestions) might now justify a framework, not just
crit 8's three routes.
Why kept: the whole server is ~580 lines across six files, with routing,
sessions and SSE already hand-rolled and working; nothing in the final
project brief or in `DesignDraft.md` (templating, routing, middleware)
needs what a framework would add. The brief itself asks for something other
than "the median answer" a framework-first build tends toward. A framework
swap here would be a stack change with no corresponding design need, which
is exactly what decision 13's own rationale (a dependency should earn its
place) argues against. Revisit only if a concrete, named requirement
appears that `node:http` genuinely can't serve cleanly — not in response to
the feature list simply growing.

**22. Replaced the crit 9 whole-profile share-token link with identity-based
mutual viewing (`/u/<username>`), live in both directions.**
Context: `README.md` had flagged the share link as a deliberate, temporary
stand-in since crit 9 — it showed a viewer someone's whole profile via an
opaque token, breaking decision 4's own rule (a viewer sees a field only if
they hold it too). Raised again once `searchField` (search, decision 6)
gave the app a working precedent for enforcing that rule server-side via
SQL, and once it became clear that a mutual view's live updates have to
fire on an edit by *either* person, not just the profile's owner, since
what's shown depends on both people's fields.
What changed: `src/data.ts`'s `mutualFields(ownerId, viewerId)` replaces
the token lookup — same title-equality rule as search, same index. The
`share_token` column, `findUserByShareToken`, and `rotateShareToken` are
deleted outright, not kept alongside the new route: two different access
rules for the same data was exactly the inconsistency decision 6 already
ruled out once. `src/live.ts`'s subscriber model changed from
`Map<ownerId, Set<ServerResponse>>` (notifies the owner's edits only) to a
`Set` of `{viewerId, ownerId, res}` records, so an edit by either side
triggers a recompute-and-push to every view it could affect.
Why no migration was needed: a read-only check of the deployed Fly volume
(`flyctl ssh console`, during decision 20's work) showed no real accounts
exist there yet — only the pre-accounts crit 8 legacy file — so this was a
schema change with nothing live to carry over.
Not built here, left as a known gap in `README.md` rather than papered
over: title matching stays exact-string (decision 10's autocomplete, not
yet built, is the design's intended fix, not something this change should
substitute for with e.g. silent case-folding).

**23. Built field-title autocomplete (decision 10), as a prefix-matched,
popularity-ranked suggestion list; confirmed it shows nothing until the
user types.**
Context: decision 10 named the actual harm this prevents — an un-nudged
near-duplicate title ("Favourite stim toy" vs "favorite stim toy") doesn't
just fail to help discovery, it silently breaks matching, since both
`mutualFields` and `searchField` compare titles by exact string equality.
Raised explicitly asking whether the empty/focus state should show
anything, since that's the same question as the still-open "passive browse
pool" decision in miniature: confirmed nothing shows until at least one
character is typed, so this change doesn't fold that open decision in as
an unstated side effect.
What was built: `src/data.ts`'s `matchingTitles(prefix, limit)` — a
`LIKE prefix%` match (not substring: this is "what might you be about to
type," not search), ranked by how many existing fields already use that
title, which is the literal "nudge toward a shared vocabulary" the decision
asks for. An empty prefix is rejected server-side, not just left to the
client to avoid — without that check, the endpoint itself would be a
de facto browse-all-titles API, which decision 5 (no browse page) already
ruled out; this keeps that decision closed regardless of what any later
client does with the endpoint. `GET /fields/suggest` requires login (401,
not a redirect — it's a `fetch()`-consumed JSON endpoint, not something a
browser navigates to) and isn't audit-logged, since unlike search or a
profile view it never reveals who holds a title or what they wrote, only
that the title string exists somewhere — not the kind of access `audit()`
exists to record.
Why a native `<datalist>` over a hand-rolled dropdown or htmx: this is the
one place in the app that genuinely needs client-side interactivity (the
framework research earlier in this project found server-rendered pages
cover everything else), and `<datalist>` is the smallest version of it —
no keyboard-nav or positioning code to write ourselves.
Not solved here: two already-existing near-duplicate titles in the
database aren't merged — this only nudges against *new* ones going
forward, same limit `README.md` already named.

## Open / not yet decided

- Whether a passive, pull-based "browse available fields" pool exists
  alongside the contextual suggestion mechanism (decision 9) — raised,
  not resolved. Decision 23 deliberately did not fold this in.
- The suggestion mechanism itself (decision 9) and its `suggestions_shown`
  table — not yet built.
- The app's actual name (`README.md` still says "Commonplace, working
  title").
