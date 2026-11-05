<!--
TEMPLATE — not a draft. Fill in each [bracketed] prompt below, then delete
this comment block and the section headers, so the submitted file reads as
plain prose with no template scaffolding visible. Target 600-800 words
total across all sections; per-section ranges are guides, not hard caps.
Every citation needs checking against its primary source before the
submission commit — see the verification-audit note in
research/reading-list.md for why that step isn't optional.

BALANCE RULE, applies to every section below (added after external
review): this note argues something about the FIELD, not about this
project. Field literature (grounding theory, self-report-reliability
studies, trust calibration, mental-model research) does the load-bearing
work everywhere. Anything from this project's own history (the Petronio
citation check, the Docker recurrence, the assignment-2 spec-audit
reversal, the fabricated-statistic incident) is illustration only —
at most one full worked example across the whole note, everything else
project-specific gets a clause, not a paragraph. If a sentence only makes
sense next to a screenshot of this app or this agent's session log, it
belongs in PROCESS.md or README.md, not here — see the spec's own
three-way split (README = good for this app; PROCESS = good for how I
worked; this note = good practice in the field). Check this rule again at
the end: if personal evidence is doing more than ~15% of the note's words,
cut it back before submission.
-->

# Research note: [working title — state the position, don't describe the topic]

<!-- SECTION 1 — POSITION (70-90 words)
State the claim directly, no throat-clearing, no "in this note I will
argue." It needs a real losing side — something a reasonable, well-read
person could disagree with, not a fact everyone would nod along to once
shown the evidence. This sentence needs to survive unedited into the final
draft — if it changes later, the rest of the note has to change with it.
No project reference here at all — this is the field-level claim, stated
as something true of agentic development generally. -->

[One or two sentences: the position, as a general claim about the field.
Then one sentence previewing why the obvious alternatives don't already
cover this.]

