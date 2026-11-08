# Process overview

This document covers the project end to end — crit 8 through crit 10 and
the work since — not any single week. Feature-by-feature decisions (the
search design, the move to SQLite, the SSE transport, the restyle passes)
are recorded individually in `DecisionLog.md`, with their context,
alternatives, and verification; this document doesn't restate them. What
it covers instead is a single throughline that runs across the whole
project: corrections to the agent's mistakes that got absorbed into
something durable — a rule in `CLAUDE.md`, a standing practice re-applied
— rather than fixed once and left to recur.

**Crit 8 — the Docker claim, fixed by investigation, not a rule.** The
agent flagged the Docker build as unverified — no Docker in its sandbox,
treat it as a risk, test it myself — which sounded reasonable on its own
terms. But I'd run the same Fly/Docker setup the week before and it had
shipped fine without me touching Docker locally. That mismatch didn't
hand me an answer, just a reason to ask why directly
([`reflections/crit-8.md`](reflections/crit-8.md)). It turned out the
agent had already read the CI config proving the build runs remotely, on
GitHub's own runner and on Fly's builders, and had simply never connected
that fact to the warning it gave me. I'm including this case even though
it produced no rule, because it's the exception that the rest of this
document needs on record: not every catch becomes a standing fix, and
this one resolved through one conversation, not a process change.

**Crit 8 — the Sloan/Balkan citations, fixed by a rule.** The agent
drafted `README.md` unprompted during crit 8, citing Robin Sloan's
"home-cooked app" essay and Aral Balkan's "What is the Small Web?" in its
"What shaped this" section
([`f8ee50f`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/f8ee50f)).
I cut both days later, judging neither actually argued anything about
this app
([`1ce251c`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/1ce251c))
— at the time, a bad call, not yet a pattern. It became one when the
teaching team shared a one-shot comparison: a classmate's independently
built `riff8` repo had cited the identical two essays at the identical
stage, with no shared context between the two sessions. Two unrelated
agents landing on the same pair isn't a coincidence; I only caught it
because I had something independent to compare against. That turned into
a standing rule in `CLAUDE.md`, not a one-off fix: any README citation
now has to connect to this app's actual mechanic, naming Sloan/Balkan as
the cited precedent
([`1f4ebf3`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/1f4ebf3)).

**Crit 10 — the adversarial-audit rule, doing real work.** By crit 10,
"send an audit to a fresh, context-free subagent" was already a standing
rule rather than a one-off ask. Run for real against the shipped app —
three subagents with no source access, testing as real and malicious
users — it found one genuine bug: `POST /logout` only cleared the session
cookie client-side, with no server-side revocation, so a captured
pre-logout cookie stayed valid for its full lifetime. Fixed with a
per-user session-version counter that invalidates every outstanding
cookie on logout
([`b1f69e4`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/b1f69e4)).
Worth recording alongside the citation rule: a standing practice is only
worth keeping if it keeps finding things, and here it found a real
security gap that the author's own read of the code had missed.

**Post-crit-10 — the fix needing a fix, then the same pattern recurring
in research.** The citation rule itself turned out to be insufficient:
asking the agent to write a connecting sentence between a citation and
the app's mechanic doesn't prove the connection is real, because a
plausible sentence reads the same whether the connection was checked or
dressed up afterward. The rule was extended again — before a citation is
trusted, run it past a fresh subagent with no README context and see what
it proposes independently; agreement is reassuring, a blank or different
answer is the actual signal
([`011c41d`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/011c41d)).
The same shape then showed up outside the app entirely, while researching
for `research-note.md`: a statistic was fabricated, attributed to a real
paper that didn't contain it, and survived several re-reads before a
fresh-context check against the primary source caught it. And the fix for
that — the fresh-subagent-audit rule itself — produced its own uncaught
case: a subagent proposed a citation (Sandra Petronio's Communication
Privacy Management theory) that read as independently verified, but
turned out not to match this app's actual mechanism once the primary
source was read directly, not just summarized. The lesson carried into
`research/reading-list.md`'s own epistemic-status framework: a
verification step's output is still a claim, not a fact, and needs the
same scrutiny as whatever it was checking.

Across all four cases, the pattern is the same: an agent's output can
read as informed, checked, or secure without actually being so, and the
only way to tell is a human noticing a mismatch and asking why. None of
this was aimed at making the agent stop making mistakes. Stacking on more
agents to check each other isn't a fix either — `research-note.md`'s
argument is that this only helps if the checks can actually fail
differently, and agents sharing the same kind of training tend to fail
the same way on the same input, so a second opinion can just be the first
mistake wearing a different name. What was worth building instead is a
thinking pattern, for the agent and for me, that keeps a mistake's cost
from compounding: Docker needed one investigation and stayed fixed,
because nothing about it was likely to resurface in a new shape; the
citation and research cases kept recurring in new disguises precisely
because "does this source actually argue what it's cited for" has
unlimited surface area — which is why those became standing rules in
`CLAUDE.md` rather than one-off fixes. Progress here isn't fewer
mistakes; it's the same shape of mistake meeting a rule instead of being
rediscovered from nothing each time.
