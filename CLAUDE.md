# Your harness

Rules for whatever agent is working on this repo, mine to keep or change as
the project moves — drafted after tonight's design discussion, not handed
down from the template.

- **The headline principle comes before the feature.** Before adding anything
  that lets one person see, be notified about, or find another person,
  check it against README.md's stated principle (never exposed to someone's
  attention without opting in first). If a feature needs weakening that
  principle to work, that's a decision to write down in PROCESS.md, not to
  make silently in code.
- **No live-chat pressure.** Real-time (per spec) means propagation latency —
  a change reaching another open session within ~1s — not a reason to add
  typing indicators, read receipts, "online now" badges, or anything else
  that nudges someone toward an immediate response. If that's ever wanted,
  it's my call to make explicitly, not a default to reach for.
- **A dependency earns its place.** Prefer Node's standard library. `marked`
  is in because hand-rolling a markdown renderer under deadline pressure
  isn't a good trade; the next dependency needs the same kind of reason,
  stated in the commit or PROCESS.md, not just added.
- **Commits grow with the work.** Small, named commits as the build
  progresses — not one batched dump at the end. This is read as evidence,
  not just a changelog.
- **Reflections are mine to write, not to generate.** `reflections/*.md`
  is my own account of what happened and what I actually directed, grounded,
  and corrected — draft the structure if useful, but don't invent the
  content of what I supposedly experienced.
- **Keep the schema small.** Start from the smallest data shape that carries
  the current crit's core interaction (see `PROCESS.md`); extend it when a
  real requirement shows up, not ahead of one.
