# Process overview

This week's work centered on the user story in `README.md` — writing a
concrete protagonist (Priya) to ground the app's headline principle, then
using her to find and fix places where the rest of the README stated
principles without actually earning them. The agent also shipped real
features in parallel (search, mutual-field viewing, the suggestion
mechanism, hardening from an adversarial audit); this account is about the
README/design work, since that's where the week's actual judgment calls
were.

**The citation pattern.** During crit 8, the agent drafted `README.md`
unprompted — I hadn't asked for one yet. Its "What shaped this" section
cited two essays: Robin Sloan's "home-cooked app" and Aral Balkan's "What is
the Small Web?" ([`f8ee50f`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/f8ee50f)).
I cut both days later, judging neither actually argued anything about this
app ([`1ce251c`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/1ce251c))
— at the time, just a bad call, not a pattern.

The pattern surfaced later, when the teaching team shared a one-shot
comparison sample: shitao's `riff8`, built independently with no connection
to mine. Its earliest README cited the identical two essays, at the
identical stage — the very first draft, before any real argument existed.
Two unrelated agents landing on the same pair isn't a coincidence; I only
caught it because I had something independent to compare against.

The earlier version of our own user story read hollow to me, so I asked the
agent to refine and dive deeper into it. During that pass, one of its fixes
overclaimed what a citation actually argued — similar to, though not the
same as, the Sloan/Balkan issue. That resemblance is what made me ask "why"
directly. The answer: both cases are a citation chosen because it fits the
genre the app resembles, not because anyone checked it argued something
specific to this app.

That became a standing rule, not a one-off fix: `CLAUDE.md` now requires any
README citation to connect to this app's actual mechanic, naming
Sloan/Balkan as the precedent ([`1f4ebf3`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-studyrem/commit/1f4ebf3)).

None of this means the agent worked badly — the feature work shipped
cleanly all week, and none of this slowed it down. What it means is that a
citation reading as informed isn't the same as it being checked: "this
sounds like the kind of thing that shapes this kind of app" and "this
specific source argues something this specific app needs" are different
claims, and only asking "why does this keep happening" surfaces which one
actually happened.
