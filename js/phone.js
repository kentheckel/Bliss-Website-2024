"use strict";

// ===========================================
// ASFC PHONE OS
// The mobile experience. Boots like a BIOS,
// then presents a phone home screen of "apps"
// that open full-screen. Only active on mobile
// (desktop hides #phone-os via CSS).
// ===========================================

// ---- Where inquiries go (formsubmit forwards to Kent -> chief of staff) ----
const INQUIRY_ENDPOINT = "https://formsubmit.co/kent@kentheckel.com";

// ---- Channel data (mirrors the desktop "Our Work" folder) ----
// story: responsive strategy page | deck: presentation | since: views since we teamed up
const PHONE_CHANNELS = [
    { name: "All The Smoke",      logo: "images/channels/AllTheSmoke.png",      subs: "1.33M", since: "225M", story: "analytics/strategies/AllTheSmokeStrategy.html",      watch: "https://www.youtube.com/@allthesmoke" },
    { name: "All The Smoke Fight", logo: "images/channels/AllTheSmokeFight.png", subs: "1.93M", since: "61.6M", story: "analytics/strategies/AllTheSmokeFightStrategy.html", watch: "https://www.youtube.com/results?search_query=All+The+Smoke+Fight" },
    { name: "San Antonio Spurs",  logo: "images/channels/SanAntonioSpurs.png",  subs: "265k",  since: "139M", deck: "Spurs/ASFC%20Spurs%20Season%20Story%20Deck%20v5%20-%20Presentation%20Mode.html", watch: "https://www.youtube.com/@spurs" },
    { name: "KG Certified",       logo: "images/channels/KGCertified.png",      subs: "260k",  since: "39.9M", story: "analytics/strategies/KGCertifiedStrategy.html",     watch: "https://www.youtube.com/results?search_query=KG+Certified" },
    { name: "The Late Run",       logo: "images/channels/TheLateRun.png",       subs: "43.9k", since: "43.4M", story: "analytics/strategies/TheLateRunStrategy.html",      watch: "https://www.youtube.com/results?search_query=The+Late+Run+Ochocinco" },
    { name: "Ring Champs",        logo: "images/channels/RingChamps.png",       subs: "47.7k", since: "32.9M", story: "analytics/strategies/RingChampsStrategy.html",      watch: "https://www.youtube.com/results?search_query=Ring+Champs+AK+Barak" },
    { name: "Cam Newton",         logo: "images/cam.jpg",   subs: "1.57M", watch: "https://youtube.com/@CamNewton" },
    { name: "4th&1 w/ Cam Newton", logo: "images/4th.jpg",  subs: "300k",  watch: "https://www.youtube.com/@4thand1CamNewton" },
    { name: "Funky Friday",       logo: "images/funky.jpg", subs: "126k",  watch: "https://www.youtube.com/@FunkyFridayCamNewton" },
    { name: "Jim Gaffigan",       logo: "images/jim.jpg",   subs: "1.02M", watch: "https://www.youtube.com/@jimgaffigan" },
    { name: "Kent Heckel",        logo: "images/kent.jpg",  subs: "27k",   watch: "https://www.youtube.com/c/kentheckel" }
];

// ---- App registry ----
const PHONE_APPS = [
    { id: "work",     label: "Our Work",   glyph: "📁", accent: "#ffcc33" },
    { id: "products", label: "Products",   glyph: "🧰", accent: "#7db8ff" },
    { id: "pitch",    label: "Pitch.exe",  glyph: "▶",  accent: "#60a75c" },
    { id: "team",     label: "Team",       glyph: "👥", accent: "#c9a0ff" },
    { id: "games",    label: "Games",      glyph: "🕹️", accent: "#ff8fa3" },
    { id: "contact",  label: "Contact",    glyph: "✉",  accent: "#ff9d5c" }
];

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// ---- Boot sequence ----
const PHONE_BOOT_LINES = [
    "ASFC MOBILE BIOS v2.6",
    "ANTISOCIAL FRIENDS CLUB",
    "",
    "MEMORY CHECK ...... 6.9M SUBSCRIBERS .... OK",
    "CLIENTS ........... CAM NEWTON / SPURS / ALL THE SMOKE .... OK",
    "NETWORK ........... 500M+ VIEWS DELIVERED .... OK",
    "",
    "> WE TURN ATHLETES, TEAMS & CREATORS INTO",
    "  HIGH-VIEWERSHIP, HIGH-REVENUE CHANNELS.",
    "",
    "LOADING ASFC_OS ... READY"
];