<!-- SECTION 2 — MECHANISM: why self-report has nothing outside itself to
check against (110-130 words)
This is the "why," not the "what" — keep it theoretical/structural, not
empirical. Ground it in grounding theory (Harnad's symbol grounding
problem; Bender & Koller's "Climbing towards NLU") — a model has no body,
no memory of having been present, no independent social confirmation,
only more generated text, including the text it generates to check
itself. If the founding intuition behind this whole note (something like
"a model can't anchor itself the way an embodied being can") wants to
appear anywhere, this is the section — stated once, briefly, as the
mechanism, not revisited later. -->

[The grounding-theory claim, cited, stated as a mechanism: why a model's
account of its own work has nothing external to check against. One
sentence on what this implies specifically for self-report.]

<!-- SECTION 3 — CONSEQUENCE: what that mechanism produces, measured
(110-130 words)
This is the "what" — the empirical, field-level evidence, as the observed
symptom of section 2's mechanism, not a separate claim. Weigh 2-3 sources
against each other — show what each adds that the others don't, don't
just list them back to back. This is where "synthesize, don't summarize"
is judged hardest. All field literature here — no project reference. -->

[Source 1: what it found, in one sentence, specific enough that the
number or mechanism is doing work, not decoration.]

[Source 2: what it adds that source 1 doesn't — a different angle, a
sharper number, a mechanism explanation.]

[Source 3 if needed: ditto. Close with one sentence stating plainly why
this is a different failure category from a code-correctness bug — not
something a test could ever catch, by construction, not just something
tests currently catch badly.]

<!-- SECTION 4 — THE TWO OBVIOUS FIXES, AND WHY EACH STAYS INSIDE THE SAME
CHAIN (130-160 words)
This is the comparison the HD band wants: sources "weighed against each
other and put to work." Both fixes reframed explicitly as never leaving
the generated-text loop — not just "two fixes that happen to fail," but
two fixes that fail for the SAME underlying reason established in section
2. Field literature only. -->

Fix candidate 1 — asking the agent to check its own work again: [cite the
source showing self-correction without external signal degrades rather
than improves accuracy; state why — a second pass inside the same context
is the same opinion restated, not a second opinion].

Fix candidate 2 — consulting a different instance or model: [cite the
convergence evidence for this HEDGED, not as direct proof — note
explicitly what the citation actually measures (e.g. open-ended
generation tasks) versus what's being claimed here (verification tasks);
lean on the mechanism argument — a second model's check is still only
text generated by a model, so it has no more access to ground truth than
the first one did — rather than resting the whole claim on one number].

<!-- SECTION 5 — WHAT ACTUALLY TERMINATES THE REGRESS: the positive
criterion (140-170 words)
This is the center of the note — the positive claim, not a list of
insufficiencies. State explicitly what makes a check actually work.

PREFERRED PHRASING (refined, verified against a real source — checked
directly against the full paper, not just its abstract): state the
criterion as "verification must terminate at a point beyond any
generating agent's control to fabricate or rewrite" rather than just
"outside generated text." This phrasing is tighter — it folds the
immutability condition (the source can't be rewritten by the agent being
checked) into the same clause as the grounding condition, instead of
needing two separate requirements. Citable precedent for near-identical
language: Salfeld-Nebgen, "Governing Actions, Not Agents" —
https://arxiv.org/abs/2606.26298 — "independently attested and beyond
the agent's control to fabricate," framed around the paper's "rogue
agent problem" (a compromised agent staying within its authorized scope
while pursuing adversarial objectives, against which "runtime behavioural
monitoring is structurally ineffective").

CRITICAL GUARD — do not drop this: "agents' control" must be stated as
plural/general (agents in general, not just the one under review), or the
phrasing quietly reopens the second-model loophole from section 4 — read
narrowly, a second model's opinion is technically "beyond THIS agent's
control to fabricate," but it was still fabricated by an agent, just a
different one, so it still fails the criterion. State this explicitly,
don't leave it to be inferred.

MUST include an explicit answer to the infinite-regress objection: the
regress doesn't terminate at "some layer deep enough," it terminates the
moment any layer is beyond any generating agent's control — a primary
source, directly observable state, an immutable spec/test with an
independently observed result, a human's own memory. State this directly,
don't just gesture at calibration and hope the reader infers it. ONE
worked example maximum from this project's own history (not three) —
everything else gets a clause. Close with a trust-calibration source
(doesn't need to be AI-specific) for why this termination has to be
re-confirmed periodically, not solved once. -->

[State the positive criterion directly, using the "beyond any generating
agent's control" phrasing, explicitly plural/general.]
[State the regress-termination answer explicitly: the chain stops at the
first layer beyond any agent's control to fabricate, not at some depth —
and this rules out a second agent's opinion too, since it's still
agent-fabricated, just by a different agent.]
[ONE worked example, in a sentence or two, illustrating the criterion —
keep it compressed, not a narrated story.]
[One clause each, if needed, for 1-2 more conditions a check has to meet
— e.g. the agent's own report of having consulted a source doesn't itself
count as having consulted it.]
[Close with the calibration source: why this is maintained over time, not
solved once.]

<!-- SECTION 6 — COUNTER-CASE, TAKEN SERIOUSLY (100-130 words, widened
slightly for the sharper version below)
Required by the HD band explicitly. Don't strawman the alternative
position — concede what it's genuinely good for, then state PRECISELY why
it's a different axis, not a weaker version of this note's claim. Name the
axes explicitly as capability vs. epistemic, not just "different failure
mode." Field literature only — no project reference needed here, the
distinction should hold on its own.

SHARPENED VERSION (checked against field vocabulary, don't invent new
terms): concede that scope/permissions, done WELL, means a representational
rule is not enough — a prompt-level instruction (e.g. a config-file "don't
do X") is interpreted by the model and can be narrated past, same as any
other generated text; what actually restricts capability is an
architectural gate outside the model's control (a hook running as plain
code, a permission system that actually refuses the call) — this is a live
distinction in the field, sometimes put as "prompts are suggestions, hooks
are enforcement," with real empirical backing: prompt-based/LLM-judge
guardrails have been bypassed at high rates (e.g. OpenAI's Guardrails via
prompt injection; Azure/Meta prompt-shield evasion rates above 70% in one
study). Bostrom's older capability-control-vs-motivation-selection
framework (*Superintelligence*) is a useful anchor here too — and Bostrom's
own conclusion, that capability control is "at best a temporary and
auxiliary measure," independently supports the move this section needs:
even a GATE (not just a rule) only closes the capability question — can
the agent complete the action — not the epistemic one — is its account of
having completed it, or of what it found, trustworthy. A hard-blocked
agent can still self-report "I'm ready to deploy." That's the precise,
citable version of "orthogonal axis, not a weaker version." -->

[Name the strongest alternative position (scope/permissions) and concede
what rigorous versions of it actually require — architectural enforcement,
not just a stated rule — with its citation. State plainly that this closes
the capability axis. Then state explicitly, with the gate/self-report
example, why the epistemic axis survives even when the capability axis is
fully solved.]

<!-- SECTION 7 — CLOSE (30-50 words)
No new material. Land the argument — ideally naming what's missing from
the field's current attention, not just restating the position. If the
founding intuition from section 2 earns a callback, one sentence only,
without re-explaining it. -->

[Closing sentence(s).]
