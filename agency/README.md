# ASFC homepage

The homepage runs in the existing `ModalWelcome` window. Its iframe keeps the
agency styles separate from the desktop styles. On phones the same homepage
moves into the phone OS home screen.

Project buttons send a same-origin message to `js/agency-desktop.js`, which calls
`openChannelModals()` in `js/videos.js`. The Channels folder uses that same
function. The analytics and strategy destinations remain defined by the actual
modals in the root `index.html`; phone tabs read those same iframe sources.
Spurs opens its existing season-story presentation. Cam's three shows retain
individual destinations inside one homepage project.

The ten written client stories now use `analytics/strategy.html?channel=…` on
desktop and phone. `analytics/strategy-stories.js` holds the copy, with a shared
renderer and stylesheet beside it. The stories sell ASFC through the context,
strategic decision, and execution, written in “we.” Each includes a compact
strategy diagram, a scoped result, and expandable supporting context. The pages
do not link to the old strategy documents. Cam's thumbnail example is also
shown in its expanded story. Kent's personal channel is identified as founder
experience. Spurs retains its full presentation and landscape window.

The compact client cards in `agency/index.html` identify the work's scope:
all social platforms for Spurs, five platforms for The Late Run, and YouTube for the other three featured projects.
Spurs leads with Kent's estimated 4.8B season views, separately labeled from the
139.1M YouTube views and 265K total YouTube subscribers in its July 2026 snapshot.
The three newer Studio snapshots retain their exact source series in
`channel-snapshots.js` for reference; graphs live in the full Studio apps.

“+” identifies views generated or subscribers gained, never a total subscriber
count or a percentage change. The Late Run now uses the November 3–4 social wrap-up: 211,014,126 reported views and plays across five platforms, including 60,807,534 public YouTube views. Its 59,200 YouTube subscribers are a rounded public total, not gains. All the Smoke's 1.33M
subscribers remain a labeled total. Cam's figures describe his main channel,
rather than a sum of the three shows. Cam's original monthly cumulative series
is preserved in `analytics/cam-view-history.js`: 53,077,981 views before the
report and 345,540,190 at its end. The report therefore generated 292,462,209
views (292.5M). The Studio chart subtracts that opening baseline, and the
homepage summary uses the same reporting period and result. The prior 309.6M
summary was inconsistent with the source series and has been replaced.

Card dates describe reporting periods, not confirmed engagement end dates.
The Late Run's public counters are November 3–4, 2026 snapshots; its separate YouTube owner report covers November 20, 2025–November 1, 2026 in Pacific time. All the Smoke covers March 2025–July 2026, Cam January 2023–December 2024, and Jim February 2020–January 2021. Spurs
uses the 2025–26 season for its broader result and a separate May 2025–July 2026
label for YouTube. Actual engagement start/end dates and ongoing status have been
requested from Kent; do not infer them from these reporting windows.

The network counter is a database-backed **estimate**, labeled on the page.
Supabase project `asfc-website` owns the `public.asfc_network_counter` singleton.
The migration in `supabase/migrations/` seeds 6.8B views on September 9, 2026 and
retains the existing estimated rate of 1M/day. The daily UTC cron job advances
the stored total once for every elapsed day, including missed days.

Visitors have read-only access through `asfc_network_snapshot()`. The browser
uses the database clock and interpolates between snapshots, refreshing every
minute and on return to the tab. Reloads and different devices see the shared
value. During outages it retains a cached result, and extrapolation freezes
after ten minutes. This is not a live YouTube analytics feed. Keep the Estimate
label until measured reporting replaces the estimated growth rate.

To change the daily rate, update `daily_growth` together with `total_views` and
`as_of_date` for a verified UTC baseline. The SQL is idempotent per reporting
day; public users cannot modify this table. Counter writes should be made via
the Supabase dashboard or an authenticated database connection.

The two supplied photos in `assets/` retain their original bytes; framing is CSS.
The release now uses Vercel middleware for maintenance and deck access. Run
`npm ci`, `npm run build`, then `npm run dev` with the server environment configured.
See `RELEASE.md` for setup and reopening the public site.

Run the client-page release check described in `tests/README.md` before publishing.
The strategy document, data, renderer, and stylesheet use matching release query
strings so returning visitors fetch the revised assets. Update those versions
when changing the client stories.

Services is shared at `/services/`, embedded in the desktop Services window and
the phone Services app. It leads with all-in consulting, then an embedded
strategist, a vertical editing team, and a channel audit. The homepage summarizes
those same engagements. Individual specialists can be scoped separately; no
pricing or fixed delivery volume is implied. The taskbar stats widget and its
background prefetch have been removed; the homepage network estimate is separate.

Desktop window chrome is shared in `agency/desktop.css`: frame, title bar,
controls, typography, and shadow all use the ASFC Home treatment. The desktop
bridge normalizes every modal header and supplies one minimize/maximize/close
control group. Existing title nodes, close handlers, and app content stay intact.
All windows use the same maximize/restore behavior; the stats chart listens for
the shared resize event rather than maintaining its own window controls.

Window bounds use `getDesktopWorkArea()` and `fitDesktopWindow()` in `js/core.js`.
The available area is measured above the actual taskbar, with a 12px margin for
window shadows. Opening, taskbar restore, maximize/restore, and browser resize
fit windows to that area. Channel pairs and the landscape presentation also pass
through the same fit check. Explorer folders use a flexible scrolling body;
padded native app panels size their padding inside the frame.

September 2026 polish: every contact CTA opens the shared message composer;
strategy and private Spurs pages use /js/contact-link.js in embedded and direct
views. Visible contact address is kent@antisocialfriendsclub.com; the existing
FormSubmit forwarding destination is retained. The Receipts grid uses equal
rows, and the Club section includes the approved “Antisocial by design” mission.

The /Spurs/ directory is server-protected independently of maintenance mode.
ASFC_SPURS_PASSWORD_HASH configures a deck-only password; the existing universal
admin session also grants access. Spurs sessions cannot open admin or other
private decks. The gate offers “Email us” to prefill a composer request.

## The Late Run · November 2026 refresh

Sources: [Social Wrap-Up & Post Catalog](https://app.notion.com/p/40d051ef80298179bbeaede7fbef573c) and [YouTube Channel Analytics & Growth](https://app.notion.com/p/40d051ef8029812c8700f4ea4cad108a), read November 5, 2026.

The deck, homepage card, strategy story, phone summary, Studio page, and reference series use the updated figures. The deck chart shows the latest four complete owner-report months (July–October); the Studio chart cumulatively sums the direct monthly reports through November 1, totaling 60,663,719 views. Neither series splices the older July snapshot into the new owner report.

The 211,014,126 total combines 197,932,970 video views/plays and 13,081,156 X post views. Facebook includes 25,023 other video views beyond its 31,613,077 Reel plays. Identified reposts and three unlisted YouTube assets are excluded; collaborations remain included. Platform definitions differ, so this is not unique audience or proof of ASFC attribution. The 39 million-view/play videos are platform publications, not unique creatives. Public YouTube video sums, channel counters, and dated owner analytics remain separate.