function runBoot() {
    const el = document.getElementById("phone-boot-text");
    const skip = document.getElementById("phone-boot-skip");
    if (!el) return;

    let done = false;
    function finish() {
        if (done) return;
        done = true;
        const boot = document.getElementById("phone-boot");
        boot.classList.add("phone-boot-out");
        setTimeout(() => {
            boot.style.display = "none";
            document.getElementById("phone-home").classList.remove("phone-hidden");
        }, 350);
    }

    // Type the lines out
    let li = 0, ci = 0, text = "";
    function tick() {
        if (done) return;
        if (li >= PHONE_BOOT_LINES.length) {
            skip.classList.add("phone-boot-ready");
            setTimeout(finish, 900);
            return;
        }
        const line = PHONE_BOOT_LINES[li];
        if (ci <= line.length) {
            el.textContent = text + line.slice(0, ci) + "▮";
            ci++;
            setTimeout(tick, 12);
        } else {
            text += line + "\n";
            el.textContent = text;
            li++; ci = 0;
            setTimeout(tick, line === "" ? 60 : 130);
        }
    }
    tick();
    skip.addEventListener("click", finish);
    document.getElementById("phone-boot").addEventListener("click", finish);
}

// ---- Home screen ----
function renderHome() {
    const grid = document.getElementById("phone-appgrid");
    if (!grid) return;
    grid.innerHTML = PHONE_APPS.map(a => `
        <button class="phone-appicon" data-app="${a.id}">
            <span class="pa-glyph" style="--accent:${a.accent}">${a.glyph}</span>
            <span class="pa-label">${esc(a.label)}</span>
        </button>`).join("");
}

// ---- App screen open/close ----
function openApp(id) {
    const app = document.getElementById("phone-app");
    const title = document.getElementById("phone-app-title");
    const body = document.getElementById("phone-app-body");
    const meta = PHONE_APPS.find(a => a.id === id);
    title.textContent = meta ? meta.label : (id === "book" ? "Book a Call" : id === "channel" ? "Our Work" : "");

    body.scrollTop = 0;
    body.innerHTML = APP_BODY[id] ? APP_BODY[id]() : "<div class='phone-pad'>Coming soon.</div>";
    app.classList.remove("phone-hidden");
    wireAppBody();
}

function closeApp() {
    document.getElementById("phone-app").classList.add("phone-hidden");
}

