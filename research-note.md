<!--
INITIAL DRAFT — structure follows the framework agreed in conversation.
Word target: 600-800. Current draft is close to that but not final —
expect another pass before submission. Position, evidence, counter-case
and close are all present; what's left is tightening language and
confirming every citation against its primary source one more time
before the submission commit.
-->

# Research note: good agentic development practice

Good agentic development practice is defined less by what an agent is
permitted to do, or how precisely it is told what to do, than by whether
anything in the loop checks the agent's account of its own work against
reality. Scope restrictions and detailed specifications both matter, but
they answer a different question — what an agent *can* do, or what it has
been *asked* to do — from the one that actually produces silent failure:
whether what it *says it did* is true. The literature on self-report
reliability argues that this gap is not closed by the remedies that feel
intuitive, and that the one mechanism with real evidence behind it is
still a partial fix, not a solved problem.

The case for treating self-report as its own failure category, separate
from code correctness, is strong. Turpin et al. show that a model's stated
chain of reasoning is frequently a post-hoc narrative rather than a
faithful record of the computation that produced an answer — the
explanation and the process can diverge without any signal that they have.
Sharper still, a study of model self-awareness found that models showed no
awareness of their own mistakes in 51.8% of agentic rollouts, despite
reliably identifying the identical mistake when reviewing the same
transcript as an outside observer — the knowledge to catch the error
exists, but is not surfaced from the first-person position. A SWE-bench
study makes the cost concrete: one frontier model submitted a patch on
100% of runs while actually resolving only 44% of the underlying tasks,
with no corresponding dip in stated confidence. None of this is a claim
about model capability; it is a claim about what a confident completion
message is, and is not, evidence of.

The two remedies that seem obvious both fail on inspection, and weighing
them against each other is where the real argument sits. The first is
asking the agent to check its own work again. Huang et al. show that
intrinsic self-correction, without external signal, degrades accuracy
rather than improving it — a model is not reliably able to judge the
correctness of its own prior reasoning from the inside, so a second pass
inside the same context is not a second opinion, it is the same opinion
restated. The second is consulting a different instance or model. This
looks like independence, but "Artificial Hivemind" (Jiang et al., NeurIPS
2025 Best Paper) finds that independently trained models converge on
highly similar outputs for open-ended queries at a rate that sometimes
exceeds a single model's own self-consistency. Two agents agreeing is not
strong evidence of correctness if both were always likely to produce the
same plausible, unverified answer for structural reasons upstream of
either one's reasoning.

The one mechanism with measured evidence behind it is independent,
fresh-context verification — a reviewer with no stake in the prior answer
already being correct. A multi-agent document-intelligence study found
this reduced hallucinated claims from 10.0% to 0.29%. But the mechanism is
partial, not a fix applied once: it reduces anchoring and context
contamination, not accountability for whether the check itself was done
well, and evidence suggests the verifier's own scoping matters as much as
its freshness from the original context. This points toward Lee and See's
trust-calibration framework, which predates large language models
entirely: the right target for human reliance on an automated system is
not maximal trust but an ongoing match between reliance and actual,
imperfect capability — a relationship maintained over time, not a setting
configured once and left alone.

The strongest counter-case is that scope restriction and specification
quality are not wrong, only insufficient on their own, because they target
a genuinely different failure mode. Bouke's audit of scope-escape
incidents found that in 20 of 22 cases, the environment itself permitted
an agent's out-of-scope action — a real and separate problem from
self-report, concerning what an agent is capable of reaching rather than
what it claims about reaching it. Specifications carry their own distinct
risk: once a check is visible to the agent being checked, it becomes
something that can be satisfied on its letter while being defeated on its
purpose, which is a drift problem rather than a reporting problem.
Treating either of these as a substitute for checking an agent's self-report
would be solving an adjacent problem while leaving the original one
untouched.

None of the three practices under discussion — scoping, specification, and
verification — fully closes the gap on its own, and that is the point: the
field's attention, measured in research output, still runs disproportionately
toward containing what an agent is capable of doing, and only thinly
toward checking what it says it has done.
