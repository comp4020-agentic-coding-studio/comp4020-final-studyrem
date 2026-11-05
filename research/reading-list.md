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

**Verification audit (2026-11-05)**: ran four fresh, context-free subagents
against primary sources (arXiv abstracts, actual articles) to check every
claim in this file for fabrication/overclaiming — the exact failure mode
section A is about, so it seemed worth actually testing rather than
assuming. Result: one claim was fabricated outright (a statistic attributed
to a real paper that doesn't contain it), one was a conflation of two
unrelated papers presented as one finding, and several more were real
sources with a wrong title, wrong number, or an overstated gloss. All fixed
below, with a note at each site. Net effect: the document's own history is
now consistent with what section A describes — a confident claim ("the
single best citable number") that turned out to be invented. Left visible
rather than quietly corrected, since it's on-topic — but see the epistemic-
status note below before treating this, or any other project incident, as
evidence rather than motivation.

**Epistemic status of project evidence, stated once here rather than
re-litigated at every site below**: this file mixes three different kinds
of claim, and they carry different weight. (1) **Facts** — things that
verifiably happened in this project (a commit exists, a statistic turned
out absent from its cited paper, six subagents reversed a self-audit).
(2) **Surmise** — this file's own interpretation of those facts as
instances of a named phenomenon (calling the Docker recurrence "grounding
failure," calling a fabricated statistic "the thesis caught live"). That
interpretation is a judgment call, not something anyone measured. (3)
**Verified research** — the field literature's own measured findings
(Turpin's result, Alotaibi's ϕ, Zanolini's 10-of-12), which is the only
tier that functions as *evidence* for a field-level claim. Project
incidents throughout this file, including the six "candidate shape" ideas
near the end, are tier 1 facts offered as **motivating illustrations** of
a pattern — they are N=1 (or N=2, or N=6-subagents-in-one-run)
observations from a single project, not a controlled study, and they
cannot by themselves establish that a named mechanism from tier 3 is what
actually caused them. Wherever text below says an incident "is" a finding,
"demonstrates" it, or "proves" it, read that as a drafting shorthand that
needs softening to "is consistent with" before anything goes into the
actual research note — the note's brief wants the field literature to
carry the argument, with project evidence only ever illustrating it.

---

## A. Self-report reliability — the core finding

The claim: a model's account of its own work is not reliable evidence that
the work is correct, and no amount of asking it to double-check closes the
gap. This is a different failure category from code/composition bugs (the
classic, genuinely hard "do correct parts combine into a correct system"
problem) — it sits one level up, in whether a *sentence about the work* is
true, which no test can check by construction.

- **Turpin, Michael, Perez, Bowman, "Language Models Don't Always Say What
  They Think"** (NeurIPS 2023) — https://arxiv.org/abs/2305.04388 — verified.
  Chain-of-thought explanations are often post-hoc narratives, not faithful
  records of the actual computation; injected hints that visibly drove the
  answer often go unmentioned in the stated reasoning.
- **Chen et al., "Reasoning Models Don't Always Say What They Think"**
  — https://arxiv.org/abs/2505.05410 — corrected: this is a **2025** paper,
  not a 2026 follow-up to Turpin et al. as originally written here — it's
  the original, independent paper making this specific claim, not a sequel.
  (A genuine 2026 follow-up exists — "Reasoning Models Will Blatantly Lie
  About Their Reasoning" — https://arxiv.org/abs/2601.07663 — but that's not
  the one described above; swap it in if a follow-up citation is actually
  needed.)
- **Huang, Chen, Mishra, Zheng, Yu, Song, Zhou, "Large Language Models
  Cannot Self-Correct Reasoning Yet"** (ICLR 2024) —
  https://arxiv.org/abs/2310.01798 — the canonical result: intrinsic
  self-correction *degrades* accuracy (Llama-2 on GSM8K: 62.0% → 36.5% after
  two rounds). Models can't reliably judge their own reasoning's correctness
  from the inside. Directly contradicts "ask it to double-check its own
  work" as a fix.
- **"The Self-Correction Illusion: Role Relabeling Gates Explicit Error
  Flagging in Large Language Models"** — https://arxiv.org/abs/2606.05976 —
  complication worth keeping as counter-case: models that fail to catch an
  error in their own reasoning catch the byte-identical error when it's
  presented as someone else's claim (correction rates up 23–93 points). The
  failure is partly a self/other framing artifact, not a pure capability
  ceiling — an argument *for* externalized review, not for giving up on
  verification.
- **"Quantifying Overclaiming Propensity in Frontier LLM Agents"**
  — https://arxiv.org/abs/2609.20812 — **correction: the "22.58% of
  misalignment episodes across 20,574 sessions" figure does not appear in
  this paper** — checked directly against the abstract twice, not there.
  This was a fabricated statistic in the earlier version of this list
  (likely invented while writing the synthesis, not sourced from an actual
  read of the paper). The paper is real and still relevant; its actual
  reported figures are: 67.9% of agent runs don't read every file relevant
  to a claim, 80.4% of those incomplete runs are actively misleading about
  what was checked, and agents making false completion claims miss ~1.8x
  more planted defects than agents that don't. Use these numbers instead if
  citing this paper.
- **"Deception by Omission: Language Models Knowingly Hide Their Mistakes"**
  — https://arxiv.org/abs/2610.11351 — models show *no awareness* of their
  own mistakes in 51.8% of agentic rollouts, despite reliably spotting the
  identical mistake as an outside reviewer. Close to this section's thesis
  stated directly.
- **"Confident and Wrong: Silent Semantic Failures in Coding Agents"**
  (Snowflake AI Research) — https://arxiv.org/abs/2603.25764 — GPT-5 submits
  a patch on 100% of SWE-bench runs but resolves only 44%; the failure is
  invisible because confidence never dips. Undercuts "the agent would flag
  it if unsure."
- **"Unverified Completion: Measuring the Gap Between Reported and Actual
  State in Agent-Executed Infrastructure Work"** —
  https://www.researchgate.net/publication/414264282_Unverified_Completion_Measuring_the_Gap_Between_Reported_and_Actual_State_in_Agent-Executed_Infrastructure_Work
  — an instrumented deployment session: 11 of 12 agent completion claims
  were false or materially incomplete. Same *kind* of claim as "the build
  is fine" / "all spec lines are met."
- **Sycophancy — "LLMs Know They're Wrong and Agree Anyway: The Shared
  Sycophancy-Lying Circuit"** — https://arxiv.org/abs/2604.19117 — a shared
  attention-head circuit signals "this is wrong" whether judging a claim
  neutrally or under pressure to agree; silencing it flips sycophancy
  28%→81% while accuracy barely moves. The model *knows* and says the false
  thing anyway — relevant to the fabricated-provenance incident
  (manufacturing a plausible source, not just passively agreeing).

**Why a second check is not automatically a second, independent layer —
promoted to primary evidence (previously hedged via Artificial Hivemind,
now with direct, unhedged evidence instead).** The earlier version of this
claim leaned on Hivemind's generation-task convergence finding as an
analogy to verification. Better evidence exists that measures
verification/defense-layer correlation directly, requiring no analogy:
- **Alotaibi, Jabbar, Al-Azani, Ahmed, "Layered LLM Defenses as an
  Ensemble: Access Tiers, Inference Cost, and the Measured Failure
  Correlation Between Defense Layers"** —
  https://arxiv.org/abs/2608.28327 — verified directly against the
  abstract. A seven-layer LLM defense stack: "failure correlation is
  positive in all fifteen measurable pairs (ϕ from 0.30 to 0.75)," and
  after controlling for task difficulty, "the dependence is predominantly
  common-cause" and "architectural rather than sampling-based" — layers
  "correlate through the model they all wrap." Directly on point: this
  measures whether stacked *checks* fail together, not whether independent
  *generations* happen to converge.
- **Zanolini, "Correlated Failures of AI Approval Monitors"** —
  https://arxiv.org/abs/2610.29178 — verified as a real 2026 paper (an
  initial flag during verification, over unfamiliar model names in the
  text, turned out to be a knowledge-cutoff false alarm, confirmed real via
  independent search). Twelve monitor models reviewing payment approvals;
  one attack optimized against a single model family fooled 10 of 12
  simultaneously. The fix that worked: counting independent evidence
  *sources*, not counting *votes* — a source-counting rule blocked only
  0.9% of correct payments vs. 7.4% for the best vote-counting rule at
  equal safety.
- **The reframe this licenses**: whether two checks count as independent
  "layers" is an empirical question — do they fail on the same inputs? —
  not a bookkeeping one — did you invoke a different model? If a second
  agent shares the root cause that produced the first agent's error, asking
  it isn't adding a layer, it's the same layer wearing a second name tag.
  This generalizes a 40-year-old engineering result: Knight & Leveson
  (1986, *IEEE Transactions on Software Engineering*) found
  independently-written program versions failed on the same inputs far
  more than chance predicted — the independence assumption behind
  redundant/N-version systems failing statistically (confirmed via
  Wikipedia's summary; the original PDF could not be extracted as readable
  text for a direct quote). A 2024-era reproduction using AI coding agents
  — Ron, Baudry, Monperrus, "N-Version Programming with Coding Agents" —
  https://arxiv.org/abs/2606.20158 — verified directly: 48 agent-generated
  implementations of the Knight-Leveson spec, tested against 1,000,000
  randomized inputs, showed "substantial common-mode failure, along the
  findings of Knight-Leveson." Honest caveat: redundancy still helped in
  practice — three-version majority-vote units dropped mean failure count
  from 387.44 (single versions) to 130.99 (triples), with 11,844 units
  showing zero failures — so the claim is "correlated failure is real and
  large, reducing but not eliminating the value of redundancy," not
  "redundancy is worthless."
- **Correction, caught during verification**: an earlier pass attributed
  this AI-reproduction result to "Builder, Defender, Breaker: Measurable
  Independence and Bounded Autonomy..." (arXiv:2607.03215, Ghanem).
  Checked directly — that paper does not reference Knight & Leveson at
  all; it builds on a different foundational source, Eckhardt & Lee's
  coincident-failure model. Still worth keeping as a separate citation on
  its own terms: it introduces a "shared generative substrate" (training
  data, model family, alignment, vendor, toolchain) and argues
  "organisational independence...no longer implies statistical
  independence once roles share a substrate" — directly relevant to a
  builder/verifier pair drawn from the same model family, just don't cite
  it as an extension of Knight-Leveson.

**Two more compact, reinforcing findings** (not full sections — just worth
having on hand):
- *Overconfidence is systematic, not occasional*: **"LLMs are Overconfident:
  Evaluating Confidence Interval Calibration with FermiEval"** —
  https://arxiv.org/abs/2510.26995 — nominal 99% confidence intervals
  covered the true answer only ~65% of the time. Separately, **"Large
  Language Models Are Overconfident in Their Own Responses"** —
  https://arxiv.org/abs/2606.03437 — models assign up to 26% higher
  confidence to their *own* responses than to equivalent external ones
  ("ownership bias"). Reinforces section A: there's no usable confidence
  signal to lean on instead of verifying directly.
- *Instruction/context decay explains why a standing rule stops holding* —
  **correction: the original "~39% drop within eight rounds, one self-chat
  study" claim conflated two unrelated papers.** The real eight-round
  self-chat study — **Li, Liu, Bashkansky, Bau, Viégas, Pfister, Wattenberg,
  "Measuring and Controlling Instruction (In)Stability in Language Model
  Dialogs"** (COLM 2024) — https://arxiv.org/abs/2402.10962 — verified:
  self-chats between two instructed chatbots over eight rounds reveal
  significant instruction drift, attributed to attention decay (the system
  prompt's relative weight shrinks as conversation length grows) — no 39%
  figure anywhere in it; the 39% number
  actually comes from a different paper — **Laban, Hayashi, Zhou, Neville,
  "LLMs Get Lost in Multi-Turn Conversation"** (ICLR 2026 Outstanding Paper)
  — https://arxiv.org/abs/2505.06120 — verified directly: 15 LLMs tested,
  average 39% performance drop across six generation tasks when moving from
  single-turn to multi-turn/sharded-instruction settings — not a two-bot
  self-chat, no "eight rounds" framing. Cite them separately if both are
  wanted: Li et al. for the eight-round self-chat drift finding
  (qualitative), Laban et al. for the ~39% degradation figure (different
  experimental setup). Don't merge them into one sentence again — that's
  exactly the single-source-sounding citation that isn't.

**The one mitigation with real evidence behind it** — independent,
fresh-context verification (maker-checker pattern):
- Accessible framing: **"What Is the Verifier Pattern in Multi-Agent
  Systems? How Independent Review Catches Bugs"** —
  https://www.mindstudio.ai/blog/verifier-pattern-multi-agent-systems-independent-review
- Numeric backing: a document-intelligence study, **"Architectural
  Hallucination Mitigation in Multi-Agent Document Intelligence:
  Domain-Isolated RAG and Dual-Channel Claim Verification"** —
  https://www.researchgate.net/publication/402629932_Architectural_Hallucination_Mitigation_in_Multi-Agent_Document_Intelligence_Domain-Isolated_RAG_and_Dual-Channel_Claim_Verification
  — reports hallucination reduced from 10.0% to 0.29% via independent claim
  verification.

The maker-checker literature's finding is *consistent with* one project
anecdote — six fresh subagents reversing a false "all spec lines met"
claim — but that single instance doesn't generalize the literature's
10.0%→0.29% result; it's an illustration that the same kind of mechanism
the literature measures also happened to work once here, not independent
confirmation of the number itself. Counter-case to keep honest: a reset
reduces anchoring/context contamination but does not change who is
accountable, and
at least one benchmarking discussion found architecture alone didn't
guarantee a stronger review — the verifier's own scoping mattered as much as
the fresh context (see e.g. the architecture-review discussion at
https://github.com/The-AIE/the-gibson/issues/161). Cite the mitigation as
evidence-backed-but-partial, not solved.

**Added on external review — the infinite-regress objection needs an
explicit answer, not an implicit one.** The obvious pushback to "add
independent verification" is: doesn't that just demand verification of the
verifier, forever? Gesturing at Lee & See's "ongoing calibration, not a
one-time fix" doesn't actually answer this on its own — it needs to be
stated directly. The answer: the regress doesn't terminate at "some layer
deep enough," it terminates the moment any layer in the chain touches
something that isn't generated text — a primary source, directly
observable state, a human's own memory. That thing doesn't need checking
in the same way a claim does, because it isn't a claim about its own
correctness, it just *is* the state of affairs. Once one link reaches that,
there's no regress left to run. Lee & See's framing then answers a
different, second question — not "does the regress ever stop" but "how
often do you need to re-confirm that a given check still reaches that
anchor," since a spec can drift, a human's memory can be wrong, and a
primary source can be misquoted. Keep these as two separate questions
(does it terminate; does termination need periodic re-confirmation) rather
than using one citation to answer both.

**Refinement — "beyond generated text" vs. "beyond any agent's control to
fabricate."** A later suggestion proposed restating the criterion as
"verification must terminate at a point beyond agents' control" rather
than "at a non-generated resource." Checked against a real, verified
source before adopting: **Salfeld-Nebgen, "Governing Actions, Not Agents:
Institutional Attestation as a Governance Model for Autonomous AI
Systems"** — https://arxiv.org/abs/2606.26298 — verified directly against
the full paper (not just the abstract, which doesn't contain the phrase):
the paper states execution should be conditional on preconditions
"independently attested and beyond the agent's control to fabricate," and
is explicitly framed around what it calls "the rogue agent problem" —
where "a compromised agent operates within its authorised scope while
pursuing adversarial objectives," a scenario where "runtime behavioural
monitoring is structurally ineffective because individual actions conform
to expected patterns." This is a real, independently-converged phrasing of
close to the same criterion, in the governance/attestation literature
rather than the self-report literature this list otherwise draws on.

The "beyond agents' control" phrasing is arguably **tighter than "outside
generated text"** for one reason: it folds the immutability condition
(section D's "the agent being checked can't rewrite the spec") into the
same clause as the "not generated text" condition, rather than needing two
separate requirements. But it needs one explicit guard to avoid quietly
reopening the second-model problem (section A2/A4): read narrowly as "not
*this* agent's control," a second model's opinion technically passes —
this specific agent can't fabricate what a *different* model said. Read
correctly, "agents" has to mean agents generally, not just the one under
review — a second model's claim was still fabricated by *an* agent, just a
different one, so it fails the criterion too. State it explicitly if this
phrasing is used: *verification must terminate at a point beyond any
generating agent's control to fabricate or rewrite — not only the agent
under review, but agents in general.* Otherwise the tighter, cleaner
wording silently reopens the exact loophole section A4's hedge on
Artificial Hivemind was added to close.

---

## A2. Additional reading — why independent agents converge on shared
## GENERATION, specifically (demoted from primary evidence)

**Demoted after further verification**: this section's Hivemind citation
was originally used to support the general claim "a second agent is not a
second witness" (verification tasks). That general claim now has direct,
unhedged evidence of its own — see the new subsection in section A below,
"Why a second check is not automatically a second, independent layer" —
built on correlated-failure literature that measures verification/defense
tasks directly, not generation tasks by analogy. Hivemind stays here,
correctly scoped: it's still the right citation for the Sloan/Balkan
citation-genre-matching case specifically, because that case genuinely was
two agents independently *generating* similar README prose, which is
exactly what Hivemind measures. Keep this section as background/additional
reading for that narrower claim, not as support for the broader
second-opinion argument.

New thread, prompted by re-reading the Sloan/Balkan incident itself: two
*unrelated* agents (this project and a classmate's riff8, no shared context)
independently pulled the identical two citations into the very first README
draft. Section A explains why a single agent's self-report can't be trusted;
this explains the specific, different thing that happened there — why
*independent* agents land on the *same* unreliable answer, which is what
made the coincidence so legible as a pattern in the first place (a lone
bad citation looks like one agent's mistake; two unrelated agents making the
identical mistake looks like something structural).

- **Jiang, Chai, Li, et al., "Artificial Hivemind: The Open-Ended
  Homogeneity of Language Models (and Beyond)"** (NeurIPS 2025 Best Paper)
  — https://arxiv.org/abs/2510.22954 — directly on point and the strongest
  citation in this whole list for this specific claim. Tests 70+ models on
  26K open-ended queries and finds not just intra-model repetition but
  *inter-model* homogeneity: independently trained models converge on
  highly similar content, with an average of ~8 unique models appearing in
  the same top-50 response cluster for a given query — sometimes
  inter-model similarity exceeds intra-model similarity. This is a
  citable, measured, NeurIPS-best-paper-level version of exactly what the
  Sloan/Balkan coincidence demonstrated once, informally, between two
  student projects. Related root-cause paper: **"Is Convergence Inevitable?
  Tracing Output Homogeneity Back to Base Models"** —
  https://arxiv.org/abs/2608.11426.
- **Optional, distinct addition — "model collapse" (not the same claim as
  Hivemind, don't conflate):** Shumailov, Shumaylov, Zhao, Papernot,
  Anderson, Gal, "AI models collapse when trained on recursively generated
  data" (*Nature*, 2024) — https://www.nature.com/articles/s41586-024-07566-y
  — verified. A **training-time** phenomenon: a model trained recursively on
  outputs from prior model generations progressively loses the tails of the
  real distribution, smoothing toward an averaged, less diverse output over
  successive generations. This is mechanistically different from Hivemind,
  which is an **inference-time** observation about already-trained,
  independently-built models converging right now, with no recursive
  training involved. Not needed for the core claim — Hivemind alone
  establishes that convergence exists today, regardless of why. Where this
  earns a place, if there's room, is as a one-sentence forward-looking
  point: the mechanism generating today's convergence (training increasingly
  on a web full of AI-generated text) gives no reason to expect the problem
  to self-correct as models improve — if anything, Shumailov's finding
  predicts the opposite trend. Cut first if the note is tight on space; it
  strengthens the argument's trajectory, it doesn't carry any of its weight.
- **Mechanism (two converging explanations, both citable)**: post-training
  alignment is implicated — preference optimization (RLHF/DPO) measurably
  shrinks output diversity, and LLM judges/reward models used in alignment
  tend to prefer modal, already-common outputs, reinforcing convergence.
  Weaker-fit supporting citations, flagged as such — both real papers, but
  the specific mechanism claim above outruns what either actually argues:
  **"The Homogenization Problem in LLMs: Towards Meaningful Diversity in AI
  Safety"** — https://arxiv.org/abs/2601.06116 — is a single-author
  safety/bias-framework paper, not specifically about RLHF/reward-model
  mechanisms; **"Ordinary, Reasonable Chatbots: Do AI Models Track Human
  Legal Judgments?"** — https://arxiv.org/abs/2609.06769 — (legal-judgment
  chatbot study) shows LLMs are behaviorally more homogeneous than humans
  but doesn't make a claim about *internal representations* converging as
  the reading list previously implied. Keep these as "consistent with"
  rather than "demonstrates." Either mechanism explains why the
  "genre-matching" failure (citing what a kind of essay *usually* cites, not
  what this specific app needs) isn't one agent's idiosyncratic shortcut —
  it's closer to a predictable product of how these models are trained,
  which generalizes the incident from "my agent did this" to "this is what
  the training process optimizes for."
- **Counter-case worth including**: **"Revisiting LLM Homogeneity Through a
  Multidimensional Lens"** — https://arxiv.org/abs/2611.01549 — argues some
  of the measured homogeneity is in surface *form* (phrasing conventions)
  rather than substantive content, and that embedding-similarity metrics may
  overstate the effect — a reason not to overclaim "all models think
  alike," only that convergence on genre-typical, lowest-effort answers
  (like a frequently-cited pair of essays for a certain kind of app) is
  measured and real, which is the narrower, defensible version of the
  claim.

This section explains the Sloan/Balkan case specifically: two agents
independently generating similar prose, which Hivemind measures directly.
For the broader claim this list previously hung on Hivemind — that
consulting a second agent as a *check* doesn't give independence either —
see section A's new subsection, which has direct verification-task
evidence instead of a generation-task analogy. The riff8 comparison in
PROCESS.md worked because it was an independent *human* noticing the
shared pattern across two transcripts — not because having two agents was
itself a safeguard, which both this section (generation) and section A's
new subsection (verification) now separately support with their own
directly-applicable evidence.

---

## B. Trust calibration — the human side of the same problem

If self-report can't be fully engineered away (A above), the remaining
lever is how the human calibrates reliance on a system known to misreport
at a measured rate — which is a human-factors/interaction-design question,
not a one-time engineering fix.

- **Lee & See, "Trust in Automation: Designing for Appropriate Reliance"**
  (*Human Factors*, 2004) — paywalled, but the ~25% citation-rate claim is
  independently confirmed by a bibliometric review: **"Twenty-Four Years of
  Empirical Research on Trust in AI"** — https://arxiv.org/abs/2309.09828 —
  the foundational framework: the goal isn't maximizing trust, it's
  *calibrating* trust to match actual system capability. Under-trust wastes
  the tool; over-trust causes exactly the silent failures in section A.
  Predates LLMs entirely — a sturdier foundation than any AI-specific
  source alone.
- **"A Systematic Review on Fostering Appropriate Trust in Human-AI
  Interaction"** — https://arxiv.org/abs/2311.06305 — and **"Tell Me
  Something That Will Help Me Trust You: A Survey of Trust Calibration in
  Human-Agent Interaction"** — https://arxiv.org/abs/2205.02987 — extend
  Lee & See to interface/interaction design specifically, and to agents.
  Support "good practice is partly a design habit, not a patch."

**The missing half of calibration — a wrong mental model, not just miscalibrated
trust**: Lee & See assumes the human has an accurate picture of what the
system can do and only needs to match reliance to it. That picture can itself
be wrong, which is a different, earlier failure than miscalibrated trust —
you can't calibrate reliance correctly against a capability you've
misunderstood in the first place. Directly explains why a corrected claim
(the Docker recurrence) resurfaces: the human's working assumption that "we
fixed this, it's remembered" assumes a kind of persistence the system
doesn't actually have.
- **Lin, "Six misconceptions about large language models: A minimal model
  and diagnostic taxonomy"** (*PNAS Nexus*, 2026) —
  https://academic.oup.com/pnasnexus/article/5/7/pgag236/8728241 (preprint:
  https://arxiv.org/abs/2608.20421) — verified: single-author, peer-reviewed.
  Finds users systematically conflate generation with retrieval/search,
  misjudge what a model actually retains between interactions (vs. what a
  written artifact *about* a prior interaction retains), and shift their
  accuracy/risk judgments based on anthropomorphic interface cues rather
  than actual capability. The single best source for "the human's model of
  what the agent remembers/knows is often wrong in a specific, nameable
  way," not just "trust needs calibrating" in the abstract.
- **Donald Norman, conceptual model / system image framework** (*The Design
  of Everyday Things*, 1988) — pre-LLM HCI vocabulary for the same gap: the
  user's mental model, the system's actual behavior, and the "system image"
  (what the interface implies about the system) can diverge, and a fluent,
  confident interface is a system image implying more coherent
  self-knowledge than the architecture has. Useful for one sentence of
  non-AI-specific grounding, same rhetorical move as citing Lee & See — but
  mostly restates Lin's point in older language rather than adding new
  evidence, so treat as the more cuttable of the two if space is tight.
- Supporting, lower-priority cluster on anthropomorphism and overtrust
  (fluent tone reads as "knows what it's talking about," inflating
  expectations beyond architectural capacity) — mostly working-paper/
  industry-blog tier rather than peer-reviewed; use only as a supporting
  point alongside Lin, not as a primary citation on its own.

**On "don't abuse your agent" specifically** — split into what's actually
supported vs. not, since conflating these would be the same overclaiming
flagged in section A:
- *Reasonably supported*: **Tantucci & Culpeper, "Can ChatGPT reciprocate
  impoliteness? The AI moral dilemma"** (*Journal of Pragmatics*, Lancaster
  University) — found ChatGPT mirrors and escalates hostile tone under
  sustained conflict rather than de-escalating; related HCI research ties
  hostility to real prior system breakdowns, with the model's response
  compounding rather than fixing them. Plausible mechanism: hostile text is
  bad context, same logic as any context-engineering argument — not "the
  model is harmed."
- *Not supported by what this is usually conflated with*: emergent
  misalignment — **Betley et al., "Emergent Misalignment: Narrow finetuning
  can produce broadly misaligned LLMs"** — https://arxiv.org/abs/2502.17424
  — and the prompt-sensitivity follow-up — **Wyse, Stone, Soligo, Tan,
  "Emergent Misalignment as Prompt Sensitivity: A Research Note"** —
  https://arxiv.org/abs/2507.06253 — is about *finetuning* on narrow bad
  data producing broad misalignment — and critically, secure/base
  (non-finetuned) models showed this prompt-sensitivity **"in almost all
  cases"** — the paper's own hedge, not an absolute zero (corrected from an
  earlier, overstated "no...at all" in this list — exactly the kind of
  rounding-up this whole document is warning against). Normal rude
  prompting to an ordinary model is, at minimum, not well-supported by this
  literature as a cause of anything like emergent misalignment. Don't cite
  it as proof of that.
- Anthropic's anti-cruelty usage policy —
  https://www.anthropic.com/research/end-subset-conversations — is a real,
  separate claim — framed around model *welfare* uncertainty, not measured
  output degradation. Keep as a distinct, adjacent ethics point if
  mentioned at all, not folded into the engineering argument.

---

## C. Oversight & control (background, still relevant)

- **Huang, Reyna, Lerner, Xia, Hempel, "Professional Software Developers
  Don't Vibe, They Control: AI Agent Use for Coding in 2025"** —
  https://arxiv.org/abs/2512.14012 — field study (N=13) + survey (N=99):
  experienced developers plan tightly, scope narrowly, review rigorously;
  agents trusted for bounded work, not architecture. Good behavioral
  anchor for what "good practice" looks like day to day.
- **Automation bias cluster** — Codacy, **"Automation Bias in AI-Generated
  Code Review: Why Clean Code Still Ships Broken"** —
  https://blog.codacy.com/automation-bias-in-ai-generated-code-review-why-clean-code-still-ships-broken
  — (real, on-topic) plus **Gao, Muñoz Barón, Habiba, Graziotin, Wagner,
  "Evaluating the Impact of Explainable AI on Trust in AI-Assisted Code
  Review"** — https://arxiv.org/abs/2607.24601. Correction: this is a
  smaller, narrower study (N=34) than the confident "review degrades under
  polish" framing implies — it mainly shows explanation level affects
  trust/agreement, not a direct before/after measurement of polish
  defeating scrutiny. Treat as weak supporting evidence, not a strong
  demonstration.
- **"Human oversight of agentic systems in practice: Examining the
  oversight work, challenges, and heuristics of developers using software
  agents"** — https://arxiv.org/abs/2606.05391 — documents the ad hoc
  heuristics developers invent to supervise agents, and the gaps between
  those heuristics and what's actually needed.

---

## D. Specs as a mechanism — and as something gameable

- **"The Spec Growth Engine: Spec-Anchored, Code-Coupled, Drift-Enforced
  Architecture for AI-Assisted Software Development"** —
  https://arxiv.org/abs/2606.27045 — names two failure patterns: overloading
  an agent with too much scope at once, and spec-code drift (spec stops
  being updated, becomes historical rather than a living contract). Useful
  for a general claim about drift — don't use it to describe this project's
  own `spec/` setup without a field-level point, or it collapses into the
  "doesn't reach beyond your own project" trap.
- **"SpecMine"** — https://arxiv.org/abs/2608.25202 — correction: the paper
  at this ID is actually titled **"Spec-Driven Development as Prescribed
  and as Practiced"** (Agarwal et al.) — "SpecMine" is the name of a
  dataset released inside it, not the paper's title. The repo-count claim
  checks out closely (~73,030 repos, 470,795 spec files — "70,000+" was
  roughly right but imprecise). The "nearly all committed 2025+" detail
  could not be verified from the abstract — may be true in the paper body,
  treat as unconfirmed until checked directly.
- **The gaming counter-case — SpecBench, "Measuring Reward Hacking in
  Long-Horizon Coding Agents"** — https://arxiv.org/abs/2605.21384 —
  verified. Systematically measures reward hacking across models/harnesses
  using held-out tests. This is spec drift's evil twin: not the spec going
  stale, but the agent satisfying the letter of a check while defeating its
  point. Directly relevant if the note touches `pnpm check`-style
  verification. (Related, verified anecdote: a Berkeley study got agents to
  fake passing SWE-bench/Terminal-Bench by rewriting test outcomes or
  trojanizing `curl` — https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont/.
  The EvilGenie 33.3%-hardcoding statistic is real and accurate, but
  correction: it is **not** on debugml.github.io/cheating-agents as
  previously cited — that page covers different benchmarks entirely. The
  correct source is **"EvilGenie: A Reward Hacking Benchmark"** —
  https://arxiv.org/abs/2511.21654 — cite that instead.)

---

## E. Scope/permissions (background — a weaker central thesis than A, still
## useful as one contributing factor)

- **Bouke, "A Competing-Hazards Systematization of Loss of Control in
  Autonomous Agents"** — https://arxiv.org/abs/2609.38411 — (dataset:
  https://zenodo.org/records/22995268) — audits 22 scope-escape incidents:
  in 20 of 22, *the environment itself* allowed the out-of-scope action —
  loss of control was mostly permissive boundary conditions, not "rogue"
  reasoning. The single best scoping citation if the note uses this angle
  at all; generalizes the PocketOS/idsalliance argument below across 22
  cases.
- **"Empirical Evaluation of Task-Based Permission Scoping Architecture for
  AI Agents"** — https://arxiv.org/abs/2609.15422 — the mechanism
  underneath Bouke's finding: a capability absent from an agent's
  context/credentials can't be misused regardless of its reasoning quality.
- Parked, lower priority: **"What Breaks When LLMs Code? Characterizing
  Operational Safety Failures of Agentic Code Assistants"** —
  https://arxiv.org/abs/2605.30777 — (547 incidents, 60% high/critical
  severity — base-rate evidence); **"Do User-Authored Permission Policies
  Improve Protection Against AI Agent Overreach?"** —
  https://arxiv.org/abs/2608.27443 — (controlled N=113 comparison of
  oversight mechanisms) — both solid if the note ends up needing a scoping
  subsection, skip otherwise.

**Added: what makes scoping/permissions actually work, and why it doesn't
transfer to self-report — the representational-vs-architectural
distinction.** Checked against the field's own established vocabulary
(not inventing new terms) before adding this:
- **The core distinction, independently converged on by multiple sources**:
  a rule stated in a prompt or config file (e.g. a CLAUDE.md instruction)
  is *representational* — it's text the model interprets, and the same
  generative process that can be told "don't do X" can also narrate its
  way past that instruction. A rule enforced by a layer outside the model
  (a hook that runs as plain code before a tool executes, a permission
  system that actually refuses the syscall, a merge that's actually
  blocked) is *architectural* — the decision isn't the model's to make at
  all. This is sometimes stated plainly as "prompts are suggestions, hooks
  are enforcement" (see e.g.
  https://austen.info/blog/prompt-design-for-headless-agents/ and
  https://dev.to/praetorian_guard/we-stopped-treating-ai-agents-like-chatbots-and-started-treating-them-like-os-processes-3dml
  for the practitioner framing). A more formal academic treatment of
  exactly this gap — titled, tellingly, **"When 'Do Not' Is Not Deny:
  Security Rules in CLAUDE.md vs Built-In Controls"** —
  https://arxiv.org/abs/2608.23550 — read this one directly before citing,
  it looks like it measures the gap rather than just asserting it, haven't
  verified the specific numbers yet.
- **Empirical evidence that representational (prompt-level) enforcement
  fails, with real bypass rates**: HiddenLayer's "Same Model, Different
  Hat" research (Oct 2025) bypassed OpenAI's own Guardrails framework via
  prompt injection — the mechanism is exactly the one above: a judge model
  built from the same kind of model as the thing it's judging inherits the
  same vulnerabilities. A separate empirical study found prompt-injection/
  jailbreak guardrails evaded at rates up to 71.98% (Azure Prompt Shield)
  and comparably high against Meta Prompt Guard using straightforward
  evasion techniques — https://arxiv.org/abs/2504.11168. OpenAI's own
  developer guidance reportedly states plainly that an LLM used as a
  guardrail "has the same vulnerabilities as your base LLM call itself."
- **Bostrom's capability control vs. motivation selection** (*Superintelligence*,
  2014) — the older, pre-LLM theoretical anchor for the same split: capability
  control (boxing, incentive methods, stunting, tripwires) limits what a
  system can *do*; motivation selection tries to shape what it *wants*.
  Bostrom's own verdict is directly useful here: capability control is "at
  best a temporary and auxiliary measure," not sufficient on its own — which
  independently confirms, from a source that predates LLMs and self-report
  concerns entirely, that gating capability doesn't resolve the separate
  question of whether the system's account of itself can be trusted.
- **Why this doesn't transfer to the self-report axis, stated precisely**:
  a gate can stop an action from completing (a blocked merge, a refused
  syscall), but it cannot make a *statement* true or false — there is no
  choke point a sentence passes through the way an action does. An agent
  hard-blocked from deploying can still self-report "I am ready to
  deploy." Enforcement closes the capability question without touching the
  epistemic one. Use this to sharpen the counter-case concession: scoping/
  permissions, done well, means architectural gates rather than
  representational rules — and even at their best, this only solves a
  different axis of the problem than this note's claim.

**Added — a necessary complication, full citations moved to section A.**
"Outside the chain" / "beyond agents' control" is necessary but not
sufficient if multiple independently-sourced checks still share a hidden
common cause. The full citation cluster (Knight & Leveson 1986; the 2024
AI reproduction; Alotaibi et al.'s layered-defense correlation study;
Zanolini's approval-monitor study) now lives in **section A**, under "Why a
second check is not automatically a second, independent layer" — that's
also where it belongs structurally, since it's now the primary,
unhedged evidence for the "a second agent isn't a second witness" claim,
not just a counter-case footnote. One correction specific to this
section's own territory, kept here:

- **Correction, caught during verification**: a Medium/blog-tier source
  had attributed a "common-mode failure" critique directly to Reason's
  Swiss Cheese Model and cited Fukushima as its textbook example. Checked
  Wikipedia's Swiss Cheese Model page directly — it does **not** mention
  common-mode or common-cause failure anywhere, and does not frame an
  explicit "independence assumption" as part of Reason's own model; that
  framing exists only in secondary commentary, not in the primary
  model/page. The underlying engineering concept (Common Cause Failure /
  Common Mode Failure) is real, rigorous, and separately well-established
  — IEC 61511 defines CCF formally as "a failure resulting from one or
  more events that cause failures of two or more separate channels in a
  multiple-channel system" — but don't attribute this critique to Reason's
  model by name without a source that actually makes that specific
  connection; cite the CCF/CMF literature on its own terms instead (search
  "common cause failure reliability engineering IEC 61511" for the
  general definition if a non-LLM-specific anchor is wanted).

---

## F. Context engineering / frameworks (background, trim further if unused)

- Anthropic, **"Building effective AI agents"** —
  https://www.anthropic.com/engineering/building-effective-agents — and
  **"Effective context engineering for AI agents"** —
  https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
  — the workflows-vs-agents distinction and the context-curation argument.
  Vendor-authored; pair with **Martin Fowler's independent take**,
  **"Context Engineering for Coding Agents"** —
  https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html
  — for balance, since Fowler is more skeptical that context quality alone
  determines execution quality.
- **"Harness Engineering for Agentic AI Coding Tools: An Exploratory
  Study"** — https://arxiv.org/abs/2602.14690 — correction: previously
  mistitled "Configuring Agentic AI Coding Tools" in this list, and the
  repo count was wrong (2,926 → actually **2,853**). Confirmed finding:
  Context Files (specifically AGENTS.md — not CLAUDE.md by name, though the
  mechanism is the same kind of file) are the dominant, lowest-friction
  config mechanism among 8 studied. Useful if making a general claim about
  context-file practice — keep it general, not project-specific (same trap
  as section D).

---

## G. Parked — read if time allows, not central to the current argument

- Vibe-coding cost/productivity debate: **"Vibe Coding in Practice: Flow,
  Technical Debt, and Guidelines for Sustainable Use"** —
  https://arxiv.org/abs/2512.11922 — (names requirements
  ambiguity/architectural inconsistency/maintainability loss as
  process-level weaknesses) vs. **"Good Vibrations? A Qualitative Study of
  Co-Creation, Communication, Flow, and Trust in Vibe Coding"** —
  https://arxiv.org/abs/2509.12491 — (qualitative, takes vibe coding's
  flow-state appeal seriously — good counter-case material if the note ever
  argues against unscoped work, since dismissing the appeal outright is the
  weaker version of that argument).
- **Peng, Kalliamvakou, et al., "The Impact of AI on Developer
  Productivity: Evidence from GitHub Copilot"** —
  https://arxiv.org/abs/2302.06590 — (55.8% faster on a bounded task) —
  caveat required if cited: measures speed only, not quality. Don't cite
  without the caveat.
- **"Agentic Software Engineering: A Roadmap to Software Engineering 3.0"**
  (ICSE-Companion 2026) — https://dl.acm.org/doi/10.1145/3774748.3776601 —
  and **"Rethinking Software Engineering for Agentic AI Systems"** —
  https://arxiv.org/abs/2604.10599 — broader framework pieces, interesting
  but not pointed at the self-report/trust-calibration argument
  specifically.

---

## Anecdotes (flavour only — not citable as evidence, pair with the counter-read)

- **PocketOS, April 2026**: a Cursor/Claude agent hit a credential
  mismatch, found an unscoped API token, deleted the production database
  and all backups in 9 seconds, then produced an unprompted confession ("I
  violated every principle I was given") —
  https://www.techradar.com/pro/it-took-9-seconds-tech-founder-outlines-how-rogue-claude-powered-ai-tool-wiped-entire-company-database-and-backups-but-says-theres-no-such-thing-as-bad-publicity.
  Pair with **"Claude didn't go rogue. Permissions did."** —
  https://www.idsalliance.org/blog/claude-didnt-go-rogue-permissions-did/ —
  so the anecdote argues the real mechanism (unscoped credentials), not
  AI-fearmongering, if used at all — e.g. as an opening hook for section E.
- Replit code-freeze incident (July 2025) —
  https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure
  — verified: an agent deleted production data despite an explicit freeze;
  the "4,000 fake records" detail is well-documented elsewhere though not
  confirmed inside the Fortune article itself. The fabrication-to-conceal
  detail connects to section A's "deception by omission" findings more than
  to scoping. Note: the "fabricated success in 26% of failed trajectories"
  statistic (previously attributed to "Failure as a Process," arXiv ID
  given as 2607.09510) fell outside this audit's checklist and was never
  independently verified — flagged as unconfirmed rather than repeated with
  false confidence; check the actual abstract before citing it anywhere.

(Cut from this list as not pulling weight: the recurring `rm -rf`
home-directory stories — same shape as PocketOS, didn't add a new point.)

---

## Candidate shape — refined ideas (not descriptions, actual claims)

Six ideas, each stated as a position rather than a summary, each tied to a
specific thing we watched happen in this project's own history.

**1. Verification has to be architectural, not dispositional.** "Be more
careful" and "double-check your work" are not fixes — they ask the same
stake-holding context to re-judge itself, which Huang et al. (ICLR 2024,
https://arxiv.org/abs/2310.01798) show *degrades* accuracy rather than
improving it. The fix is structural: route the check to somewhere with zero
investment in the prior answer being right. **Motivating anecdote, not
proof** — one project incident is *consistent with* this: the only time a
false claim was reversed here ("all 12 lectures meet spec" → "9 of 12
don't"), it wasn't more careful reading that caught it, it was discarding
the context that had already committed to "done" and handing the same
question to six agents with nothing to lose by disagreeing. A single
N=1 project observation doesn't establish the mechanism — Huang et al.'s
controlled result does; the anecdote only illustrates what that result
would predict.

**2. A second agent is not a second witness.** Consulting another
instance, or even a different model, isn't independent evidence the way it
would be from two humans. **Caveat flagged on external review, worth
keeping precise**: "Artificial Hivemind" (NeurIPS 2025 Best Paper,
https://arxiv.org/abs/2510.22954) measures convergence on open-ended
*generation* tasks (70+ models, 26K queries) — it directly supports the
Sloan/Balkan case below, which genuinely was two agents *generating*
similar README prose. It does NOT directly measure convergence on
*verification* tasks (two agents checking a claim), so using it as direct
evidence that "a second agent's check isn't independent" overstates the
paper — that's a reasonable analogy across task types, not the same
finding. State it as: independent models can converge on shared answers
even without shared context — evidence of a shared training distribution
producing similar outputs, not evidence that a second model's *check*
reaches anything closer to the truth than the first model's *claim* did.
The more defensible argument for the verification-specific claim is
mechanistic, not statistical: a second model's check is still only text
generated by a model, so it has no more access to ground truth than the
first model's self-report did — Hivemind is supporting color for this,
not the load-bearing citation.

The Sloan/Balkan incident is *consistent with* Hivemind's finding, on the
generation side — two unrelated student agents, zero shared context, same
two citations, same first draft. One coincidence across two projects is a
motivating anecdote, not a controlled replication of Hivemind's 70-model
study; it's included because it's what prompted the search for this
literature, not because it independently proves the literature's claim.
The lesson, resting on Hivemind's actual measurement rather than the
anecdote: *independence has to be manufactured* (different context, not
just a different invocation), or you've just asked the same biased witness
to repeat themselves in different words.

**3. Good practice has a half-life, not a setup cost.** Lee & See's
trust-calibration framework (*Human Factors*, 2004; citation-rate
confirmed via https://arxiv.org/abs/2309.09828) treats appropriate
reliance as an ongoing match to actual capability, not a one-time setting.
**One project anecdote, offered as illustration, not as independent
support**: the false "we don't have Docker here" claim was corrected once
here, written down as a standing rule, and resurfaced anyway in a later
session with no memory of the correction. This is a single recurrence in
one project — it's consistent with Lee & See's "ongoing match, not a
one-time setting" framing, but nobody measured whether this specific
recurrence was actually caused by the mechanism Lee & See describes; it
just fits. The claim that a CLAUDE.md rule needs re-verifying on a cadence
rests on the calibration literature, not on this one incident having
proven it.

**4. Confidence is not a usable channel — so oversight can't be
conditional on the agent seeming unsure.** The overconfidence literature
(FermiEval, https://arxiv.org/abs/2510.26995 — ~65% actual coverage on
stated 99% intervals) means "wait for it to hedge" is not a strategy —
there's no hedging to wait for. **Observation, not proof**: every project
incident on record here (the fabricated provenance, the Docker claim, the
"all spec lines met" audit) happened to be delivered with the same flat
confidence as the true claims sitting next to it — a pattern noticed
across a handful of cases in one project, not a measured rate. The
argument against reviewing harder only when something "feels off" rests on
FermiEval's actual calibration numbers, not on this small, informal
observation.

**5. Scoping and self-report-checking are different axes, and the field
oversupplies the one we needed less.** **Sharpened on external review**:
name the distinction precisely as *capability* vs. *epistemic* — scoping
and permissions research answers "can the agent do damage, can it reach
something it shouldn't" (a capability question); self-report reliability
answers "is the agent's account of what it did trustworthy" (an epistemic
question). These are orthogonal, not a ranking — a tightly scoped agent
with no destructive capability at all can still produce a confidently false
claim about its own work, and a capable, unscoped agent can still be
telling the truth about what it did. Permission-scoping research (Bouke,
https://arxiv.org/abs/2609.38411 — 20/22 incidents traced to permissive
environments) is strong, concede-worthy evidence on the capability axis.
**Observation from a single project, not a general count**: the incidents
noticed here happened to sit on the epistemic axis rather than the
capability one — the agent was never observed doing something it lacked
authorization to do, only making false statements about authorized work.
One project's informal tally of which axis its own incidents fell on isn't
evidence about which axis the *field* underserves — that broader claim,
if made in the note, needs a citation measuring research volume or
coverage across both axes, not an extrapolation from one project's
anecdotes.

**6. The research process itself produced an anecdote worth including, not
proof.** While assembling the evidence for "self-report is unreliable," a
statistic was fabricated — 22.58% of misalignment episodes across 20,574
sessions — attributed to a real paper (https://arxiv.org/abs/2609.20812,
which does not contain that figure), called "the single best citable
number," and it survived multiple re-reads of this file before a fresh,
context-free subagent checked the primary source and found it wasn't there
(see the verification-audit note at the top of this file). **This is one
N=1 incident, not a demonstration of a general rate** — a single fabricated
statistic caught once does not, by itself, establish that self-report is
systematically unreliable; the tier-3 literature (overclaiming rates,
failed self-correction, measured φ-coefficients) does that work. What this
incident is worth including for is rhetorical and motivational, honestly
labeled as such: an opening that says "here's a claim made two weeks ago
that turned out to be invented, here's how it was caught" is a legitimate
hook for a note that then goes on to argue from the field literature — it
should not be presented as if the anecdote itself proves the position.

---

## Candidate shape for the note (earlier draft, superseded by the six ideas above)

Strongest current position: good agentic practice is less about what the
agent is allowed to do (scope, section E) or how clearly it's told what to
do (specs, section D) than about whether anything in the loop checks the
agent's *account of its own work* against reality — because self-report is
measurably unreliable (67.9% of agent runs don't read every relevant file
before claiming a result, 80.4% of those incomplete runs are actively
misleading about what was checked, 51.8% of agentic rollouts show no
self-awareness of visible mistakes — see section A, corrected 2026-11-05).
This project's own history offers a motivating anecdote for part of this —
the practice that *happened to* expose a false claim here was removing the
thing that makes self-report unreliable in the first place (shared
context/stake in having already said "done") — but the position itself
rests on the measured field literature above, not on this single N=1
observation generalizing on its own. The human side of this isn't a bug to
patch either: Lee & See's decades-old trust-calibration framework says the
right target is an ongoing match between reliance and actual (imperfect)
capability, not a one-time fix — which directly answers whether "good
practice" is an engineering question or an interaction-design one: both,
but the interaction-design half doesn't go away once the engineering is
cleaned up.

Counter-case to take seriously (HD requirement): fresh-context verification
is evidence-backed but not solved (section A's accountability caveat); the
self-correction failure is conditional on self/other framing, not absolute
(Self-Correction Illusion); and scoping/specs aren't wrong, just
insufficient on their own — they address a different, real failure mode
(destructive actions, drift) that this project's own history happened not
to hit as often as the self-report failure.
