# Commonplace (working title — not locked in yet)

*A profile is a set of fields, each one a title and whatever you choose to
say about it. You see someone else's content in a field only if you've
added that field yourself. There's no feed and no browsing — you reach
someone through a link, or by searching inside a field you already keep.*

## What it does

Most profile pages show the same thing to everyone who opens them. This one
doesn't: what you see of someone depends on what you've already chosen to
disclose about yourself. Add "board games" as a field, and you can now see
what anyone else wrote under "board games" — and only that, and only them.
Nobody is shown to you, and you're shown to nobody, without that reciprocity
existing first.

It's built for people who find unscripted small talk, or the sudden exposure
of a typical profile or feed, to be the actual cost of meeting someone —
framed around social anxiety broadly, not as a clinical claim about any
specific diagnosis, which none of us are qualified to make.

## What good means here

**Nobody is ever exposed to someone else's attention without having opted in
first.** Every design decision below exists to serve that one sentence, not
as an unrelated pile of safety features.

**What's enforced** (checked by `spec/`, not just argued):

- A viewer sees a field's content only if they've added that field
  themselves — the same rule whether they're looking at a profile directly
  or searching inside a field.
- There is no browse page, no feed, no listing of profiles. The only ways in
  are a direct link, or a search scoped to a field you already hold.
- A given field suggestion doesn't resurface to the same person more than
  once in seven days.
- (This week, scaled down to what's actually built: a field you add is still
  there when you come back, including after a restart or redeploy.)

**What's judged, not tested:**

- Whether an anonymous "someone has a field like yours" suggestion actually
  reads as calm rather than unsettling — that's a tone call a test can't
  make.
- Whether reaching someone through a shared topic genuinely feels different
  from being matched or recommended as a person, to someone who came here
  specifically to avoid that feeling. We believe it does. We haven't tested
  it on anyone but ourselves yet.
- Whether framing this around social anxiety, rather than small talk in
  general, honours the audience or just borrows its legitimacy. We're
  watching for the difference.

**Current state (crit 9), and where it falls short of the above.** You now log
in and edit your own profile — add a field, or remove one. You can make a
share link; anyone holding it sees your profile read-only, and it updates live,
without a reload, when you change it. Regenerating the link ends the old one.

That share link shows your **whole** profile to whoever holds it. That breaks
the first enforced rule above — a viewer seeing only the fields they've added
themselves — and it's a deliberate, temporary choice: we built the real-time,
multi-user skeleton first, and the mutual-field rule is the next thing to put
back on top of it, not something we've given up. Until then, the only
protection is that nobody can reach your profile without a link you chose to
make and send. Matching, search and suggestions don't exist yet either.

## What shaped this

- Amber Case / Mark Weiser's **calm technology** — the suggestion mechanism
  (not yet built) is designed to sit at the edge of attention, not demand a
  response.
- Helen Nissenbaum's **contextual integrity** — privacy isn't secrecy, it's
  information flowing only within the context it was disclosed in. The
  mutual-field rule is this, directly implemented.

---
*First draft, written before most of it was built. Expected to be wrong in
places by the next crit — that's what the `/ship` tags are for.*
