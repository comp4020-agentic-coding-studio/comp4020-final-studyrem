<!--
TEMPLATE — not a draft. Fill in each [bracketed] prompt below, then delete
this comment block and the section headers, so the submitted file reads as
plain prose with no template scaffolding visible. Target 600-800 words
total across all sections; per-section ranges are guides, not hard caps.
Every citation needs checking against its primary source before the
submission commit — see the verification-audit note in
research/reading-list.md for why that step isn't optional.
-->

# Research note: [working title — state the position, don't describe the topic]

<!-- SECTION 1 — POSITION (70-90 words)
State the claim directly, no throat-clearing, no "in this note I will
argue." Name what the position is NOT before what it IS, if that framing
sharpens it (e.g. "not about X, but about Y"). This sentence needs to
survive unedited into the final draft — if it changes later, the rest of
the note has to change with it. -->

[One or two sentences: the position. Then one sentence previewing why the
obvious alternatives don't already cover this.]

<!-- SECTION 2 — WHY THIS IS A REAL, SEPARATE FAILURE CATEGORY (160-190 words)
Establish that the claim is about something testing/review can't catch BY
CONSTRUCTION, not just something they currently catch badly. Weigh 2-3
sources against each other — show what each adds that the others don't,
don't just list them back to back. This is where "synthesize, don't
summarize" is judged hardest. -->

[Source 1: what it found, in one sentence, specific enough that the number
or mechanism is doing work, not decoration.]

[Source 2: what it adds that source 1 doesn't — a different angle, a
sharper number, a mechanism explanation.]

[Source 3 if needed: ditto. Close the paragraph with one sentence stating
plainly why this category is different from a code-correctness bug.]

<!-- SECTION 3 — THE TWO OBVIOUS FIXES, AND WHY EACH FAILS (140-170 words)
This is the comparison the HD band wants: sources "weighed against each
other and put to work." Pick exactly two candidate fixes people actually
reach for. For each: name it, cite the source that undercuts it, state the
mechanism of failure in one sentence (not just "it doesn't work" — why). -->

Fix candidate 1: [name it — e.g. "ask the agent to double-check itself"].
[Cite the source that shows this fails, and the specific mechanism —
degraded accuracy, self/other framing artifact, whatever it is.]

Fix candidate 2: [name it — e.g. "get a second opinion from another
agent/model"]. [Cite the source that shows this doesn't give independence,
and why — convergence, shared training artifacts, etc.]

<!-- SECTION 4 — THE ONE MECHANISM WITH REAL EVIDENCE, AND ITS HONEST LIMIT
(140-170 words)
Name the one practice that actually has evidence behind it. Cite the
number. Then — in the same paragraph, not a grudging afterthought — name
what it does NOT fix. Pair with a framing source (not necessarily
AI-specific) that explains why the gap has to be managed on an ongoing
basis rather than closed once. -->

[The mechanism, cited, with its number.] [Its explicit limit — what it
reduces vs. what it doesn't guarantee.] [The framing source that explains
why this is an ongoing-calibration problem, not a one-time fix, and why
that's the actual answer to "is this an engineering question or something
else."]

<!-- SECTION 5 — COUNTER-CASE, TAKEN SERIOUSLY (90-120 words)
Required by the HD band explicitly. Don't strawman the alternative
position — concede what it's actually good for, then state precisely why
it's a different axis from this note's claim, not a worse version of it. -->

[Name the strongest alternative position — e.g. "maybe scope/permissions
is what actually matters" or "maybe better specs solve this." Cite the
source for it. Concede what it's genuinely good for. Then state the
specific reason it doesn't cover the same ground as this note's claim —
different failure mode, different mechanism, different thing being
measured.]

<!-- SECTION 6 — CLOSE (30-50 words)
No new material. One or two sentences that land the argument — ideally
naming what's missing from the field's current attention, not just
restating the position. -->

[Closing sentence(s).]
