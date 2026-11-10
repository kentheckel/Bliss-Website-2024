# ASFC release

Vercel deploys `main` to `antisocialfriendsclub.com`. Build with `npm ci && npm run
build`. The build copies website assets into `public/`; server helpers, tests,
SQL, credentials and local context are excluded. `api/session.js` and root
`middleware.ts` enforce access on Vercel. Do not deploy `public/` to a static-only
host: these decks rely on the server gate.

## Publishing uploaded decks

Commit each deck, its assets, build entry, public access rule, and redirect to
`main` before publishing. A direct CLI upload alone is temporary: the next Git
deployment replaces it with the contents of `main`. The build requires all seven
uploaded decks, and the access tests verify their release copies and public routes.

## Preview and library

Visit `/` to see the maintenance page and sign in, or `/admin/` to open the deck
library after signing in. One password unlocks the site preview and all 17 deck,
report, PDF and PowerPoint links. The library list lives in `admin/decks.js`.
Sign-in creates a seven-day HttpOnly, Secure, SameSite=Lax cookie. Sign out in
the library to remove it. Old individual client-side deck passwords are retired.

The Club América deck at `/clubamerica/` and its assets are public, including
while maintenance is enabled. The deck library and other private decks still
require sign-in.

The Pro Social Playbook at `/spurs2026/` is also public without a password,
including during maintenance. Its standalone HTML lives in `spurs2026/index.html`.

The Charlotte Hornets presentation at `/hornets/` is public without a password,
including during maintenance. Its original standalone HTML lives in `hornets/index.html`.

The University of Utah presentation at `/utah/` is public without a password,
including during maintenance. Its standalone HTML lives in `utah/index.html`.

The All The Smoke October presentation at `/allthesmokeOctober/` is public without
a password, including during maintenance. The original standalone HTML lives in
`allthesmokeOctober/index.html`.

The Texas A&M Athletics presentation at `/texasAM/` is public without a password,
including during maintenance. Its original standalone HTML lives in `texasAM/index.html`.

The Giro d’Italia YouTube partnership presentation at `/giro/` is public without a
password, including during maintenance. Its supplied HTML lives in `giro/index.html`.

These Vercel variables are required in Preview and Production:

- `ASFC_ADMIN_PASSWORD_HASH`: a salted scrypt hash, never the raw password.
- `ASFC_SESSION_SECRET`: at least 32 random characters, used to sign sessions.
- `ASFC_MAINTENANCE`: `true` keeps the whole website behind sign-in. Missing
  configuration fails closed. Set exactly `false` and redeploy to reopen the
  homepage; the admin library and private decks remain protected. Spurs stays
  accessible through its public case study once maintenance is disabled.

The initial generated password is saved only in the operator's ignored
`.context/admin-access.txt`. To rotate it, generate a new salted hash with
`hashPassword()` in `server/access.js`, update the Vercel variable, and redeploy.
Changing either auth secret invalidates existing sessions. Never commit these
values. These controls apply to this deployment; historical Vercel deployments
are unchanged.

## Local development and checks

Put the three variables in ignored `.env.local`, then run `npm run build` and
`npm run dev`. The local server mirrors the route and session policy and only
serves the built output. `PORT` defaults to 5188. Rebuild after static changes.
`npm test` verifies sessions, expiry/tampering/rotation, route protection,
redirect validation, library files, Cam's chart reconciliation and daily counter
progression. See `tests/README.md` for browser checks.

The shared Supabase network counter and its daily cron are installed with the
tracked migration. It remains an estimate at 1M/day. Public clients can read but
cannot update it. See `agency/README.md` for the data source and update procedure.

The contact form is awaiting the owner's manual submission check. No automated
check submits the form or sends email.

## Deck

`/deck` serves the September 2026 agency deck from `deck/`, a copy of the
"ASFC Website Bundle.zip" export from the ASFC Deck Creator project. After
re-extracting a new bundle, run `scripts/optimize-deck-assets.sh` to convert
the images to WebP, the fonts to WOFF2 and re-encode the clips; the raw export
is several times larger than the page needs. Deck assets are the only files
served with a browser cache (one day), set in `middleware.ts` and `vercel.json`.
