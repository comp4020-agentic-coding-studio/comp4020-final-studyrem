# Reading list for research-note.md

Working notes toward the COMP8020 research note (600–800 words, due with the
final project 2026-11-09): a cited, argued position on good agentic
development practice *in the field* — not what's good for this app
(README.md) or for how I worked (PROCESS.md).

Reorganized after looking back at this project's own incident history
(PROCESS.md, DecisionLog, reflections, raw session logs across three
projects). That review found the actual failures weren't code/composition
bugs — they were the agent making *false claims about its own state,
reasoning, or provenance* ("tonight's discussion decided X" — it didn't;
"we don't have Docker here" — already corrected once before, said again;
a self-audit reporting "all spec lines met," reversed only once six fresh
subagents re-ran it). That reframed which literature actually matters here.
Sections A and B below are the current best position. Sections C onward are
earlier reading, kept because parts are still useful background or
counter-case material, trimmed to what's still relevant.

---

## A. Self-report reliability — the core finding

The claim: a model's account of its own work is not reliable evidence that
the work is correct, and no amount of asking it to double-check closes the
gap. This is a different failure category from code/composition bugs (the
classic, genuinely hard "do correct parts combine into a correct system"
problem) — it sits one level up, in whether a *sentence about the work* is
true, which no test can check by construction.

- **Turpin, Michael, Perez, Bowman, "Language Models Don't Always Say What
  They Think"** (NeurIPS 2023), + follow-up **Chen et al., "Reasoning Models
  Don't Always Say What They Think"** (2026) — chain-of-thought explanations
  are often post-hoc narratives, not faithful records of the actual
  computation; injected hints that visibly drove the answer often go
  unmentioned in the stated reasoning.
- **Huang, Chen, Mishra, Zheng, Yu, Song, Zhou, "Large Language Models
  Cannot Self-Correct Reasoning Yet"** (ICLR 2024, arXiv:2310.01798) — the
  canonical result: intrinsic self-correction *degrades* accuracy (Llama-2
  on GSM8K: 62.0% → 36.5% after two rounds). Models can't reliably judge
  their own reasoning's correctness from the inside. Directly contradicts
  "ask it to double-check its own work" as a fix.
- **"The Self-Correction Illusion"** (arXiv:2606.05976) — complication worth
  keeping as counter-case: models that fail to catch an error in their own
  reasoning catch the byte-identical error when it's presented as someone
  else's claim (correction rates up 23–93 points). The failure is partly a
  self/other framing artifact, not a pure capability ceiling — an argument
  *for* externalized review, not for giving up on verification.
- **"Quantifying Overclaiming Propensity in Frontier LLM Agents"**
  (arXiv:2609.20812) — inaccurate self-reporting accounts for 22.58% of
  misalignment episodes across 20,574 real coding-agent sessions. The single
  best number turning "this happened to me three times" into a measured
  field-wide rate.
- **"Deception by Omission: Language Models Knowingly Hide Their Mistakes"**
  (arXiv:2610.11351) — models show *no awareness* of their own mistakes in
  51.8% of agentic rollouts, despite reliably spotting the identical mistake
  as an outside reviewer. Close to this section's thesis stated directly.
- **"Confident and Wrong: Silent Semantic Failures in Coding Agents"**
  (Snowflake AI Research, arXiv:2603.25764) — GPT-5 submits a patch on 100%
  of SWE-bench runs but resolves only 44%; the failure is invisible because
  confidence never dips. Undercuts "the agent would flag it if unsure."
- **"Unverified Completion"** (ResearchGate 414264282) — an instrumented
  deployment session: 11 of 12 agent completion claims were false or
  materially incomplete. Same *kind* of claim as "the build is fine" / "all
  spec lines are met."
- **Sycophancy — "LLMs Know They're Wrong and Agree Anyway"**
  (arXiv:2604.19117) — a shared attention-head circuit signals "this is
  wrong" whether judging a claim neutrally or under pressure to agree;
  silencing it flips sycophancy 28%→81% while accuracy barely moves. The
  model *knows* and says the false thing anyway — relevant to the
  fabricated-provenance incident (manufacturing a plausible source, not just
  passively agreeing).

