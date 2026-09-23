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
    { id: "AllTheSmoke", name: "All The Smoke",      logo: "images/channels/AllTheSmoke.png",      subs: "1.33M", since: "225M", story: "analytics/strategy.html?channel=AllTheSmoke&v=20260909release",      watch: "https://www.youtube.com/@allthesmoke" },
    { id: "AllTheSmokeFight", name: "All The Smoke Fight", logo: "images/channels/AllTheSmokeFight.png", subs: "1.93M", since: "61.6M", story: "analytics/strategy.html?channel=AllTheSmokeFight&v=20260909release", watch: "https://www.youtube.com/results?search_query=All+The+Smoke+Fight" },
    { id: "SanAntonioSpurs", name: "San Antonio Spurs",  logo: "images/channels/SanAntonioSpurs.png",  subs: "265k",  since: "139M", deck: "Spurs/ASFC%20Spurs%20Season%20Story%20Deck%20v5%20-%20Presentation%20Mode.html", watch: "https://www.youtube.com/@spurs" },
    { id: "KGCertified", name: "KG Certified",       logo: "images/channels/KGCertified.png",      subs: "260k",  since: "39.9M", story: "analytics/strategy.html?channel=KGCertified&v=20260909release",     watch: "https://www.youtube.com/results?search_query=KG+Certified" },
    { id: "TheLateRun", name: "The Late Run",       logo: "images/channels/TheLateRun.png",       subs: "43.9k", since: "43.4M", story: "analytics/strategy.html?channel=TheLateRun&v=20260909release",      watch: "https://www.youtube.com/results?search_query=The+Late+Run+Ochocinco" },
    { id: "RingChamps", name: "Ring Champs",        logo: "images/channels/RingChamps.png",       subs: "47.7k", since: "32.9M", story: "analytics/strategy.html?channel=RingChamps&v=20260909release",      watch: "https://www.youtube.com/results?search_query=Ring+Champs+AK+Barak" },
    { id: "CamNewton", name: "Cam Newton",         logo: "images/cam.jpg",   subs: "1.57M", watch: "https://youtube.com/@CamNewton" },
    { id: "4thand1", name: "4th&1 w/ Cam Newton", logo: "images/4th.jpg",  subs: "300k",  watch: "https://www.youtube.com/@4thand1CamNewton" },
    { id: "FunkyFriday", name: "Funky Friday",       logo: "images/funky.jpg", subs: "126k",  watch: "https://www.youtube.com/@FunkyFridayCamNewton" },
    { id: "JimGaffigan", name: "Jim Gaffigan",       logo: "images/jim.jpg",   subs: "1.02M", watch: "https://www.youtube.com/@jimgaffigan" },
    { id: "KentHeckel", name: "Kent Heckel",        logo: "images/kent.jpg",  subs: "27k",   watch: "https://www.youtube.com/c/kentheckel" }
];

