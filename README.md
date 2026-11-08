# Commonplace (working title — not locked in yet)

Take Priya. She deleted a profile app inside a week — not for lack of
things to say, but because going live made her visible to anyone who
opened the link, performing an introduction to people who'd shown her
nothing back. Being looked at before anyone had earned it was the cost.

Three weeks into a job in a new city, the old ways of meeting people —
a dorm floor, a seminar — haven't been replaced by anything a workplace
supplies for free.

So here: Priya adds "co-op games" as a field, not posted or sent to
anyone, just named. Nothing happens until someone else has written the
same field; only then can either see what the other wrote — doing what the
hallway used to do, without either being visible until both already were.

Built for people who find unscripted small talk, or a typical profile's
sudden exposure, the actual cost of meeting someone — framed around social
anxiety broadly, not a clinical claim.

## What good means here

**Nobody is ever exposed to someone else's attention without having opted
in first.** Every decision below serves that sentence. The test: would
this let Priya be seen, or see someone, before both had put in the same
field? If a feature needs "yes" to work, that's written down, not settled
silently in code — see `CLAUDE.md`.

**Enforced** (checked by `spec/`): a viewer sees content only if they hold
that field themselves; no browse page, feed, or listing — only a direct
link or a search scoped to a field you hold; no suggestion resurfaces more
than once a week.

**Judged, not tested:** whether an anonymous suggestion reads as calm, not
unsettling; whether a shared-topic connection feels different from being
matched as a person (we believe it does, untested beyond ourselves);
whether the social-anxiety framing honours the audience or borrows its
legitimacy.

## What we chose not to build

No feed, no browse page, no "people you might like." We considered it —
showing a profile before you'd shown anything felt like the shortcut a
growing platform reaches for. But person-first discovery means being
matched as a person, the exact unsolicited-attention problem this app
exists to avoid. The only ways in stay direct: a link, or a search scoped
to a field you already hold.

We also don't push a field onto people or let one spread virally through
adoption — not rejected on principle, set aside: we haven't found a
version that stays a hint, not a nudge. What's built surfaces only when
you're already viewing a mutual connection, capped weekly, never telling
them they were shown. Growth was never the point; giving people back what
a dorm floor did for free was.

## What shaped this

- Jourard's **dyadic effect** and Altman & Taylor's **social penetration
  theory**: unreciprocated disclosure stalls connection; reciprocity
  matters most between strangers — who this is for.
- Helen Nissenbaum's **contextual integrity**: privacy as information
  flowing appropriately to context, not secrecy. A field flows only to
  someone who already holds it — same spirit, a new principle.
- Festinger, Schachter & Back's **propinquity effect** — the research
  behind Priya's opening paragraph: losing unplanned, repeated contact,
  not a personality trait.
- Amber Case / Mark Weiser's **calm technology**: the suggestion sits at
  the edge of attention, not demanding a response; the weekly cap is that
  restraint made concrete.

---
*First draft, written before most of it was built. Expected to be wrong in
places by the next crit — that's what the `/ship` tags are for.*