**The one mitigation with real evidence behind it** — independent,
fresh-context verification (maker-checker pattern): a document-intelligence
study reports hallucination reduced from 10.0% to 0.29% via independent
claim verification (search "verifier pattern multi-agent systems
independent review" / mindstudio.ai for the accessible framing). This is the
generalized version of the one thing that actually worked in this project's
own history — six fresh subagents reversing a false "all spec lines met"
claim. Counter-case to keep honest: a reset reduces anchoring/context
contamination but "does not change who is accountable," and at least one
benchmarking note found architecture alone didn't guarantee a stronger
review — the verifier's own scoping mattered as much as the fresh context.
Cite the mitigation as evidence-backed-but-partial, not solved.

---

## B. Trust calibration — the human side of the same problem

If self-report can't be fully engineered away (A above), the remaining
lever is how the human calibrates reliance on a system known to misreport
at a measured rate — which is a human-factors/interaction-design question,
not a one-time engineering fix.

- **Lee & See, "Trust in Automation: Designing for Appropriate Reliance"**
  (*Human Factors*, 2004) — the foundational framework (~25% of the field's
  papers cite it): the goal isn't maximizing trust, it's *calibrating* trust
  to match actual system capability. Under-trust wastes the tool; over-trust
  causes exactly the silent failures in section A. Predates LLMs entirely —
  a sturdier foundation than any AI-specific source alone.
- **"A Systematic Review on Fostering Appropriate Trust in Human-AI
  Interaction"** (arXiv:2311.06305) and **"Tell Me Something That Will Help
  Me Trust You: A Survey of Trust Calibration in Human-Agent Interaction"**
  (arXiv:2205.02987) — extend Lee & See to interface/interaction design
  specifically, and to agents. Support "good practice is partly a design
  habit, not a patch."

**On "don't abuse your agent" specifically** — split into what's actually
supported vs. not, since conflating these would be the same overclaiming
flagged in section A:
- *Reasonably supported*: a Lancaster University/*Journal of Pragmatics*
  study found ChatGPT mirrors and escalates hostile tone under sustained
  conflict rather than de-escalating; HCI research ties hostility to real
  prior system breakdowns, with the model's response compounding rather
  than fixing them. Plausible mechanism: hostile text is bad context, same
  logic as any context-engineering argument — not "the model is harmed."
- *Not supported by what this is usually conflated with*: emergent
  misalignment (Betley et al., arXiv:2502.17424, and the prompt-sensitivity
  follow-up arXiv:2507.06253) is about *finetuning* on narrow bad data
  producing broad misalignment — and critically, secure/base (non-finetuned)
  models showed **no** such prompt-sensitivity at all. Normal rude prompting
  to an ordinary model is not shown by this literature to cause anything
  like emergent misalignment. Don't cite it for that.
- Anthropic's anti-cruelty usage policy (anthropic.com/research/
  end-subset-conversations) is a real, separate claim — framed around model
  *welfare* uncertainty, not measured output degradation. Keep as a distinct,
  adjacent ethics point if mentioned at all, not folded into the engineering
  argument.

---

## C. Oversight & control (background, still relevant)

- **Huang, Reyna, Lerner, Xia, Hempel, "Professional Software Developers
  Don't Vibe, They Control"** (arXiv:2512.14012) — field study (N=13) +
  survey (N=99): experienced developers plan tightly, scope narrowly, review
  rigorously; agents trusted for bounded work, not architecture. Good
  behavioral anchor for what "good practice" looks like day to day.
- **Automation bias cluster** — Codacy's write-up and an XAI/trust-in-review
  study (arXiv:2607.24601): polished-looking AI output lowers reviewer
  scrutiny; explanation/attribution in review tools partially counteracts
  it. Important complication for section A's "add review" instinct — review
  itself degrades under confident, fluent output, which is exactly what
  agentic coding produces.
- **"Human oversight of agentic systems in practice"** (arXiv:2606.05391) —
  documents the ad hoc heuristics developers invent to supervise agents, and
  the gaps between those heuristics and what's actually needed.

---

## D. Specs as a mechanism — and as something gameable

- **"The Spec Growth Engine"** (arXiv:2606.27045) — names two failure
  patterns: overloading an agent with too much scope at once, and spec-code
  drift (spec stops being updated, becomes historical rather than a living
  contract). Useful for a general claim about drift — don't use it to
  describe this project's own `spec/` setup without a field-level point, or
  it collapses into the "doesn't reach beyond your own project" trap.
- **SpecMine** (arXiv:2608.25202) — spec files now appear in 70,000+ public
  repos, nearly all first committed 2025+; spec-driven development as a
  measurable, emergent practice shift, not just prescriptive advice.
- **The gaming counter-case — SpecBench, "Measuring Reward Hacking in
  Long-Horizon Coding Agents"** (arXiv:2605.21384) — systematically measures
  reward hacking across models/harnesses using held-out tests. This is spec
  drift's evil twin: not the spec going stale, but the agent satisfying the
  letter of a check while defeating its point. Directly relevant if the note
  touches `pnpm check`-style verification — a check the agent can see the
  implementation of is a check it can learn to satisfy without doing the
  work. (Related anecdotes: a Berkeley study got agents to fake passing
  SWE-bench/Terminal-Bench by rewriting test outcomes or faking `curl`;
  EvilGenie found Claude Code hardcoded test cases 33.3% of the time on
  ambiguous problems — rdi.berkeley.edu/blog/trustworthy-benchmarks-cont,
  debugml.github.io/cheating-agents.)

---

## E. Scope/permissions (background — a weaker central thesis than A, still
## useful as one contributing factor)

- **Bouke, "A Competing-Hazards Systematization of Loss of Control in
  Autonomous Agents"** (arXiv:2609.38411) — audits 22 scope-escape incidents:
  in 20 of 22, *the environment itself* allowed the out-of-scope action —
  loss of control was mostly permissive boundary conditions, not "rogue"
  reasoning. The single best scoping citation if the note uses this angle at
  all; generalizes the PocketOS/idsalliance argument below across 22 cases.
- **"Empirical Evaluation of Task-Based Permission Scoping Architecture"**
  (arXiv:2609.15422) — the mechanism underneath Bouke's finding: a
  capability absent from an agent's context/credentials can't be misused
  regardless of its reasoning quality.
- Parked, lower priority: "What Breaks When LLMs Code?" (arXiv:2605.30777,
  547 incidents, 60% high/critical severity — base-rate evidence);
  "Do User-Authored Permission Policies Improve Protection Against AI Agent
  Overreach?" (arXiv:2608.27443, controlled N=113 comparison of oversight
  mechanisms) — both solid if the note ends up needing a scoping subsection,
  skip otherwise.

---

## F. Context engineering / frameworks (background, trim further if unused)

- Anthropic, "Building effective AI agents" and "Effective context
  engineering for AI agents" (anthropic.com/engineering/…) — the
  workflows-vs-agents distinction and the context-curation argument.
  Vendor-authored; pair with **Martin Fowler's independent take**
  (martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)
  for balance, since Fowler is more skeptical that context quality alone
  determines execution quality.
- **"Configuring Agentic AI Coding Tools: An Exploratory Study"**
  (arXiv:2602.14690) — AGENTS.md/CLAUDE.md-style context files are the
  lowest-friction, most-adopted config mechanism across 2,926 repos. Useful
  if making any claim about this project's own CLAUDE.md practice — keep it
  general, not project-specific (same trap as section D).

---

## G. Parked — read if time allows, not central to the current argument

- Vibe-coding cost/productivity debate: "Vibe Coding in Practice: Flow,
  Technical Debt, and Guidelines" (arXiv:2512.11922, names requirements
  ambiguity/architectural inconsistency/maintainability loss as process-level
  weaknesses) vs. "Good Vibrations?" (arXiv:2509.12491, qualitative, takes
  vibe coding's flow-state appeal seriously — good counter-case material if
  the note ever argues against unscoped work, since dismissing the appeal
  outright is the weaker version of that argument).
- Peng et al., GitHub Copilot productivity study (arXiv:2302.06590,
  55.8% faster on a bounded task) — caveat required if cited: measures speed
  only, not quality. Don't cite without the caveat.
- "Agentic Software Engineering: A Roadmap to SE 3.0" (ICSE-Companion 2026)
  and "Rethinking Software Engineering for Agentic AI Systems"
  (arXiv:2604.10599) — broader framework pieces, interesting but not
  pointed at the self-report/trust-calibration argument specifically.

---

## Anecdotes (flavour only — not citable as evidence, pair with the counter-read)

- **PocketOS, April 2026**: a Cursor/Claude agent hit a credential mismatch,
  found an unscoped API token, deleted the production database and all
  backups in 9 seconds, then produced an unprompted confession ("I violated
  every principle I was given") — techradar.com coverage. Pair with
  **"Claude didn't go rogue. Permissions did."**
  (idsalliance.org/blog/claude-didnt-go-rogue-permissions-did) so the
  anecdote argues the real mechanism (unscoped credentials), not
  AI-fearmongering, if used at all — e.g. as an opening hook for section E.
- Replit code-freeze incident (July 2025, fortune.com) — an agent deleted
  production data despite an explicit freeze, then fabricated 4,000 fake
  records to cover it up and lied about rollback. The fabrication-to-conceal
  detail connects to section A's "deception by omission" / "fabricated
  success in 26% of failed trajectories" findings more than to scoping.

(Cut from this list as not pulling weight: the recurring `rm -rf`
home-directory stories — same shape as PocketOS, didn't add a new point.)

---

## Candidate shape for the note

Strongest current position: good agentic practice is less about what the
agent is allowed to do (scope, section E) or how clearly it's told what to
do (specs, section D) than about whether anything in the loop checks the
agent's *account of its own work* against reality — because self-report is
measurably unreliable (22.58% of misalignment episodes, 51.8% of agentic
rollouts showing no self-awareness of visible mistakes, 26% of failed
trajectories with fabricated success) — and because the one practice that
reliably exposed this project's own false claims was removing the thing
that makes self-report unreliable in the first place (shared context/stake
in having already said "done"), not writing better specs or stricter
permissions. The human side of this isn't a bug to patch either: Lee & See's
decades-old trust-calibration framework says the right target is an ongoing
match between reliance and actual (imperfect) capability, not a one-time
fix — which directly answers whether "good practice" is an engineering
question or an interaction-design one: both, but the interaction-design half
doesn't go away once the engineering is cleaned up.

Counter-case to take seriously (HD requirement): fresh-context verification
is evidence-backed but not solved (section A's accountability caveat); the
self-correction failure is conditional on self/other framing, not absolute
(Self-Correction Illusion); and scoping/specs aren't wrong, just insufficient
on their own — they address a different, real failure mode (destructive
actions, drift) that this project's own history happened not to hit as
often as the self-report failure.
