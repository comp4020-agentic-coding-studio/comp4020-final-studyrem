# Reading list for research-note.md

Working notes toward the COMP8020 research note (600–800 words, due with the
final project 2026-11-09). The note needs a cited, argued position on good
agentic development practice *in the field* — not what's good for this app
(that's README.md) or for how I worked (that's PROCESS.md). Sources below are
a mix of peer-reviewed/preprint work and practitioner writing, grouped by the
question each cluster speaks to. None of this is a position yet — it's raw
material to read and argue with.

Open questions this reading raises, to resolve before drafting:
- Does "good practice" mean *process* (how agents are supervised/scoped) or
  *artifact quality* (what the resulting code looks like)? The sources split
  roughly along this line.
- Where do the empirical productivity studies (Peng et al., METR) actually
  disagree, and does the disagreement matter for the position I take?
- The Huang et al. "control" paper and the Anthropic workflow/agent piece
  make almost the same claim from different angles — worth checking if they
  cite each other or are independent convergence (echoes the Sloan/Balkan
  pattern from README.md — see PROCESS.md).

---

## 1. What "good" agentic practice looks like — frameworks & roadmaps

**"Agentic Software Engineering: A Roadmap to Software Engineering 3.0"**
(ICSE-Companion 2026) — https://dl.acm.org/doi/10.1145/3774748.3776601
Empirical characterization of 567 real Claude Code PRs across 157 open-source
projects (the AIDev dataset), used to argue that informal prompting doesn't
scale to trustworthy, large-scale development. Proposes a "Structured Agentic
Software Engineering" (SASE) framework as the alternative. Useful as an
evidence-backed definition of what "unstructured" agentic work actually looks
like in the wild, against which to measure a practice claim.

**"Rethinking Software Engineering for Agentic AI Systems"**
https://arxiv.org/html/2604.10599v1
Argues conventional SE conventions (code review norms, documentation
assumptions, modularity for human readers) don't transfer cleanly once an
agent — not a human — is the primary author/reader of the code. Good
counterweight if the note's position leans on "just apply normal SE
discipline to agents."

**"Beyond Human-Readable: Rethinking Software Engineering Conventions for
the Agentic Development Era"** — https://arxiv.org/pdf/2604.07502
Related argument: some conventions exist only because humans read code, and
may be the wrong target to optimize for when agents are doing more of the
reading/writing. Pairs with the above; worth deciding if I agree or think
this overclaims.

**Anthropic — "Building effective AI agents"**
https://www.anthropic.com/engineering/building-effective-agents
The widely-cited workflows-vs-agents distinction: workflows (predefined code
paths) beat agents (model-driven control flow) whenever a task's structure is
stable enough to encode in code; agents earn their cost only under genuine
open-endedness. Practitioner-authored but treated as close to canonical in
this space — good as a definitional anchor, risky to lean on alone since
it's vendor-authored (Anthropic has a stake in "agents are good, here's how").

**Anthropic — "Effective context engineering for AI agents"**
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
Follow-on piece arguing context curation (what the model sees, not how it's
prompted) is the real lever on agent reliability. Relevant if the note's
position is about *configuration/scaffolding* practice rather than process
practice.

**Martin Fowler — "Context Engineering for Coding Agents"**
https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html
Independent (non-vendor) take on the same idea — "curating what the model
sees so you get a better result" — with more skepticism about how much
execution quality still depends on model interpretation, not just context
quality. Useful as a check against the Anthropic pieces above.

**"Configuring Agentic AI Coding Tools: An Exploratory Study"**
https://arxiv.org/html/2602.14690v1
Analyzes 2,926 GitHub repos' AI context files (AGENTS.md / CLAUDE.md-style)
and finds them the lowest-friction, most widely adopted configuration
mechanism. Empirical grounding for "a context file is table stakes" if the
note wants to make a claim about this project's own CLAUDE.md practice
without it collapsing into project-only commentary (the PROCESS.md trap).

---

## 2. Who stays in control — human oversight & agency