// ---- App body builders ----
const APP_BODY = {
    work() {
        const rows = PHONE_CHANNELS.map((c, i) => `
            <button class="pw-row" data-channel="${i}">
                <img src="${c.logo}" alt="${esc(c.name)}" loading="lazy">
                <div class="pw-meta">
                    <div class="pw-name">${esc(c.name)}</div>
                    <div class="pw-sub">${esc(c.subs)} subscribers${c.since ? ` · +${c.since} views with us` : ""}</div>
                </div>
                <span class="pw-arrow">›</span>
            </button>`).join("");
        return `
            <div class="phone-pad">
                <p class="phone-lede">Channels we've built and grown. Tap one to see the story and the numbers.</p>
            </div>
            <div class="pw-list">${rows}</div>
            <div class="phone-pad"><button class="phone-cta" data-app="book">☎  Book a call about your channel</button></div>`;
    },

    channel() {
        const c = PHONE_CHANNELS[phoneState.channel];
        if (!c) return "<div class='phone-pad'>Not found.</div>";
        const statTiles = `
            <div class="pc-stats">
                <div class="pc-stat"><div class="pc-num">${esc(c.subs)}</div><div class="pc-cap">Subscribers</div></div>
                ${c.since ? `<div class="pc-stat"><div class="pc-num">+${esc(c.since)}</div><div class="pc-cap">Views since we teamed up</div></div>` : ""}
            </div>`;
        let storyBlock = "";
        if (c.deck) {
            storyBlock = `<a class="phone-cta" href="${c.deck}" target="_blank" rel="noopener">▶  Open the case-study deck</a>`;
        } else if (c.story) {
            storyBlock = `<iframe class="pc-story" src="${c.story}" title="${esc(c.name)} strategy"></iframe>`;
        }
        return `
            <div class="pc-head">
                <img src="${c.logo}" alt="${esc(c.name)}">
                <div class="pc-title">${esc(c.name)}</div>
            </div>
            ${statTiles}
            <div class="phone-pad">
                ${storyBlock}
                <a class="phone-cta phone-cta-ghost" href="${c.watch}" target="_blank" rel="noopener">Watch on YouTube ↗</a>
            </div>`;
    },

    products() {
        return `
            <div class="phone-pad">
                <p class="phone-lede">Tools we've built in-house for creators and media teams.</p>
                <div class="pp-card">
                    <img src="images/icons/Icon_ChannelTrack.svg" alt="ChannelTrack">
                    <h3>ChannelTrack</h3>
                    <p>Automatically sync YouTube channel data into your Notion workspace — daily stats, growth, and viral detection.</p>
                    <a class="phone-cta" href="https://channeltrack.xyz" target="_blank" rel="noopener">Visit channeltrack.xyz ↗</a>
                </div>
                <div class="pp-card">
                    <img src="images/icons/Icon_Uptides.svg" alt="Uptides">
                    <h3>Uptides</h3>
                    <p>AI-powered trend detection — tells creators exactly what to make and when to post it.</p>
                    <a class="phone-cta" href="https://uptides.ai" target="_blank" rel="noopener">Visit uptides.ai ↗</a>
                </div>
            </div>`;
    },

    pitch() {
        return `
            <div class="phone-pad phone-center">
                <div class="phone-bigglyph">▶</div>
                <h2>The Pitch</h2>
                <p class="phone-lede">Our full deck on why creators and teams win with Antisocial Friends Club.</p>
                <a class="phone-cta" href="pitch/index.html">Open Pitch.exe</a>
            </div>`;
    },

    team() {
        return `
            <div class="phone-pad phone-center">
                <div class="phone-bigglyph">👥</div>
                <h2>The Club</h2>
                <p class="phone-lede">A small, senior team that actually touches your account — no bait-and-switch. Strategy, packaging, editing, and distribution under one roof.</p>
                <button class="phone-cta" data-app="book">☎  Meet us on a call</button>
            </div>`;
    },

    games() {
        const games = [
            ["Viral Surfer", "games/viral-surfer/index.html"],
            ["Minesweeper", "games/minesweeper/index.html"],
            ["Hangman", "games/hangman/index.html"],
            ["Pinball", "games/pinball/index.html"]
        ];
        return `
            <div class="phone-pad">
                <p class="phone-lede">Yeah, we built games too. Some play better with a mouse — the full arcade lives on desktop.</p>
                <div class="pg-list">
                    ${games.map(g => `<a class="pg-row" href="${g[1]}"><span>🕹️ ${esc(g[0])}</span><span class="pw-arrow">›</span></a>`).join("")}
                </div>
            </div>`;
    },

    contact() {
        return inquiryForm("Tell us about your channel or your goals and we'll get back to you fast.");
    },

    book() {
        return inquiryForm("Tell us a bit about your channel and we'll set up a call. This goes straight to our team.");
    }
};

