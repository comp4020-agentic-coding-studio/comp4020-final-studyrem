# Decision log

What's been decided, and why — context and alternatives where they matter.
Not `PROCESS.md` (that's the curated, written-by-you account for markers);
this is the fuller working record it gets written from. Supersedes
`notes/process-draft.md` and the decisions previously mixed into
`notes/final-project-design.md` (both folded in here, now redundant).

Renumbered once (see git history for the prior numbering): a few entries
that weren't actually decisions were dropped, a few redundant entries were
merged, and several real decisions that existed only in code/commit history
were added. Every cross-reference below uses the current numbers.

## Product decisions

**1. App concept: a mutual-disclosure profile board.**
Context: started from autism-specific framing, needed something more
specific than a generic social app but defensible to claim.
Why: avoids both the "median answer" (a feed/chat app) and overclaiming
expertise on a clinical population. See decision 2 for the final audience
framing.

**2. Audience: framed around social anxiety broadly, not autism
specifically.**
Context: raised that narrowing to autism risked claiming clinical authority
none of us have.
Why: "social anxiety" is specific enough to drive real design constraints
(no forced live presence, no visible pressure to respond), general enough
not to overclaim expertise. Rejected "anyone who dislikes small talk" as
too broad to be a real constraint.

**3. Core mechanic: mutual field-visibility.**
A viewer sees a field's content only if they've also added that field
themselves.
Why: operationalizes the headline principle directly — nobody is ever
exposed to someone's attention without having opted in first, the one
sentence every other decision below is an instance of, not an unrelated
pile of safety features. It also produces a crisp, testable invariant for
free — most app ideas have to search for a rule like this.

**4. Discovery: no public feed or browse page. Reachable only by direct
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

**5. Search semantics: scoped to a field you already have; returns only
users who also have that field.**
Context: considered a "teaser" design (reveal a match exists, hide content
until you unlock it) and rejected it in favor of this simpler rule.
Why: this isn't a new privacy mechanism — it's the exact same mutual-field
rule from decision 3, applied to search instead of direct viewing. One
invariant, enforced in two places, is simpler to build and reason about
than two different rules that happen to feel similar.

**6. Real-time interpretation: propagation latency (~1s, no reload),
not interaction pace.**
Context: the spec's "real-time" requirement could be read as "the app
needs to feel like live chat" or as "a change reaches another open session
quickly." Confirmed against the crit 9 brief: it's the latter.
Why: this audience specifically doesn't want forced synchronous pressure.
Decision: the *system* is real-time infrastructure; using it synchronously
(building a profile together live) is one optional use, never a
requirement baked into the UI.

**7. Real-time scope: only an already-open, already-reciprocal profile
view updates live. Discovery and suggestions stay pull-based.**
Context: given decision 4 (no feed) and the suggestion mechanism being
inherently per-encounter, asked directly where real-time actually applies.
Why: the only place two sessions can legitimately both be "present" on the
same data is a profile view that already required reciprocity to exist.
Inventing a second live surface (e.g. making suggestions push live) would
only be for demo appearances, not because the design needs it — rejected.
Consequence: demoing this at the crit 9 pod session requires the pod to
establish reciprocity live first (one adds a field, the other matches it),
then show the live update — a real demo of the actual mechanic, not a
fabricated one.

**8. Real-time transport: Server-Sent Events, relayed in an in-memory,
per-machine subscriber set, with a 25s heartbeat.**
Context: decisions 6/7 settle *what* counts as real-time and *where* it
applies, but not *how* it's built.
Why SSE over WebSockets: the stream is push-only — the client never sends
anything back over it — so SSE's plain-HTTP, auto-reconnecting model is
simpler than running a WebSocket handshake for a one-directional feature.
Why in-memory, not Redis/pub-sub: matches the course's fixed infrastructure
(one Fly machine, one volume, no separate database server app — see
decision 11's "decentralized is governance, not infrastructure" reading). A
single process can hold every open subscription directly; there's nothing
else running to coordinate with.
Consequence, stated here rather than discovered later: this design locks
the app to one Fly machine — a second machine's viewers would miss changes
written on the first, since the in-memory relay can't reach across
machines. `fly.toml` and `src/live.ts`'s own comment both name this
constraint.
Why the 25s heartbeat: Fly's proxy drops a connection that stays silent too
long; a periodic comment line keeps the stream open without the client ever
seeing it.

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
infrastructure and is what decisions 4, 9, and 10 already deliver. Settled
on (b) as the actual meaning going forward.

## Process/workflow decisions

**12. Stack: plain Node (`node:http`) + TypeScript, run directly with
`node src/server.ts`. No framework, no build step; `marked` is the one
runtime dependency; Docker copies source straight in, no build stage.**
Why: three routes (crit 8) didn't justify a framework's weight; Node runs
TypeScript natively (erasable syntax only — no enums/namespaces), confirmed
working on the actual Node version in use, so no bundler is needed either.
Hand-rolling a markdown renderer under deadline pressure wasn't a good
trade, so `marked` renders `README.md` at `/readme/`; everything else (the
page template) is template literals. Docker (`node:24-slim`,
`pnpm install --frozen-lockfile --prod`, then `node src/server.ts`
directly) has nothing to compile, matching the course's only fixed
contract (serve HTTP on `0.0.0.0:$PORT`, whatever the stack).
Reconfirmed (final project): re-examined on the assumption the growing
feature set (accounts, real-time, search, suggestions) might now justify a
framework. Kept: the whole server is ~580 lines across six files, with
routing, sessions and SSE already hand-rolled and working; nothing in the
final project brief or in `DesignDraft.md` (working notes kept outside
this repo, like the build-status notes README.md points to — templating,
routing, middleware) needs what a framework would add. A framework swap here would
be a stack change with no corresponding design need, which is exactly what
this decision's own rationale (a dependency should earn its place) argues
against. Revisit only if a concrete, named requirement appears that
`node:http` genuinely can't serve cleanly — not in response to the feature
list simply growing.

**13. Persistence (crit 8 only): flat JSON array at `/data/profile.json`,
with a local-directory fallback when `/data` isn't writable.**
Why: smallest schema that carries the current (single-profile) interaction,
per the crit 8 brief's own instruction to start there. Explicitly a
temporary choice — see decision 18 for the planned successor.

**14. Password hashing: `scryptSync` via `node:crypto`, not bcrypt or
argon2.**
Why: consistent with decision 12's own standard (a dependency should earn
its place) — `node:crypto` ships with Node, and `scrypt` is a memory-hard
KDF already considered adequate for this threat model (a small,
non-commercial app). Both `bcrypt` and `argon2` need a native binary — the
same ABI-compatibility risk later worked through for `better-sqlite3` in
decision 18 — which wasn't a trade worth making for an equivalent-strength
built-in option. Salted per-password (`randomBytes(16)`), compared with
`timingSafeEqual` rather than `===` (see also decision 24, which closed a
related timing leak at the login call site).

**15. Legacy data migration on first signup: the first account created
inherits crit 8's entire pre-accounts profile; the old file is renamed, not
deleted.**
Context: crit 8 shipped a single shared profile with no accounts (decision
13). Crit 9 added accounts, raising the question of what happens to that
existing data.
Why the first account specifically: with no accounts existing yet, there's
no principled way to ask "whose data is this" — crit 8's data was never
attributed to anyone. Attaching it to whichever account signs up first
keeps the crit 8 demo content from silently vanishing, without inventing a
fake owner.
Why rename rather than delete: a failed or partial migration shouldn't
destroy the only copy of that data; the renamed `.migrated` file is a
deliberate paper trail, not leftover clutter.
Caveat not resolved here: this makes the first signup's identity somewhat
arbitrary (whoever signs up first becomes "owner" of anonymous legacy
content) — acceptable for a solo-author demo app with no real users yet,
would need revisiting before any real multi-user launch.

**16. CLAUDE.md content integrity: two incidents where content needed
correcting before it could be trusted.**
First: this repo arrived cloned directly rather than provisioned via
**start**, so `CLAUDE.md` arrived blank. Most of crit 8 was built before
that gap was caught, during which two standing rules were broken:
`PROCESS.md` was written directly (rule: that's the user's to write), and
a branch was pushed and a PR opened without being asked that turn (rule:
never touch the remote without being asked again, same turn). Both
corrected: `CLAUDE.md` restored with all six standing rules plus this
project's own; `PROCESS.md` reverted to template.
Second: two rules later found in `CLAUDE.md`'s project-specific section —
"a dependency earns its place / prefer Node's standard library" and "keep
the schema small" — turned out not to have actually been agreed: the first
was the agent's own implementation default, retroactively attributed to
"tonight's design discussion"; the second was a near-quote of the crit 8
brief itself. Both removed rather than relabeled, since `CLAUDE.md`'s
entire premise is rules the user actually decided on.
Why recorded together: both are the same underlying risk — content in
`CLAUDE.md` asserting a provenance ("we agreed," "the rules say") that
doesn't hold up once checked — and the same fix: check where a claim
actually came from before trusting it, not just whether it reads
plausibly. See also decision 25, the same failure shape recurring in
README.md citations rather than CLAUDE.md rules.

**17. Git workflow: commit locally as you go; push directly to `main` only
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

**18. Database for multi-user (crit 10 / final project): `node:sqlite`
(Node's built-in module), not `better-sqlite3`, not a JSON file per user.**
Context: flat JSON (decision 13, explicitly flagged there as temporary)
can't serve the design's own cross-user queries — "who else has field X"
(decisions 4/5's search) and the per-`(viewer, field)` 7-day suggestion cap
(decision 9) both need an index over every user's fields, not just one
user's file. That's a correctness/shape problem, not a scale one: it's
already wrong at today's size, since no single-file layout lets you query
across files without loading and scanning all of them on every request.
Why `node:sqlite` over `better-sqlite3`: confirmed directly against
`node 24.21.0` (the version pinned in `mise.toml`) — `DatabaseSync` runs
with no flags, and `FTS5` (full-text search, for the field-content search
in decisions 4/5) is compiled in and working. `better-sqlite3` needs a
prebuilt native binary matching Node's ABI; Node 24 uses ABI 137, and
versions before 12.0.0 ship no prebuilt binary for it, meaning a silent
fallback to compiling from source — which fails on `node:24-slim` (the
current Dockerfile's base image, no compiler or Python present) unless a
build-toolchain stage is added. `node:sqlite` avoids that risk entirely and
adds no dependency, which fits decision 12's own standard ("a dependency
should earn its place") better than pulling in `better-sqlite3` would.
Raw query performance is a wash between the two for an app this size, so it
didn't factor in.
Caveat carried forward: `node:sqlite` is officially a release candidate
(stability 1.2), not stable — the API could still shift in a later Node
release. Not a live risk here since the Node version is pinned in
`mise.toml`; would need re-checking if that pin is ever bumped.
Scope of the resulting change: replace `src/data.ts`'s JSON-file storage
with `node:sqlite` tables (users, fields, and a suggestions-shown table for
the cap), per the schema already sketched in `DesignDraft.md` (also outside
this repo, not something a reader here can open directly). No Dockerfile
change, no new dependency, no framework change. Migration from the existing
JSON on the Fly volume still needs its own plan before this is built.

**19. Audit logging: what gets written to stdout on every meaningful
action, and what's deliberately excluded.**
Context: crit 10 added accounts and cross-user visibility (search, mutual
viewing), which meant for the first time an action by one user could
affect what another user sees — worth being able to reconstruct after the
fact.
What's logged (`src/audit.ts`, one line per event, to stdout —
`flyctl logs` is the only reader): event name, user id, and username; for
field actions, the field *title*; for search, the query and result count;
for profile views and connections, both parties' ids and usernames.
What's deliberately excluded: field *content* (what two people actually
wrote to each other under a mutual field) and password hashes never appear
in a log line — the log can show that a connection happened, never what
was said. `GET /fields/suggest` (decision 21's autocomplete) is the one
read path left unlogged, since unlike search or a profile view it never
reveals who holds a title or what they wrote, only that the title string
exists somewhere.
Why this matters more here than in a typical app: the entire headline
principle (decision 3) is about controlling who learns what about whom — a
log that captured field content would itself be a second, unaccounted-for
channel through which "nobody is exposed without opting in" could be
violated, readable by anyone who can run `flyctl logs` against the
deployed app. Logging titles but not content is a direct instance of the
same discipline, not a separate security afterthought.
Not solved here: there's no retention limit or access control on Fly's own
log stream beyond who can run `flyctl logs` against this app — out of
scope for what the course's infrastructure provides, but worth naming as a
boundary rather than pretending it doesn't exist.

**20. Replaced the crit 9 whole-profile share-token link with identity-based
mutual viewing (`/u/<username>`), live in both directions.**
Context: `README.md` had flagged the share link as a deliberate, temporary
stand-in since crit 9 — it showed a viewer someone's whole profile via an
opaque token, breaking decision 3's own rule (a viewer sees a field only if
they hold it too). Raised again once `searchField` (search, decision 5)
gave the app a working precedent for enforcing that rule server-side via
SQL, and once it became clear that a mutual view's live updates have to
fire on an edit by *either* person, not just the profile's owner, since
what's shown depends on both people's fields.
What changed: `src/data.ts`'s `mutualFields(ownerId, viewerId)` replaces
the token lookup — same title-equality rule as search, same index. The
`share_token` column, `findUserByShareToken`, and `rotateShareToken` are
deleted outright, not kept alongside the new route: two different access
rules for the same data was exactly the inconsistency decision 5 already
ruled out once. `src/live.ts`'s subscriber model changed from
`Map<ownerId, Set<ServerResponse>>` (notifies the owner's edits only) to a
`Set` of `{viewerId, ownerId, res}` records, so an edit by either side
triggers a recompute-and-push to every view it could affect.
Why no migration was needed: a read-only check of the deployed Fly volume
(`flyctl ssh console`, during decision 18's work) showed no real accounts
exist there yet — only the pre-accounts crit 8 legacy file — so this was a
schema change with nothing live to carry over.
Not built here, left as a known gap rather than papered over: title
matching stays exact-string (decision 10's autocomplete, not yet built at
the time, was the design's intended fix, not something this change should
substitute for with e.g. silent case-folding).

**21. Built field-title autocomplete (decision 10), as a prefix-matched,
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
de facto browse-all-titles API, which decision 4 (no browse page) already
ruled out; this keeps that decision closed regardless of what any later
client does with the endpoint. `GET /fields/suggest` requires login (401,
not a redirect — it's a `fetch()`-consumed JSON endpoint, not something a
browser navigates to); see decision 19 for why it isn't audit-logged.
Why a native `<datalist>` over a hand-rolled dropdown or htmx: this is the
one place in the app that genuinely needs client-side interactivity (the
framework research in decision 12 found server-rendered pages cover
everything else), and `<datalist>` is the smallest version of it — no
keyboard-nav or positioning code to write ourselves.
Not solved here: two already-existing near-duplicate titles in the
database aren't merged — this only nudges against *new* ones going
forward, same limit `README.md` already named.

**22. Fixed session invalidation on logout: a per-user session-version
counter, not a server-side session table.**
Context: a clean-subagent adversarial audit (standing rule 5 — audits go
to a fresh subagent in a client stance) found that `POST /logout`
(`src/session.ts`) only cleared the cookie client-side (`Max-Age=0`);
the signed cookie itself carried no server-side revocation, so a captured
pre-logout cookie value stayed fully valid for its whole 30-day lifetime.
Confirmed reproducible: replaying the old cookie against `/me` after
logout still returned the logged-in page.
What changed: `users` gains `session_version` (added via a `PRAGMA
table_info` check + `ALTER TABLE`, since `CREATE TABLE IF NOT EXISTS`
doesn't retrofit columns onto an already-created table). The session
cookie's signed payload grows from `userId.expiry.mac` to
`userId.sessionVersion.expiry.mac`. Logout bumps that user's
`session_version` (`bumpSessionVersion`); any cookie carrying the old
version — the one just cleared, or any other copy already captured —
fails `currentUser`'s version check immediately.
Why a version counter over a session table: nothing to store or
garbage-collect, and the existing stateless-signed-cookie design
(`session.ts`'s own stated reason: a redeploy or idle-machine stop
shouldn't log everyone out) stays intact — this is one integer per user,
not a growing list.
Trade-off, accepted deliberately: logging out invalidates *every* session
for that account at once, not just the one that clicked logout — logging
out on one device logs you out everywhere. For this app's scale (no
"stay logged in on other devices" feature exists or was asked for) that
matches what most users expect "log out" to mean, and a narrower
per-device scheme would need a session table anyway.

**23. Made field-title matching case-insensitive everywhere (`COLLATE
NOCASE` on `fields.title`), closing the one place decision 10's concern
still applied automatically.**
Context: the same audit found `/search`'s field-ownership check was
case-sensitive while its content search (`q=`) was already
case-insensitive (SQLite's default `LIKE`) — an inconsistency, and the
user's call on it: nothing should be case-sensitive. The `/search`
ownership comparison happens in JS (`loadFields(...).some(...)`), not SQL,
so it needed its own `.toLowerCase()` fold on both sides; every SQL-level
comparison, `GROUP BY` (`matchingTitles`), and the existing title index
now respect case automatically via the column collation, in one place,
rather than relying on every current and future query to remember to fold.
This only closes the identical-text-different-case subset of decision 10's
concern — "board games" vs. "boardgames" is still a different title, which
is what the autocomplete nudge (decision 21) exists for, not something
case-folding could ever fix.

**24. Hardening from the same audit: removed a login timing side-channel;
gave visible feedback when a field submission is rejected or truncated.**
Login previously short-circuited before hashing when a username didn't
exist, so an existing-username wrong-password attempt (~25-30ms, a real
scrypt compare runs) was consistently ~15x slower than a nonexistent-
username attempt (~1-2ms) — identical response bodies, but the timing
alone told an attacker which usernames exist. Fixed by always running a
hash compare: `verifyPassword` now takes a `passwordHash` directly rather
than a `User`, so login can pass a fixed `DUMMY_PASSWORD_HASH` when no
user was found, making the cost the same either way. Verified by
re-running the same informal timing comparison the audit used — the gap is
gone. No automated timing assertion was added to `spec/`; timing-based test
assertions are inherently flaky, so this is a manual/re-run check, not a
`pnpm check` one.
Separately, every `POST /me/fields` redirect used to look identical —
`303 → /me` — whether a field was added, silently rejected (empty title or
content after trim), or silently truncated to the length limits. Now an
empty submission redirects to `/me?error=empty-field` and a truncated one
to `/me?notice=truncated`, each rendered as a message on the next `/me`
load. Deliberately **not** extended to field deletion: giving visible
feedback when a delete targets a nonexistent id, or someone else's field,
would mean telling the caller whether that id exists/who owns it — an
existence oracle immediately adjacent to the IDOR check the same audit
confirmed passes cleanly today. Silent no-op stays the right behavior
there.

**25. CLAUDE.md rule: citations in README.md need a specific line
connecting them to this app's actual mechanic before they're kept, not
just genre resemblance.**
Context: the earliest README draft (`f8ee50f`) included Robin Sloan's
"home-cooked app" essay and Aral Balkan's "What is the Small Web?" — both
cut three days later (`1ce251c`) as "judged not actually relevant to this
app's argument." A classmate's independently-built app (a different
student's final project, a different agent session, no shared context)
pulled the identical two citations into its own earliest draft, for the
same non-reason — both real essays, confidently placed, that never did any
argumentative work specific to either app.
Why recorded as a standing rule rather than a one-off fix: two independent
agents converging on the same pair of sources at the same draft stage
(before any project-specific argument existed yet to check a citation
against) isn't a coincidence of taste — it's what a citation looks like
when chosen for matching a genre ("small," "not for growth",
"anti-platform") rather than for doing specific work. The same failure
shape as decision 16's CLAUDE.md incidents: confident, plausible, and
unverified.
What changed: added to `CLAUDE.md`'s project-specific rules, naming the
Sloan/Balkan case directly as the precedent to check future citations
against.

**26. Built the suggestion mechanism (decision 9): a per-encounter nudge
computed from the specific profile being viewed, capped at once per
(viewer, title) per week via a new `suggestions_shown` table.**
Context: the last unbuilt piece of decision 9, and the one that made
README.md's "a given field suggestion doesn't resurface... more than once
in seven days" enforced-bullet actually true rather than aspirational.
What candidate is suggested: explicitly chosen over a system-wide
popularity nudge — `suggestField(ownerId, viewerId)` in `src/data.ts`
picks the first title (in the owner's own field-creation order) that the
owner holds and the viewer doesn't, i.e. the complement of `mutualFields`,
using the same case-insensitive comparison (`fields.title COLLATE NOCASE`,
decision 23). This is what makes it genuinely "computed when B views A"
rather than a generic trending-titles widget that happens to render on a
profile page.
The cap: `suggestions_shown (viewer_id, title, shown_at)`, primary key
`(viewer_id, title)` — scoped to viewer-and-title, not
viewer-and-owner-and-title, matching decision 9's literal wording ("once
per field per viewer per week"). A fresh table via `CREATE TABLE IF NOT
EXISTS`, no `ALTER TABLE` migration needed (same situation decision 20
found: no real accounts exist on the deployed volume yet).
What "anonymized" means here, worth stating explicitly since the mechanism
is inherently tied to one specific profile on screen: the viewer obviously
knows which profile prompted the nudge — that's unavoidable and is the
point (decision 7: suggestions are pull-based, tied to an actual
encounter). What's protected is the other direction — the owner is never
told a suggestion was shown because of their fields. Enforced concretely in
`src/server.ts`'s `suggestion_shown` audit line: it logs the viewer's id,
username, and the suggested title, but deliberately not the owner's id or
username, unlike every other audit line involving two parties (decision
19). Nothing about a suggestion is pushed live or resurfaced outside the
moment of that profile view, per decision 7's "discovery and suggestions
stay pull-based" — the SSE stream (`src/live.ts`) is untouched.
Where it renders: `renderMutualProfile` (`src/page.ts`), below the shared-
fields list, with a form posting straight to the existing `/me/fields`
handler — adding the suggested field is identical to adding any other
field, so no new route was needed.

**27. No standalone "browse available fields" pool; the suggestion
mechanism (decision 9/26) is the answer to "what do I put in my profile."**
Context: raised at decision 21, left open through decision 26 — whether a
passive, pull-based browse page should exist alongside the per-encounter
suggestion.
Why: the current balance is right as-is. The headline principle (decision
3's "never exposed to someone's attention without opting in first") rules
out a browse page outright — that's exactly the feed/listing README.md
already forecloses. But a suggestion shown only when viewing a specific
mutual profile isn't passive browsing: it's a hint for someone who's
already opted in and simply doesn't know what to write next, not a way to
see what's out there before committing to anything. Keeping it scoped to
that moment, rather than generalizing it into a pool, is what keeps it a
hint rather than a nudge toward exposure.
What this doesn't resolve: `GET /fields/suggest` (decision 21) still lets
any logged-in user learn a title's existence and holder-count without
holding it themselves — a narrower, already-live version of "browsing"
that this decision doesn't touch. Left as-is, same as before.

**28. Fixed: a user's own `/me` tabs didn't sync live with each other.**
Context: reported directly — open two tabs on your own profile, edit a
field in one, the other stays stale until reload. Already named, but left
undecided, in `notes/DesignDraft.md`'s parking lot: decision 7 scoped live
updates to "an already-open mutual profile view" and never said anything
about a second tab on your own `/me`. `notifyFieldsChanged` (`src/live.ts`)
already fired for the editor's own id on every add/remove — nothing
subscribed to that from `/me` itself, so the push had nowhere to go.
Why this is a fix, not a design decision: unlike decision 27, this doesn't
touch the headline principle or the live-update scope — it's your own data
reaching your own other tabs, not pushed to or revealed to anyone else.
What changed: `src/live.ts` gained a second subscriber set (`ownSubs`) and
`subscribeOwnView`, mirroring `subscribeMutualView`'s relay/heartbeat/
cleanup shape; `notifyFieldsChanged` now also pushes `loadFields(editorId)`
to every open `ownSubs` entry for that user. `GET /me/events` in
`src/server.ts` wires a tab up to it, behind the same auth check `/me`
already uses. `renderOwner` (`src/page.ts`) gained the matching
`EventSource` script, rebuilding each `<li>` (including its delete form
and search link) from the pushed field list, the same `replaceChildren`
approach `renderMutualProfile` already used.
Covered by `spec/own-view.test.ts`: anonymous access redirects, a fresh
connection gets the current list immediately, a second "tab" (same
cookie, separate request) triggers a live push on add and on delete, and
one account's edits never reach another account's own-view stream.
Verified manually too: two concurrent `/me/events` connections on one
account, adding a field from one shows up on the other within ~1s without
a reload.

**29. Restyle: warm neutrals + one muted terracotta accent, plus calmer
interaction feel for live updates, errors, and empty states.**
Context: the app worked (decisions 1–28 shipped) but still rendered as an
unstyled template — default `system-ui`, `#1a1a1a` on white, hairline
gray borders, no focus states anywhere. Asked for: warm, but not
necessarily via warm colors (warmth as softness/calm, not hue);
accessible; inclusive for the audience README.md names (decision 2).
Confirmed up front: light mode only this pass (no dark mode yet), and
both the visual layer and the interaction feel (live-update arrival,
form feedback, empty states) get real attention, not just color/type.
Research grounding: calm technology (Amber Case/Mark Weiser, already
cited in README.md) motivates a quiet arrival for live updates rather
than an instant pop; trauma-informed design guidance (no sudden motion,
generous white space, non-alarming tone for errors) shaped the error
treatment and the choice to keep "Remove" an outline button rather than
a filled danger-red; WCAG contrast math (not eyeballing) set every color
value below.
Palette (light only): `--bg #faf6f0`, `--surface #ffffff`,
`--text #2a2420` (14–15:1 on bg, AAA), `--text-muted #6b5f55` (5.8–6.2:1,
AA), `--border #9c8671` (3.2–3.5:1 against both bg and surface — clears
WCAG 1.4.11's separate 3:1 UI-component-boundary threshold, not held to
the 4.5:1 text threshold), `--border-subtle #e6dacb` (decorative dividers
only, no contrast requirement applies), `--accent #8a3f26` (6.9–7.5:1,
AAA), `--accent-hover #6e3019`, `--accent-contrast #fff8f2`,
`--error #9a3324` (6.8:1, AAA). Humanist system font stack
(`-apple-system, "Segoe UI", system-ui`) — no web-font dependency, keeps
the no-dependency ethos README.md already claims for itself.
What changed, `src/page.ts`: `STYLE` rewritten with the palette above,
~38rem line length and 1.6 line-height (the readability-research sweet
spot for line length/spacing, generalizes well past the one population it
was studied in), a real `:focus-visible` ring on every interactive
element (there was none before — a genuine a11y gap closed, not just a
cosmetic change), filled accent buttons with an outline-only style for
`form.inline` (delete) actions, and a left-border-accent treatment for
`.error`/`.notice`/`.suggestion` so they read as a calm aside rather than
an alert popup. `fieldItem` now stamps each `<li>` with `data-field-id`;
both live-update scripts (`renderOwner`, `renderMutualProfile`) diff
incoming field ids against what's already on screen and apply a
`field-enter`/`field-enter-active` fade-and-settle transition only to
genuinely new items — wrapped in `@media (prefers-reduced-motion:
no-preference)`, so anyone whose OS says no motion gets today's exact
instant swap, unchanged.
Verified: `pnpm typecheck && pnpm test` (39/39 green, no spec touches
response bodies' matched text), `check:evidence` green, visual check via
a headless-Chromium script across login/signup, own-profile (clean and
error states), mutual-profile view, and a 375px mobile width — all
reflow cleanly with no horizontal overflow. Keyboard-only focus produces
a visible accent ring. The live-update fade was confirmed firing (two
tabs on one account, `field-enter`/`field-enter-active` both present on
the pushed `<li>` immediately after a cross-tab add) with zero console
errors.

**30. Restyle: open, editorial, letter-like visual language, replacing
decision 29's boxed-card chrome; plus a login-flow fix (signup folded
behind a disclosure instead of shown as an equally-weighted second form)
and two field-order refinements.**
Context: decision 29 fixed the accessibility gaps (contrast, focus states,
reduced motion) but kept a generic boxed-card/form-wizard visual language —
white cards, borders, drop shadows. Asked for: "beautiful," and warmth that
doesn't necessarily mean warm color (warmth as calm/softness, not hue);
and the interaction flow refined, not just repainted. Confirmed up front
(AskUserQuestion, three options with ASCII previews): open/editorial over
rounded-cozy or minimal-polish-only — read like a page in a notebook or a
letter to a stranger, which is literally how README.md frames the product
(Priya's story), not a SaaS dashboard.
What changed, `src/page.ts`: dropped every `form { border; border-radius;
box-shadow; background }` card treatment — forms are now plain grid
blocks with no visible container. Added a serif display-heading stack
(`Georgia, "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif`,
all pre-installed system serifs — no webfont, keeps the no-dependency
ethos) used only for `h1`/`h2`, never body/labels/controls, which stay on
the existing humanist sans. Hairline `<hr class="rule">` rules replace
borders as the visual-grouping device (under the login intro, before the
share-link block on `/me`). `.error`/`.notice`/`.suggestion` lost their
leftover `background: var(--surface)` card fill, now reading as a plain
left-accent-rule aside against the open page. All decision-29 palette
values, contrast ratios, `:focus-visible` ring, and the
`field-enter`/`field-enter-active` reduced-motion-gated fade are carried
over unchanged — this pass touched chrome, type, and rhythm, not the
accessibility work already done.
Flow fix (the login page): today's page always showed Log in and Create
an account as two fully-boxed, equally-weighted forms — a new visitor had
to parse both before acting. Replaced with a `<details class="signup">`
disclosure: Log in stays primary and always visible; "New here? Create an
account" is a `<summary>` that reveals the signup form on demand. Zero JS,
keyboard-operable and no-JS-safe by construction (matches the existing
progressive-enhancement constraint — every form here must work without
JS). `renderLogin` gained an `errorOn: "login" | "signup"` parameter so a
failed signup attempt re-renders with `<details open>` and the error next
to the signup form specifically, not floating ambiguously between both;
`src/server.ts`'s one signup-catch call site was updated to pass
`"signup"`. No new routes — same `/login`/`/signup` POST targets,
untouched.
Two flow refinements while in this file: the suggestion aside on
`/u/:username` (today rendered *after* the field list, easy to miss) now
renders directly under the page heading, before the list — a quieter,
earlier placement a viewer actually notices. On `/me`, each field's
action row ("Search for this" / "Remove") was reordered and restyled so
the forward-looking action reads first and more prominent, with "Remove"
visually secondary (smaller, muted) rather than competing evenly with it
— spacing/order only, no new color, the outline-vs-filled distinction
from decision 29 is untouched.
Verified: `pnpm typecheck && pnpm test` (39/39 green), `check:evidence`
green, visual check via headless Chromium (Playwright, matching the
already-installed chromium browser build) across: login logged-out with
signup collapsed, login with signup opened and its own forms, login with
a login-specific error, empty `/me`, `/me` with two fields, `/me` in its
error state, mutual profile with field overlap plus the suggestion aside,
mutual profile with no overlap (empty state), search with a result — each
at ~1280px and ~390px width, confirming no horizontal overflow and the
disclosure/forms remain reachable and fillable at both sizes.

**31. Search results now link to the matched person's mutual profile
(`/u/<username>`), reversing part of decision 5.**
Context: decision 5 deliberately left search results as username + matched
content only, no link out, reasoning that a link would show more of the
matched person than the one field search itself shares. Revisited because
search is this app's actual discovery surface — the way two strangers who
don't already know each other find and meet via a shared field — and a
result a viewer can't act on defeats that purpose. Decision: search exists
*to* connect people, not just to preview a field in isolation.
Why this doesn't weaken decision 3's headline principle: `/u/<username>`
(decision 20) independently recomputes `mutualFields(owner, viewer)` on
every hit — it was never gated by how the viewer arrived there. A search
result's link can only ever show a viewer what they already had a
standing right to see by holding the same fields; it exposes nothing the
viewer couldn't already reach by typing the username into the URL bar
directly. What decision 5 avoided (search leaking *extra* access) was
never actually at stake; what it also gave up — search working as a
connection mechanism — was the part worth keeping.
What changed: `src/page.ts`'s `renderSearch` wraps each result in an
`<a href="/u/<username>">`; `/u/<username>` itself, `mutualFields`, and the
mutuality check are untouched. No change to what `searchField` returns or
logs (`field_search` still records title/query/count only, per decision
19).

**32. Added a shared site nav (`src/page.ts`'s `siteNav`) to every
logged-in page, replacing `renderOwner`'s one-off header.**
Context: decision 31 made `/u/<username>` reachable from search, but that
page (like `/search` itself) had no way back except the browser's own
back button — `renderOwner`'s header (brand-less, just a logout form) was
never meant to be site-wide chrome, and `/search`'s "Back to your profile"
footer link was a one-off patch for the same underlying gap.
What changed: one `siteNav(username)` helper — brand link to `/me`, a
link to `/me` again (explicit, not relying on the brand being obvious),
the existing `/readme/` link, and the logout form — rendered at the top
of `/me`, `/search`, and `/u/<username>`. `renderMutualProfile` gained a
`viewerUsername` parameter (its existing `username` argument names the
*owner* being viewed, not the logged-in viewer, so the nav needed its own
parameter rather than reusing that one). Removed now-redundant one-offs:
`renderOwner`'s bespoke `<header>`, its trailing `/readme/` link, and
`renderSearch`'s "Back to your profile" footer link.
Not touched: `/login` and `/readme/` stay without the nav — both are
reachable logged-out, and `/login` already redirects straight to `/me`
for anyone with a live session, so there's no "logged in, stuck here"
case either page could produce.

**33. Search now covers all of a searcher's fields at once, each with its
own term, with an opt-in "allow partial matches" checkbox (default off:
strict AND across every non-blank criterion).**
Context: `/search` only ever let you search one field title at a time.
Asked directly: can a search cover more than one field, and can results
that match everything be distinguished from results that only match some.
Confirmed up front (AskUserQuestion) which of two readings was meant — one
query checked against several titles, or a separate query per title — and
it's the latter: e.g. Favorite Book contains "Dune" *and* Hobby contains
"Chess" are two independent criteria, not one term fanned out.
What changed, `src/page.ts`'s `renderSearch`: one text input per field
title the searcher currently holds (decision 5's "scoped to a field you
already hold" still gates which rows even exist), a new unlabelled
checkbox — "Allow partial matches" — and two result groups: "Matches all
N" (people satisfying every non-blank criterion) first, then "Matches
some" (at least one, not all) after. Each result row lists which
title(s) matched and their content, same decision-5 shape as before (only
the matched field's content, nothing else of that person), still linking
to `/u/<username>` per decision 31.
What the checkbox actually controls: unchecked (default) excludes anyone
who fails any non-blank criterion entirely — equivalent to today's
single-field behavior generalized to N fields, nobody sees a partial-match
section at all. Checked includes everyone who satisfies at least one
criterion, split into the two groups above. Defaulting off was explicit,
not incidental: a search that silently broadened from "every field
matches" to "some fields match" the moment a second row is filled in
would be a quiet widening of what search surfaces, the same category of
decision rule 4 and decision 31 both treat as something to write down, not
default into.
`src/data.ts`: `searchField(title, query, excludeUserId)` replaced by
`searchFields(criteria: {title, query}[], excludeUserId, allowPartial)`,
returning one row per matching user with the list of titles/content they
matched — count of that list is exactly what the two result groups split
on. No schema change; still one `LIKE` clause per criterion, still
case-insensitive on title via the existing `COLLATE NOCASE` column.
`field_search` audit events: unchanged shape, one event per non-blank
title searched (decision 19's per-title logging still holds, just emitted
N times per request instead of once).

**34. Search fields are added one at a time (pick from a dropdown, click
Add) instead of every held field being pre-listed; each row has its own
Remove.**
Context: decision 33 made every field the searcher holds show up as a row
on `/search` whenever they had more than a couple. Feedback: the function
was correct but didn't feel right — "throwing everything on the page" at
once, rather than letting the searcher build up a search deliberately.
Confirmed up front (AskUserQuestion) the actual mechanics wanted: a
dropdown + Add/Remove, JS-enhanced for an instant no-reload update, but
falling back to a plain page reload with JS off — matching the site's
existing progressive-enhancement rule (decision 30: every form here must
work without JS).
What changed, `src/server.ts`'s `/search` handler: criteria are no longer
built from *every* field the user holds — only the ones named by a `field`
param, repeated once per row the searcher has actively added, in that
order. The title in each `field` param is still only ever used to look up
a title the user actually holds (`ownTitlesByLower`, never trusted
outright) — decision 5's scoping is enforced exactly as before, just
against a subset of the user's fields instead of all of them. `?add=1&
add_field=<title>` appends a row for a title not yet added; `?remove=<i>`
drops row `i`; both are evaluated server-side on the row set the request's
own `field`/`q` params describe, so Add and Remove compose with whatever
was already on the form.
`src/page.ts`'s `renderSearch`: each added row carries its title forward
as a hidden `field` input so later Add/Remove submits don't lose it; the
Add control is a `<select>` of titles *not* yet added (empty once every
held field is on the form) plus a plain submit button
(`formaction="/search?add=1"`, `formnovalidate` so an empty query field
doesn't block it); each row's Remove button is the same pattern pointed at
`?remove=<i>`. All of this works as a normal GET with JS entirely off. A
small script on top intercepts those same button clicks, replays the
identical request via `fetch`, and swaps in the returned form and results
(`#search-results`, a dedicated wrapper — needed because a result's own
`<h2>` username heading would otherwise collide with a naive "swap every
h2/ul on the page" approach) with no reload; it falls through to a real
form submit if the fetch fails for any reason.
Not changed: decision 33's strict/partial matching and the "matches
all"/"matches some" split, decision 31's links to `/u/<username>`,
`searchFields` in `src/data.ts`. This is purely how the criteria set gets
built up, not what matching means once it's built.
`spec/search.test.ts` rewritten for the new `field`/`q` (repeated pairs,
one per added row) request shape, replacing decision 33's positional
`q_<i>` scheme; added coverage for Add, Remove, the dropdown only offering
not-yet-added titles, and an untrusted `field` param being silently
dropped.

**35. A field on your own profile can be edited in place (title and/or
content), not just removed and re-added.**
Context: `/me`'s fields only ever had Search/Remove — changing a typo or
updating what you'd written meant deleting the field and losing its place
in the list, then re-adding it. Confirmed what "editable" meant up front
(AskUserQuestion) — this is about a user's own profile fields, not
anything on `/search`.
What changed: `src/data.ts` gained `editField(userId, fieldId, title,
content)` — an `UPDATE`, not delete-then-insert, so `created_at` (and so
the field's position in the list) is untouched by an edit.
`POST /me/fields/<id>/edit` in `src/server.ts` validates and truncates
exactly like `POST /me/fields` (the add route), calls
`notifyFieldsChanged` so any open mutual view or other `/me` tab updates
live, and logs `field_edited` with both the old and new title (never
content, matching decision 19's "never log field content" — a rename is
itself worth being able to reconstruct, since it changes who the field is
mutually visible to).
UI: each field in `/me`'s list gets an "Edit" `<details>` disclosure
(same zero-JS pattern as decision 30's signup disclosure) that reveals a
pre-filled title/content form in place; `renderOwner`'s server-rendered
markup and the `/me/events` SSE reconnect script that rebuilds the list
client-side were both updated so a page load and a live update produce
the same Edit control.
Privacy note, not a new leak: renaming a field's title changes what's
mutually visible the moment it's saved (decision 3's title-equality
rule) — someone who held the old title stops seeing it, exactly as if
you'd removed the old field and added a differently-titled one. Verified
live: renaming "Hobby" to "Hobbies" immediately stopped a mutual viewer
who still held "Hobby" from seeing it, and surfaced "Hobbies" as a
decision-9 suggestion for them instead.

**36. "Add a field" on `/me` (not `/search`) is a native `<dialog>` popup
when JS is available, with the always-present form as the no-JS
fallback.**
Context: the ask was "making the 'add field' a separate popup," meant for
a user's own profile page where fields are created in the first place —
first built against `/search`'s add-a-search-row control instead, which
was the wrong target and has been reverted (see 37). `/search` keeps
decision 34's plain dropdown-and-Add row; nothing about that page's
interaction model changes here. Confirmed up front (AskUserQuestion) the
mechanism: a real modal dialog, not another disclosure variant,
specifically because `<dialog>` needs `.showModal()` from JS to open as a
modal at all — there's no way to make the dialog the *only* markup and
still have the feature work with JS off, so the plain form has to stay as
a genuine fallback, not just a decoration.
What changed, `src/page.ts`'s `renderOwner`: the existing "Add field" form
now has `id="add-field-fallback"`; immediately after it, a hidden
`+ Add a field` button and a `<dialog id="add-field-dialog">` containing a
second copy of the exact same form (same `POST /me/fields`, same fields,
same validation) are rendered unconditionally. A small script hides the
fallback form and un-hides the trigger once JS has run, wires the trigger
to `dialog.showModal()` and Cancel to `dialog.close()`. The title
autocomplete script (decision 10) now wires every `input[name="title"]`
on the page, not just one, since there are now two copies of that input
sharing the one `#title-suggestions` datalist.
Not changed: `src/server.ts`'s `POST /me/fields` route, which already
handled this exact request shape — this is UI-only, same request either
way.

**37. Reverted `/search`'s add-field control to decision 34's plain
inline dropdown-and-Add row; search itself moved off the per-field
"Search for this" links and onto a `Search` link in the shared site nav.**
Context: decision 36 (as first built) put the `<dialog>` popup on
`/search` instead of `/me` — a misreading of "add field" as the
search-row add control rather than a profile field. Corrected: `/search`
keeps exactly the dropdown-and-Add/Remove interaction decision 34
describes, with no dialog, since search is a separate function from
profile editing and clicking into one field's "Search for this" link
duplicated that function once `/search` could already search every field
on its own.
What changed: `renderSearch` drops the `<dialog>`/trigger markup and its
wiring script entirely (back to exactly decision 34's shape); `siteNav`
gained a `Search` link next to `Your profile`; `renderOwner`'s per-field
"Search for this" link (and the matching link built client-side in the
`/me/events` reconnect script) was removed, since finding people is now a
site-wide function reached from the nav, not an action tied to one
specific field. `field_search` audit events, `searchFields`, and
`/search`'s route handling are unchanged.

**38. Bug fix: the dialog's "legacy" fallback form on `/me` stayed visible
alongside the trigger, because `[hidden]` lost to the stylesheet's own
`form` rule.**
Context: reported after decision 36/37 shipped — both the always-present
`#add-field-fallback` form and the "+ Add a field" dialog trigger showed
up together, even with JS enabled. Root cause: `STYLE`'s `form { display:
grid; ... }` is an *author* rule; the browser's built-in `[hidden] {
display: none }` is a *user-agent* rule, and author rules always beat
user-agent rules for the same element regardless of selector specificity
or source order. So `fallback.hidden = true` (set correctly by the
decision-36 script) kept the `hidden` IDL attribute true, but the element
never actually stopped rendering, because `form`'s `display: grid` from
the page's own stylesheet overrode the UA's `display: none`.
What changed, `src/page.ts`'s `STYLE`: added `[hidden] { display: none
!important; }` right after the `form` rule, so any element marked hidden
now actually hides regardless of what other display rules target it. This
is a general CSS correctness fix, not specific to this one dialog — any
future `hidden`-toggled element (not just forms) was exposed to the same
bug.

- `GET /fields/suggest` (decision 21) lets any logged-in user learn a
  title's existence and holder-count without holding it themselves —
  confirmed by the same audit (querying a single/double-letter prefix
  surfaces titles across the whole system, titles and counts only, never
  content or usernames). Left as-is for now (probably intentional — it's
  literally how you discover what to type — but not an explicit call when
  decision 21 was made).
- The app's actual name (`README.md` still says "Commonplace, working
  title").