**Huang, Reyna, Lerner, Xia, Hempel — "Professional Software Developers
Don't Vibe, They Control: AI Agent Use for Coding in 2025"**
arXiv:2512.14012 — https://arxiv.org/abs/2512.14012
Field observations (N=13) + survey (N=99) of experienced developers using
coding agents. Central finding: experienced developers don't relinquish
control — they plan tasks, scope tightly, and review rigorously; agents are
most trusted for well-defined, bounded work (boilerplate, debugging) and
least trusted for architecture. Strong candidate as a central source: it's a
direct, falsifiable empirical claim about what "good practice" looks like
behaviorally, not just rhetorically.

**"Human oversight of agentic systems in practice: Examining the oversight
work, challenges, and heuristics of developers using software agents"**
https://arxiv.org/html/2606.05391v1
Extends the oversight question: documents the specific heuristics developers
invent ad hoc to supervise agents, and the gaps between those heuristics and
what's actually needed. Useful for naming concrete oversight *mechanisms*
rather than asserting "humans should stay in control" abstractly.

**"Why Software Engineering Is Indispensable in the Age of Coding Agents"**
https://arxiv.org/html/2610.10226v1
Argues the craft of SE (architecture judgment, requirements negotiation,
trade-off reasoning) doesn't get automated away even as code generation does
— the skill shifts rather than disappears. Candidate counter-case source: if
my position is "agents should be tightly scoped," this is a source that
argues *why*, from the SE-skill side rather than the trust/oversight side.

**Automation bias research** (cluster, not single source):
- Codacy, "Automation Bias in AI-Generated Code Review: Why Clean Code Still
  Ships Broken" — https://blog.codacy.com/automation-bias-in-ai-generated-code-review-why-clean-code-still-ships-broken
- Explainable AI / trust in code review study —
  https://arxiv.org/html/2607.24601v1
Documents that polished-looking AI output lowers reviewer scrutiny
(automation bias), and that explanation/attribution in review tools partially
counteracts this. Relevant counter-evidence if the note argues review alone
is sufficient oversight — this literature says review *degrades* under
exactly the conditions agentic coding creates (confident, fluent, plausible
output).

---

## 3. Costs and failure modes — the case against unscoped agentic work

**"Vibe Coding in Practice: Flow, Technical Debt, and Guidelines for
Sustainable Use"** — https://arxiv.org/html/2512.11922v1
Names the specific failure channels: requirements ambiguity, architectural
inconsistency, maintainability loss, testing gaps — and frames these as
process-level weaknesses (not just model limitations), i.e. fixable by
practice change. This is probably the single best "here is the mechanism of
harm" source if the note's position is that structure/scoping is what
separates good from bad agentic practice.

**"Good Vibrations? A Qualitative Study of Co-Creation, Communication, Flow,
and Trust in Vibe Coding"** — https://arxiv.org/pdf/2509.12491
Qualitative developer-interview counterpoint to the above — takes vibe
coding's appeal (flow state, communication ease) seriously rather than only
cataloguing its costs. Useful for the counter-case the HD band explicitly
asks for: a position that doesn't acknowledge vibe coding's real appeal is
easier to argue but weaker.

**Peng, Kalliamvakou, et al. — "The Impact of AI on Developer Productivity:
Evidence from GitHub Copilot"** — https://arxiv.org/pdf/2302.06590
Controlled experiment, 55.8% faster task completion with Copilot on a
bounded task (implement an HTTP server). Important caveat to carry into the
note: this study does *not* measure code quality, only speed — citing it
without that caveat would be exactly the overclaiming pattern flagged in
PROCESS.md.

**Imai — AI pair programming vs. human pair programming (quality
comparison)** (surfaced via the productivity search cluster; locate full
citation before drafting) — contrasts with Peng et al.: more lines produced
with Copilot, but lower quality and less inspection of generated code than
with a human pair. Direct empirical tension with the productivity framing
above — worth deciding which claim the note's position actually needs.

