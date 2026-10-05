# Your harness

This file is yours, and it arrives empty on purpose. The rules you hold the
agent to are part of what gets marked, so they should be rules you decided on.

Nothing about the template is recorded here. What the repo ships is explained
where it lives --- `fly.toml`, the `Dockerfile`, the CI workflow and
`spec/README.md` each say what they fix --- and the course website publishes the
[final project brief](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/final-project/).
What the agent needs to carry from any of it is your call.

## My working rules

1. Check the course plugin for updates (`claude plugin update comp4020@comp4020`
   and `comp4020-statusline@comp4020`) before running **start** for a new
   deliverable; restart if it reports an update.
2. Commit locally as you go, but never `git push` / open a PR / touch the
   remote without being asked again in that same turn --- approval doesn't
   carry forward.
3. When the user names the deliverable, summarize that week's spec back to
   them after init work finishes --- what's mechanically checkable vs. judged,
   and the cutoff --- before building starts.
4. Big changes (new feature, restructure, multi-file or content/information-model
   changes) get a written plan and sign-off first; small/mechanical edits don't
   need this.
5. Audits go to a clean subagent, not the main thread: when asked for an audit,
   spin up a fresh subagent with no prior context and have it review from a
   client's/audience's position, not an author's.
6. Don't touch `PROCESS.md` or any `reflections/*.md` file unless I
   explicitly say so --- these are mine to write. If notes or a draft for
   either would help, put them in a separate file instead of writing into
   either of these directly.

## This project's rules

Specific to the mutual-disclosure profile board (see `README.md`), from
tonight's design discussion:

- **The headline principle comes before the feature.** Before adding anything
  that lets one person see, be notified about, or find another person,
  check it against README.md's stated principle (never exposed to someone's
  attention without opting in first). If a feature needs weakening that
  principle to work, that's a decision for me to write down, not to make
  silently in code.
- **No live-chat pressure.** Real-time (per spec) means propagation latency —
  a change reaching another open session within ~1s — not a reason to add
  typing indicators, read receipts, "online now" badges, or anything else
  that nudges someone toward an immediate response, unless I explicitly ask
  for it.
- **A dependency earns its place.** Prefer Node's standard library. `marked`
  is in because hand-rolling a markdown renderer under deadline pressure
  wasn't a good trade; the next one needs the same kind of stated reason.
- **Keep the schema small.** Start from the smallest data shape that carries
  the current crit's core interaction; extend it when a real requirement
  shows up, not ahead of one.
