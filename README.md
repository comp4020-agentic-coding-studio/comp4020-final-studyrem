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

At this stage (crit 8) only the single-profile core and persistence exist —
no matching, search, suggestions, or live updates yet. The feature list, the
real-time layer, and polish are explicitly next, not now.

## What shaped this

- Robin Sloan, ["An app can be a home-cooked meal"](https://www.robinsloan.com/notes/home-cooked-app/) —
  software built for a specific, small, known group of people, not for growth.
- Aral Balkan, ["What is the Small Web?"](https://ar.al/2020/08/07/what-is-the-small-web/) —
  naming what this is reacting against: platforms that grow by watching
  everybody and trusting nobody.
- Amber Case / Mark Weiser's **calm technology** — the suggestion mechanism
  (not yet built) is designed to sit at the edge of attention, not demand a
  response.
- Helen Nissenbaum's **contextual integrity** — privacy isn't secrecy, it's
  information flowing only within the context it was disclosed in. The
  mutual-field rule is this, directly implemented.

---
*First draft, written before most of it was built. Expected to be wrong in
places by the next crit — that's what the `/ship` tags are for.*