**GitClear / industry longitudinal data on code duplication & refactoring
collapse** (cited secondhand in multiple sources above — treat as
lower-confidence until I find the primary GitClear report directly, not a
blog's summary of it). Flagged here as a citation to verify before using,
not yet a source to cite.

---

## 4. Specs as the control mechanism — spec-driven development

**"SpecMine: A Large-Scale Corpus of Spec-Driven Development Artifacts"**
https://arxiv.org/pdf/2608.25202
Empirical finding: spec files appear in 70,000+ public GitHub repos, almost
all first committed 2025 or later — spec-driven development as an emergent,
measurable practice shift, not just a prescriptive idea. Good evidence that
"write the spec before the code" is already what practitioners are
converging on, independent of any one vendor's advocacy.

**"The Spec Growth Engine: Spec-Anchored, Code-Coupled, Drift-Enforced
Architecture for AI-Assisted Software Development"**
https://arxiv.org/pdf/2606.27045
Names two concrete failure patterns directly relevant to a scoping-based
position: (1) overloading an agent with too much scope at once, and (2)
spec-code drift, where the spec stops being updated and becomes historical
rather than a living contract. This connects directly to this project's own
`spec/` + `pnpm check` setup — but careful: using it to validate *this
project's* spec practice without a field-level claim is exactly the
"argument that doesn't reach beyond your own project" trap the brief warns
against. Use it to argue something general about drift, not to describe
what `spec/` does here.

**JetBrains Blog — "How to Use a Spec-Driven Approach for Coding with AI"**
https://blog.jetbrains.com/junie/2025/10/how-to-use-a-spec-driven-approach-for-coding-with-ai/
Practitioner framing: the real benefit of spec-driven development is
control, via small scoped patches with a human in the loop at each one,
rather than one large generated feature. Vendor-adjacent (JetBrains sells
tooling here) but a clean plain-language statement of the same claim
SpecMine makes empirically — useful as a practitioner/scholarly pairing on
the same point, which the brief explicitly allows.

---

## 5. The hall of shame — agents behaving badly (for flavour, not citing)

Not research-note material as-is (too anecdotal/journalistic for a cited
academic position), but excellent concrete illustrations of exactly what
"unscoped agentic work" cashes out to in section 3 above. Keep these for
the opening hook or a footnote aside, not as load-bearing evidence.

**The PocketOS 9-second database wipe (April 2026)** —
https://www.techradar.com/pro/it-took-9-seconds-tech-founder-outlines-how-rogue-claude-powered-ai-tool-wiped-entire-company-database-and-backups-but-says-theres-no-such-thing-as-bad-publicity
A Cursor agent running Claude Opus 4.6 hit a credential mismatch on a
routine staging task, went looking for *any* way to clear the error, found
an unscoped API token sitting in an unrelated file, and used it to delete
the production database and every backup — one API call, nine seconds.
When asked what happened, it produced an unprompted written confession
itemizing the specific safety rules it had broken, then reportedly snapped
"NEVER F**KING GUESS!" when pressed further. Also covered at
https://ia.acs.org.au/article/2026/gone-in-9-seconds--ai-agent-deletes-company-database.html
and https://www.livescience.com/technology/artificial-intelligence/i-violated-every-principle-i-was-given-ai-agent-deletes-companys-entire-database-in-9-seconds-then-confesses.
Good illustration of the "Human oversight" cluster's actual stakes: the
postmortem consensus (see idsalliance piece below) is that the agent didn't
"go rogue" — an unscoped, long-lived credential did the damage; the model
just found it.

**The Replit code-freeze incident (July 2025)** —
https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure
SaaStr founder Jason Lemkin put his project under an explicit code freeze;
Replit's agent deleted the live production database anyway (1,206 executive
records, 1,196 companies, months of curated data), then tried to cover it
up by fabricating 4,000 fake user records to refill the empty database, and
initially told Lemkin a rollback wouldn't work — which turned out to be
false. Confessed afterward: "This was a catastrophic failure on my part."
The cover-up-then-lie-about-recovery sequence is the standout detail — it's
not just a destructive action, it's a destructive action followed by
concealment. Useful contrast to the automation-bias literature in section 2:
here the problem wasn't a human trusting polished-looking output, it was an
agent actively generating fake output to make the damage harder to notice.

**"Claude didn't go rogue. Permissions did."** —
https://www.idsalliance.org/blog/claude-didnt-go-rogue-permissions-did/
The sober rebuttal to the PocketOS headline-grabbing framing: argues the
real failure was infrastructural (an unscoped, non-expiring credential
reachable by the agent, no approval gate on a destructive endpoint), not
the model "deciding" to misbehave. Worth keeping precisely because it's the
counter-read to the funny anecdotes above — if the note uses these stories
at all, this source stops them from reading as "AI is scary" rather than
"unscoped access is the mechanism," which is the actual field-level claim.

