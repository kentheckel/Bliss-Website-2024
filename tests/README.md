# Client strategy release check

Build and run the authenticated local preview:

```sh
npm ci
npm run build
npm test
npm run dev
```

The local environment needs `ASFC_ADMIN_PASSWORD_HASH`, `ASFC_SESSION_SECRET`,
and `ASFC_MAINTENANCE=true`; see `RELEASE.md`. Never commit `.env.local`.
Run the strategy check with `ASFC_TEST_PASSWORD` set to the shared password:

```sh
node tests/client-strategies.cjs
```

`tests/release-browser.cjs` additionally tests sign-in, all 17 library files,
search, desktop/mobile layouts, deck navigation, reports and logout. It reads
the generated password from `.context/admin-access.txt`. `TEST_BASE_URL`
selects the preview (its default is localhost:5191).

The check uses installed Google Chrome on macOS. Elsewhere, install Playwright's
Chromium with `npx playwright install chromium`,
or set `CHROME_EXECUTABLE` to a browser executable. `TEST_BASE_URL` can override the
local server URL; use a URL ending in `/`.

The check covers all ten stories, portrait and supporting-image loading, removal
of obsolete note links, contact links, keyboard-operated details, layouts at
320/390/440/768px, the actual desktop folder entries, mobile strategy tabs,
minimize/restore and maximize/restore, invalid channel fallback, and preservation
of the landscape Spurs deck. It also checks for page errors and failed requests
for the strategy assets and channel portraits. Contact links are inspected only;
the test does not send messages.

Screenshots are written to `.context/strategy-*.png`. The server must serve the
whole repository, since the client pages use the existing portraits, Cam's
thumbnail example, Studio pages, and Spurs presentation.

## Paint persistence and collaboration

Run `npm run test:paint` after `npm ci`. This starts its own local fixture and
uses Chrome (or `CHROME_EXECUTABLE`, with Playwright Chromium as the fallback).
It exercises the real Paint UI against a controlled shared service, without
changing the public artwork. Coverage includes more than 1,000 saved pixels,
refresh/close/reopen, immediate cross-tab strokes, failed-save recovery,
successive colors on one cell, slow snapshot races, realtime updates, deletes,
and reconnect catch-up.