// ---- Shared inquiry form (routes to the team; used by Book a Call + Contact) ----
function inquiryForm(lede) {
    const heard = ["Saw our content (YouTube / TikTok / IG)", "Referral from a friend", "You reached out to me", "Google / search", "Other"];
    const stage = ["Just getting started", "Under 100k subscribers", "100k – 1M subscribers", "1M+ subscribers", "Team, league, or brand"];
    return `
        <div class="phone-pad">
            <h2>Let's talk</h2>
            <p class="phone-lede">${esc(lede)}</p>
            <form class="phone-form" action="${INQUIRY_ENDPOINT}" method="POST">
                <input type="hidden" name="_subject" value="New inquiry from antisocialfriendsclub.com">
                <input type="hidden" name="_captcha" value="false">
                <input type="hidden" name="_template" value="table">
                <label>Your name<input name="name" required placeholder="First & last"></label>
                <label>Email<input type="email" name="email" required placeholder="you@company.com"></label>
                <label>Channel or brand<input name="channel" placeholder="Channel / company name"></label>
                <label>Channel link <span class="pf-opt">(optional)</span><input type="url" name="channel_url" placeholder="https://youtube.com/@..."></label>
                <label>Where are you at?
                    <select name="stage">
                        <option value="">Select…</option>
                        ${stage.map(s => `<option>${s}</option>`).join("")}
                    </select>
                </label>
                <label>What do you need help with?<textarea name="message" rows="4" required placeholder="Tell us about your goals…"></textarea></label>
                <label>How'd you hear about us?
                    <select name="how_heard">
                        <option value="">Select…</option>
                        ${heard.map(h => `<option>${h}</option>`).join("")}
                    </select>
                </label>
                <button type="submit" class="phone-cta">Send it over</button>
                <p class="phone-fineprint">Goes straight to our team — we'll reach out to set up a call.</p>
            </form>
        </div>`;
}

// ---- Wiring ----
const phoneState = { channel: null };

function wireAppBody() {
    const body = document.getElementById("phone-app-body");
    // Channel rows
    body.querySelectorAll(".pw-row").forEach(row => {
        row.addEventListener("click", () => {
            phoneState.channel = parseInt(row.dataset.channel, 10);
            openApp("channel");
        });
    });
    // In-app CTAs that jump to another app
    body.querySelectorAll("[data-app]").forEach(btn => {
        btn.addEventListener("click", () => openApp(btn.dataset.app));
    });
    // Auto-size story iframes to their content (same-origin)
    body.querySelectorAll(".pc-story").forEach(f => {
        f.addEventListener("load", () => {
            try {
                const h = f.contentDocument.body.scrollHeight;
                if (h > 200) f.style.height = h + "px";
            } catch (e) { f.style.height = "1200px"; }
        });
    });
}

function initPhone() {
    if (!document.getElementById("phone-os")) return;
    renderHome();

    // Home app icons + dock
    document.querySelectorAll("#phone-appgrid .phone-appicon, .phone-dock").forEach(el => {
        el.addEventListener("click", () => openApp(el.dataset.app));
    });

    document.getElementById("phone-back").addEventListener("click", () => {
        // From a channel detail, Back returns to the Our Work list; otherwise home
        if (phoneState.viewingChannel) openApp("work");
        else closeApp();
    });
    document.getElementById("phone-home-btn").addEventListener("click", closeApp);

    // Clock
    function tickClock() {
        const c = document.getElementById("phone-clock");
        if (c) {
            const d = new Date();
            c.textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
    }
    tickClock();
    setInterval(tickClock, 1000);

    runBoot();
}

// Track when a channel detail is showing so Back behaves
const _origOpenApp = openApp;
openApp = function (id) {
    phoneState.viewingChannel = (id === "channel");
    _origOpenApp(id);
};

document.addEventListener("DOMContentLoaded", initPhone);
