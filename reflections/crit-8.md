# Crit 8 reflection

## What was the breakthrough that moved the work forward?

The breakthrough came from doubting a plausible-sounding claim. The agent
flagged the Docker build as unverified — no Docker in the sandbox it built
in, treat it as a risk, test it yourself — and on its own terms that sounded
reasonable. But I'd actually worked through crit7 on the same Fly/Docker
setup, and it shipped fine every week without me ever touching Docker
locally. That mismatch didn't hand me an answer, just a feeling that
something was off. So I asked directly: why did crit7 work without it? That
turned into a real investigation, not a fact-check — neither of us actually
knew yet whether the claim held up. It turned out the agent had already read
the CI config proving the build runs remotely, on GitHub's own runner and on
Fly's builders, and had just never connected that to the warning it gave me.

## What did this work change about who I want to be as a software developer?

What this changed is how I think about my own experience now that I'm
directing agents instead of writing everything myself. I used to think
experience mattered because it let me build things directly. Now I think it
matters more, just differently: experience turns into intuition, and
intuition is what lets me push beyond the boundary of my knowledge — like
following a hunch into the Docker question instead of either accepting the
agent's hedge or needing to already know the answer myself.
