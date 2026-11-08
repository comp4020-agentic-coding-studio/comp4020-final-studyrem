# User manual

What you can actually do in Commonplace, page by page. For why it works
this way, see `README.md`; for the reasoning behind each choice, see
`DecisionLog.md`.

## Signing up and logging in

Create an account with a username and password at `/`. No email, no
verification step. Logging out invalidates every session for that account
at once (every device, every tab) — there's no per-device logout.

## Your profile (`/me`)

A profile is a list of **fields**: a title (like "Favourite board game")
and whatever you want to say under it. This is the only page where you
manage your own fields.

- **Add a field**: fill in a title and what you want to say, then submit.
  Existing titles are suggested as you type, so independently-invented
  titles ("Favourite game" vs. "favorite games") tend to converge rather
  than silently never matching anyone.
- **Edit a field**: open the "Edit" disclosure under any field to change
  its title or content in place. Renaming a field changes who it's
  mutually visible to — the same rule as adding a new one.
- **Remove a field**: deletes it immediately, no confirmation.
- Changes you make here show up live in any other tab you have open on
  your own profile, no reload needed.
- Your profile's shareable link is shown at the bottom of the page.

## Visiting someone's profile (`/u/<username>`)

Open a link someone's given you. You only ever see the fields you *both*
hold — if you don't have a field they do, it simply isn't shown, not
teased or partially revealed. If they later add or edit a field you can
see, it updates live on your screen without a reload.

Occasionally you'll see a hint suggesting a field title the other person
has that you don't — it never says who gave you the idea, and the same
suggestion won't reappear for a week.

## Search (`/search`)

Find other people through fields you already hold — there's no browse
page or directory, so this and a direct link are the only two ways to
reach someone. Add one or more of your own field titles to the search,
type what you're looking for under each, and submit.

- By default, a result only shows people who match **every** field you
  searched on at once.
- Check "Allow partial matches" to also see people who match *some* of
  them, listed separately from full matches.
- Each result links straight to that person's profile (which independently
  re-checks what you're allowed to see — the search result itself never
  shows more than the matched field's content).

## What's logged, and what isn't

Server logs record that an action happened (who did what, and a field's
*title*) but never a field's *content* or your password. Nobody running
this app can read what you or anyone else actually wrote to each other
from the logs alone.
