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
