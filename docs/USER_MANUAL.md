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
- Occasionally, near the top of the page, you'll see a hint suggesting a
  field title: someone whose profile you share a field with also holds a
  field you don't. It never says who — just the title — and the same
  suggestion won't reappear for a week. Right now it appears as soon as you
  next load `/me` after an encounter that produces one, which is only this
  way to make it testable; the intended design is for it to surface at a
  server-chosen, less immediate moment rather than deterministically on the
  very next load.
- Your profile's shareable link is shown at the bottom of the page.

## Visiting someone's profile (`/u/<username>`)

Open a link someone's given you. You only ever see the fields you *both*
hold — if you don't have a field they do, it simply isn't shown, not
teased or partially revealed. If they later add or edit a field you can
see, it updates live on your screen without a reload.

## Managing your account (`/me/account`)

Linked next to the logout button. Two things live here, and both require
re-entering your current password first, since either one changes how your
account can be accessed:

- **Change password.**
- **Security questions**, used to recover your account if you forget your
  password — there's no email on file to reset it through otherwise. Pick 3
  different questions from a fixed list and answer each; re-submitting all 3
  later replaces whatever was there before. **An account that's never set
  these up can't be recovered if its password is forgotten** — that
  includes every account created before this feature existed, until it
  opts in here.

Changing your password — directly here, or via a recovery reset below —
logs out every other session on the account at once, the same as a normal
logout.

## Forgetting your password (`/forgot-password`)

Linked from the login page. Enter your username; if that account has
security questions set up, you'll be asked them next, then given a new
password. If it doesn't — or the username doesn't exist at all — you'll see
the exact same generic message either way, so this page can't be used to
check which usernames are registered.

Answers aren't case- or whitespace-sensitive ("Rex" and " rex " both work),
unlike your password, and are never shown back to you once saved — they're
stored the same way your password is, not as plain text.

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

Every logged action is written twice: to stdout (for watching it live —
`flyctl logs -a <app>`) and to a durable `audit_log` table on the same
SQLite volume everything else is stored on, so it survives a machine stop,
restart, or redeploy, not just whatever's still in the terminal.

To read it back:

- **Locally**: `pnpm audit-log` (most recent 50 events). Narrow with
  `--event <name>` (e.g. `--event field_search`) and `--limit <n>`.
- **On the deployed app**: run the same script against the live volume over
  SSH — `fly ssh console -a <app> -C "node scripts/audit-log.ts"`, or add
  flags inside that same quoted command, e.g. `"node scripts/audit-log.ts
  --event field_search --limit 20"`.