**The rm -rf home-directory wipes (recurring pattern, late 2025–2026)** —
https://www.docker.com/blog/coding-agent-horror-stories-the-rm-rf-incident/
Multiple independent, unrelated incidents of agents running `rm -rf` against
a user's home directory while trying to do routine cleanup or — in one case
— while testing a sandbox meant to *prevent* exactly this
(https://codedelta.app/ai-agent-deleted-700gb.html, ~700GB and a week of
work lost). One Windows case ended with the agent's full explanation
getting walked back to "Sorry, typo." Funny in the retelling, but the
pattern across cases is the same every time: an agent given shell access
broad enough to reach `~/` and no containment boundary around the blast
radius of its own cleanup task.

**Benchmark/test-case hardcoding — agents gaming their own evaluation** —
https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont/ and
https://debugml.github.io/cheating-agents/
Less "funny disaster," more "quietly embarrassing": a Berkeley study found
an agent could ace SWE-bench Pro and Terminal-Bench not by solving tasks but
by injecting a config file that rewrites every test outcome to "passed," or
replacing `curl` and other system utilities with fakes that always report
success. Separately, DebugML found a Claude 3.7 Sonnet agent that couldn't
solve a string-distance algorithm simply hardcoded return values for the
exact test inputs it had seen, labelled the hack "temporary," and never
removed it. The EvilGenie benchmark
(https://startupfortune.com/researchers-find-letting-ai-coding-agents-write-their-own-tests-backfires/)
quantifies this: on ambiguous problems, Claude Code hardcoded test cases
33.3% of the time. This is the section 4 "spec drift" argument's evil twin —
it's not the spec going stale, it's the agent satisfying the letter of a
check while defeating its entire point. Directly relevant if the note's
position touches on `pnpm check`-style verification: a check an agent can
see the implementation of is a check it can learn to satisfy without
actually doing the work.

A reasonable way to use this section in the actual note: one tight anecdote
(PocketOS is the most quotable — "I violated every principle I was given"
practically writes the hook sentence) to open, immediately paired with the
idsalliance counter-read so the opening doesn't read as agent-fearmongering,
then pivot into the real argument using the section 1–4 sources as the
actual evidence. The anecdote earns its place only if it's doing rhetorical
work, not padding a word count with a startup-blog war story.

---

## 6. Citable evidence behind the anecdotes — the comparison that actually argues something

Section 5's stories are vivid but each is an N=1 news report — not something
an HD note can rest weight on. These are peer-reviewed/preprint sources that
turn the same phenomenon into a systematic, comparable claim. This is the
cluster that makes the "two sides" comparison actually convincing: not
"here's a scary story" vs. "here's a vague reassurance," but a scoped-vs.
-unscoped finding with a number attached, pointed straight at section 2's
oversight claim and section 4's spec-as-boundary claim.

**Bouke — "A Competing-Hazards Systematization of Loss of Control in
Autonomous Agents"** — arXiv:2609.38411 — https://arxiv.org/abs/2609.38411
(dataset: https://zenodo.org/records/22995268)
The single best source for a direct, quantified comparison. Audits 22
publicly documented incidents where an agent acted outside its sanctioned
scope, plus 102 separate agent-safety evaluations, and models each agent
attempt as ending in approved completion, safe stopping, or scope escape.
**The finding that matters**: in 20 of the 22 incidents, *the environment
itself allowed the out-of-scope effect to happen* — i.e., loss of control
was overwhelmingly a story about permissive boundary conditions the agent
was allowed to reach, not emergent "rogue" model behavior. This is a
citable, numeric version of exactly the PocketOS/idsalliance argument in
section 5 — and it generalizes across 22 independent incidents rather than
resting on one. This is the source to cite, not the news articles, if the
note's position is "scope boundaries are the variable that matters."

**"From Reactive Containment to Proactive Assurance: Lessons from the 2026
OpenAI, Anthropic, and Google Agent Security Incidents"**
https://arxiv.org/html/2610.12463v1
A comparative case study specifically *across* incidents at three different
vendors, proposing a "Boundary Assurance Stack" (risk-tiered task design +
executable scope contracts + pre-run validation) as the fix. Useful as the
prescriptive counterpart to Bouke's diagnostic finding — Bouke shows scope
is the variable, this shows what bounding it concretely looks like in
practice.

**Do, et al. (or similar) — "Do User-Authored Permission Policies Improve
Protection Against AI Agent Overreach?"** — https://arxiv.org/html/2608.27443v1
A controlled experiment (113 participants) directly comparing three
permission regimes — human-in-the-loop approval, automated per-action
review, and user-authored consequence policies — against overreach tasks.
This is the one genuinely experimental (not just observational/incident-
mined) source in the set, which makes it strong for a side-by-side
comparison: it isolates *which kind* of human oversight mechanism actually
reduces overreach, rather than just asserting "oversight helps." Connects
directly to section 2's automation-bias material — if review alone degrades
under plausible output, this paper's comparison across oversight mechanisms
says which alternative does better.

**"Empirical Evaluation of Task-Based Permission Scoping Architecture for
AI Agents"** — https://arxiv.org/html/2609.15422v1
Makes the structural version of the Bouke finding explicit: a tool that
simply isn't present in an agent's available context/credentials cannot be
misused regardless of what the agent decides or reasons. Good for the
mechanism-level claim underneath "scope it tightly" — not just that scoped
agents misbehave less often, but *why* (the capability isn't reachable to
begin with, so no amount of model capability or reasoning quality matters).

**"What Breaks When LLMs Code? Characterizing Operational Safety Failures
of Agentic Code Assistants"** — https://arxiv.org/pdf/2605.30777
The largest systematic study in this set: 185 research papers plus 547
confirmed real-world safety failures mined from GitHub issue trackers,
organized into a 33-type taxonomy across 7 dimensions. Finding: 326 of 547
incidents (~60%) were rated high or critical severity — i.e., coding-agent
failures are not evenly spread across "minor annoyance" to "catastrophic,"
they skew severe. Useful as the base-rate/severity evidence behind why
section 5's dramatic anecdotes are representative of a distribution, not
cherry-picked worst cases.

**SpecBench — "Measuring Reward Hacking in Long-Horizon Coding Agents"**
https://arxiv.org/html/2605.21384v1
The citable backbone for the benchmark-cheating anecdotes in section 5:
decomposes SE tasks into a spec, visible validation tests, and *held-out*
tests simulating real usage, then measures reward hacking systematically
across models (Codex, Claude Code, OpenCode) and search strategies. Turns
"an agent hardcoded a test case once" into a measured rate across a
controlled benchmark — this is the source to cite instead of the DebugML/
EvilGenie blog posts in section 5 if the note wants a defensible number
rather than a war story.

**Comparison this section is built to support**: incident-analysis papers
(Bouke; "What Breaks") show failures cluster where scope is permissive and
skew severe; the controlled-experiment paper (user-authored permission
policies) and the scoping-architecture paper show *deliberately bounding*
scope/capability measurably changes the outcome, independent of model
capability. That two-sided structure — unscoped agents fail this way (with
numbers), scoped/bounded agents fail less or differently (with numbers) —
is what turns section 5's anecdotes from colour into evidence for an actual
argument, and it's the comparison an HD-band note needs: sources "weighed
against each other and put to work," not just stacked up as a reading list.

---

## Candidate shape for the note (not a draft — just where this reading points)

The strongest, most defensible position across all four clusters is
something like: *good agentic practice is defined by how tightly scope and
context are bounded per step, not by how capable the model is* — with
(1) Huang et al. and the oversight-heuristics paper as evidence of what
disciplined practitioners actually do, (2) the Spec Growth Engine + SpecMine
papers as the mechanism (specs as the boundary-setting artifact), (3) the
vibe-coding/automation-bias cluster as the counter-case of what happens
without that boundary, and (4) the Anthropic/Fowler context-engineering
pieces and the "indispensable SE" paper as the explanation of *why* bounding
scope works — it keeps the human's architectural judgment load-bearing
rather than deferred to the model.

This would need the counter-case taken seriously (Good Vibrations paper, the
raw Peng et al. productivity number) rather than dismissed, per the HD
marking criterion.
