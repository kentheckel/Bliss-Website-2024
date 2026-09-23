"use strict";

// ===========================================
// DESKTOP BIOS BOOT
// A full-screen boot sequence that types out
// who ASFC is, then reveals the desktop. Plays
// once per browser session. Desktop only — the
// phone OS has its own boot (js/phone.js).
// Loaded mid-<body> so it can bail instantly for
// returning visitors (no flash of green).
//
// The same screen is reused by launchDeck(): the
// Deck icon boots "DECK.EXE" and then opens /deck
// as a full page instead of a desktop window.
// ===========================================

(function () {
    var boot = document.getElementById("boot-screen");
    if (!boot) return;

    var el = document.getElementById("boot-screen-text");
    var skip = document.getElementById("boot-screen-skip");
    var isPhone = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

    // Types LINES onto the boot screen, then calls onDone. Any key or click skips ahead.
    function play(LINES, onDone) {
        var done = false;
        boot.style.display = "";
        boot.classList.remove("boot-out");
        skip.classList.remove("boot-ready");
        el.textContent = "";

        function finish() {
            if (done) return;
            done = true;
            document.removeEventListener("keydown", onKey, true);
            boot.removeEventListener("click", finish);
            onDone();
        }
        function onKey() { finish(); }

        // Typewriter
        var li = 0, ci = 0, text = "";
        function tick() {
            if (done) return;
            if (li >= LINES.length) {
                skip.classList.add("boot-ready");
                setTimeout(finish, 1100);
                return;
            }
            var line = LINES[li];
            if (ci <= line.length) {
                el.textContent = text + line.slice(0, ci) + "█";
                ci++;
                setTimeout(tick, 9);
            } else {
                text += line + "\n";
                el.textContent = text;
                li++; ci = 0;
                setTimeout(tick, line === "" ? 55 : 120);
            }
        }

        tick();
        document.addEventListener("keydown", onKey, true);
        boot.addEventListener("click", finish);
    }

    function hide() {
        boot.classList.add("boot-out");
        setTimeout(function () { boot.style.display = "none"; }, 420);
    }

    // ---- Deck launch ----
    var DECK_URL = "deck/";
    var DECK_LINES = [
        "ANTISOCIAL FRIENDS CLUB — BIOS v9.5",
        "",
        "Loading DECK.EXE ............. OK",
        "Slides ....................... 13 FOUND",
        "Footage ...................... SPURS / KABU / ALL THE SMOKE ... OK",
        "",
        "> STRATEGY FROM THE FIRST IDEA TO THE NEXT UPLOAD.",
        "",
        "Starting presentation ........ READY"
    ];
    // Fetched while the BIOS types so the deck opens with its fonts and first-slide photos already cached.
    var DECK_WARMUP = [
        DECK_URL,
        "deck/assets/fonts/font-1.woff2", "deck/assets/fonts/font-3.woff2", "deck/assets/fonts/font-4.woff2",
        "deck/assets/fonts/font-5.woff2", "deck/assets/fonts/font-6.woff2", "deck/assets/fonts/vt323.woff2",
        "deck/assets/images/bliss-wallpaper.webp", "deck/assets/images/bliss.webp",
        "deck/assets/images/cam-fourth-and-one.webp", "deck/assets/images/spursreseason.webp",
        "deck/assets/images/allthesmokeBTS.webp", "deck/assets/images/spurs.webp"
    ];

    window.launchDeck = function () {
        if (isPhone) { location.assign(DECK_URL); return; }
        DECK_WARMUP.forEach(function (href) {
            var link = document.createElement("link");
            link.rel = "prefetch";
            link.href = href;
            if (/\.woff2$/.test(href)) link.crossOrigin = "anonymous"; // fonts are always fetched CORS-style
            document.head.appendChild(link);
        });
        play(DECK_LINES, function () { location.assign(DECK_URL); });
    };

    // ---- Startup boot ----
    // Mobile has its own boot inside the phone OS
    if (isPhone) {
        boot.style.display = "none";
        return;
    }

    // Only once per session — returning within the session skips straight in
    try {
        if (sessionStorage.getItem("asfc_booted")) {
            boot.style.display = "none";
            return;
        }
    } catch (e) { /* sessionStorage blocked — just play the boot */ }

    play([
        "ANTISOCIAL FRIENDS CLUB — BIOS v9.5",
        "Copyright (C) ASFC. All rights reserved.",
        "",
        "Detecting clients ............ 11 CHANNELS FOUND",
        "Subscribers .................. 6.9M+",
        "Views delivered .............. 500M+ AND COUNTING",
        "Genres ....................... BOXING / NBA / COMEDY / CREATOR ... OK",
        "",
        "> WE TURN ATHLETES, TEAMS & CREATORS INTO",
        "  HIGH-VIEWERSHIP, HIGH-REVENUE CHANNELS.",
        "",
        "Loading KentOS95 ............. READY"
    ], function () {
        try { sessionStorage.setItem("asfc_booted", "1"); } catch (e) {}
        hide();
    });
})();