// ---- App registry ----
const PHONE_APPS = [
    { id: "services", label: "Services", glyph: "▤", accent: "#d5ff4e" },
    { id: "deck",     label: "Deck",       glyph: "📊", accent: "#1649d5" },
    { id: "work",     label: "Channels",   glyph: "📁", accent: "#ffcc33" },
    { id: "products", label: "Products",   glyph: "🧰", accent: "#7db8ff" },
    { id: "team",     label: "Team",       glyph: "👥", accent: "#c9a0ff" },
    { id: "trash", label: "Trash", glyph: "🗑", accent: "#c0c0c0" },
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
    if (id === "deck") { location.assign("deck/"); return; } // the deck is its own full page
    const app = document.getElementById("phone-app");
    const title = document.getElementById("phone-app-title");
    const body = document.getElementById("phone-app-body");
    phoneState.app = id;
    const meta = PHONE_APPS.find(a => a.id === id);
    title.textContent = ({passwords: "Passwords", passwords_note: "passwords.txt", bliss: "bliss.jpg"})[id] || (id === "contact" ? "New Message" : meta ? meta.label : (id === "book" ? "Book a Call" : id === "channel" ? PHONE_CHANNELS[phoneState.channel].name : id === "explore" ? "ASFC Desktop" : ""));

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
    services() {
        return '<iframe class="phone-services-frame services-frame" src="services/index.html?v=20260910" title="ASFC services and ways to work together"></iframe>';
    },
    work() {
        const rows = PHONE_CHANNELS.map(c => `
            <button class="pw-row" data-channel="${c.id}">
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
        // Reuse the folder's actual Studio and document sources on every device.
        const analytics = document.querySelector(`#ModalAnalytics${c.id} iframe`).getAttribute('src');
        const strategy = document.querySelector(`#ModalTextBox${c.id} iframe`).getAttribute('src');
        const strategyLabel = c.id === 'SanAntonioSpurs' ? 'Season story' : 'Strategy';
        return `
            <div class="phone-channel-tabs" role="tablist" aria-label="${esc(c.name)} case file">
                <button id="channel-tab-analytics" role="tab" aria-controls="channel-panel-analytics" aria-selected="true" data-channel-tab="analytics">Analytics</button>
                <button id="channel-tab-strategy" role="tab" aria-controls="channel-panel-strategy" aria-selected="false" tabindex="-1" data-channel-tab="strategy">${strategyLabel}</button>
            </div>
            <div id="channel-panel-analytics" role="tabpanel" aria-labelledby="channel-tab-analytics">
                <div class="phone-channel-links"><a href="${analytics}" target="_blank" rel="noopener">Open full analytics ↗</a><a href="${c.watch}" target="_blank" rel="noopener">YouTube ↗</a></div>
                <iframe class="phone-channel-frame" src="${analytics}" title="${esc(c.name)} analytics"></iframe>
            </div>
            <div id="channel-panel-strategy" role="tabpanel" aria-labelledby="channel-tab-strategy" hidden>
                <a class="phone-channel-full" href="${strategy}" target="_blank" rel="noopener">Open full ${strategyLabel.toLowerCase()} ↗</a>
                <iframe class="phone-channel-frame" loading="lazy" src="${strategy}" title="${esc(c.name)} ${strategyLabel.toLowerCase()}"></iframe>
            </div>`;
    },

    explore() {
        return `<div class="phone-pad"><p class="phone-lede">Make yourself at home. Open a folder, meet the team, or play a game.</p></div><div class="phone-appgrid">${document.getElementById('phone-appgrid').innerHTML}</div>`;
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
                <div class="pp-card">
                    <img src="images/icons/Icon_PodMonitor.svg" alt="PodMonitor">
                    <h3>PodMonitor</h3>
                    <p>The podcast leaderboard for YouTube — weekly and monthly charts, trending videos, and guest research for podcast teams.</p>
                    <a class="phone-cta" href="https://podmonitor.club" target="_blank" rel="noopener noreferrer">Visit podmonitor.club ↗</a>
                </div>
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

    trash() {
        return '<div class="phone-pad"><button class="arcade-phone-trash" data-app="passwords"><span aria-hidden="true">📁</span>Passwords</button><button class="arcade-phone-trash" data-app="bliss"><img src="photos/bliss.jpg" width="60" height="45" alt="">bliss.jpg</button></div>';
    },
    bliss() {
        return '<iframe class="phone-bliss-frame" src="photos/bliss.html" title="Kent at Bliss"></iframe>';
    },
    passwords() {
        return '<div class="phone-pad"><button class="arcade-phone-trash" data-app="passwords_note"><span aria-hidden="true">▤</span>passwords.txt</button></div>';
    },
    passwords_note() {
        return `<div class="phone-pad"><pre class="arcade-phone-note">${esc(ASFCArcade.note)}</pre><button class="arcade-note-button" data-app="games">Open Games ↗</button></div>`;
    },
    games() {
        if (!ASFCArcade.isUnlocked()) return ASFCArcade.gateHTML();
        const games = [
            ["Viral Surfer", "games/viral-surfer/index.html"],
            ["Minesweeper", "games/minesweeper/index.html"],
            ["Hangman", "games/hangman/index.html"],
            ["Pinball", "games/pinball/index.html"]
        ];
        return `
            <div class="phone-pad">
                <button class="arcade-relock" type="button" data-arcade-lock>Lock games</button><p class="phone-lede">Yeah, we built games too. Some play better with a mouse — the full arcade lives on desktop.</p>
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
            openChannelModals(row.dataset.channel);
        });
    });
    // In-app CTAs that jump to another app
    body.querySelectorAll("[data-app]").forEach(btn => {
        btn.addEventListener("click", () => openApp(btn.dataset.app));
    });
    const tabs = [...body.querySelectorAll('[data-channel-tab]')];
    function selectTab(selected) {
        tabs.forEach(tab => {
            const active = tab === selected;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
            document.getElementById('channel-panel-' + tab.dataset.channelTab).hidden = !active;
        });
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(tab));
        tab.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[tabs.length - 1] : tabs[1 - index];
            selectTab(next);
            next.focus();
        });
    });
}

function openPhoneChannel(channelId) {
    const index = PHONE_CHANNELS.findIndex(channel => channel.id === channelId);
    if (index === -1) return;
    phoneState.channel = index;
    openApp('channel');
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
        if (phoneState.app === "bliss") openApp("trash");
        else if (phoneState.viewingChannel) openApp("work");
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
