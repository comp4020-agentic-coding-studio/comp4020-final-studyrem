# Commonplace (working title — not locked in yet)

Take Priya. She tried a profile app once — not even a romantic one — and
deleted it inside a week. It wasn't that she had nothing to put on it. It
was that the moment it went live, she was visible to anyone who opened the
link, performing an introduction to people who hadn't shown her anything
back, for as long as the profile stayed up. Being looked at before anyone
had earned it was the cost, not the writing.

She's three weeks into a job in a city where she doesn't know anyone yet,
and the old ways of meeting people haven't been replacing themselves.
University supplied that without trying — a dorm floor, a seminar, the same
five people in the same lab twice a week. A workplace doesn't, and
"so what do you do for fun?" from someone she just met there asks for an
answer before either of them has actually said anything real yet.

So here: Priya adds "co-op games" as a field — not posted, not sent to
anyone, just named. She picked it because showing up to actually do something
with someone has always felt easier than having to produce things to say
about herself first. Nothing happens until someone else has written their
own "co-op games" field. Only then can either of them see what the other
wrote there, and only there. The field does what the hallway used to do —
puts her in the same small, named room as someone else without requiring
either of them to perform an opening line — and neither of them was visible
to the other until both already were.

## What it does

Most profile pages show the same thing to everyone who opens them. This one
doesn't: what you see of someone depends on what you've already chosen to
disclose about yourself. It's built for people who find unscripted small
talk, or the sudden exposure of a typical profile or feed, to be the actual
cost of meeting someone — framed around social anxiety broadly, not as a
clinical claim about any specific diagnosis, which none of us are qualified
to make.

## What good means here

**Nobody is ever exposed to someone else's attention without having opted in
first.** Every design decision below exists to serve that one sentence, not
as an unrelated pile of safety features. The test is Priya's situation above:
would this feature let someone see her, or let her see someone else, before
both had put in the same field themselves? If a feature needs "yes" to work,
that's not a detail to settle in code — see "This project's rules" in
`CLAUDE.md`.

That the rule holds mechanically is enforced and checked (below); whether it
accomplishes what it's for — a connection that doesn't feel like exposure —
is judged, not tested, and admitted as such further down.

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

**Current state (crit 10).** You log in and edit your own profile — add a
field, or remove one. Reaching someone else now works two ways, both
enforcing the rule above server-side:

- **Your profile link** (`/u/<username>`, shown on your own page) shows a
  logged-in visitor only the fields you both hold, and it updates live,
  without a reload, when either of you adds or removes a matching field. The
  whole-profile share link from crit 9 — which showed everything to whoever
  held the link — is gone; this replaces it.
- **Search**, scoped to a field you already hold, surfaces only other people
  who also hold that exact field, and only what they wrote under it.

Adding a field now suggests existing titles as you type, ranked by how many
people already use them, to nudge toward a shared vocabulary. Matching is
case-insensitive — "board games" and "Board Games" are the same field — but
genuinely different wording ("board games" vs. "boardgames") still won't
match unless you pick the suggestion; that's what the nudge is for, not
something the app can fix automatically.

Suggestions (the contextual "someone has a field like yours" mechanism) and a
passive, browsable pool of field titles don't exist yet.

## What shaped this

- Jourard's **"dyadic effect"** (self-disclosure reciprocity) and Altman &
  Taylor's **social penetration theory** — why mutual disclosure
  specifically, not just any field-matching, is the thing doing the work.
  Disclosure that isn't reciprocated stalls connection, and the reciprocity
  norm matters more between strangers than people with existing history —
  which is exactly who this app is for.
- Helen Nissenbaum's **contextual integrity** — privacy isn't secrecy, it's
  information flowing appropriately to its context. The mutual-field gate
  borrows that framing rather than implementing it literally: there's no
  pre-existing norm being matched here, just a new transmission principle —
  a field only flows to someone who already holds it — built in the same
  spirit.
- Festinger, Schachter & Back's **propinquity effect**, and the broader
  research on the adult "friendship recession" — diagnoses why Priya's
  problem isn't a personality trait: losing the unplanned, repeated contact
  (a dorm floor, a seminar) that used to make friendship effortless. This
  app doesn't try to manufacture that repetition; a shared field is a
  different fix for the same gap, not a substitute for it.
- Research framing sustained, visible-by-default self-presentation as its
  own form of emotional labor (dating-app burnout studies) — why the
  mutual-field gate sits in front of content being shown at all, rather than
  acting as a moderation layer after the fact.
- Amber Case / Mark Weiser's **calm technology** — the one shipped piece of
  this already follows it: a field suggestion won't resurface to the same
  person more than once in seven days, so a "no" doesn't turn into nagging.
  The fuller suggestion mechanism (not yet built) is designed to sit at the
  edge of attention the same way.

---
*First draft, written before most of it was built. Expected to be wrong in
places by the next crit — that's what the `/ship` tags are for.*
