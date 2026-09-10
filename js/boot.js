"use strict";

// ===========================================
// DESKTOP BIOS BOOT
// A full-screen boot sequence that types out
// who ASFC is, then reveals the desktop. Plays
// once per browser session. Desktop only — the
// phone OS has its own boot (js/phone.js).
// Loaded mid-<body> so it can bail instantly for
// returning visitors (no flash of green).
// ===========================================

(function () {
    var boot = document.getElementById("boot-screen");
    if (!boot) return;

    // Mobile has its own boot inside the phone OS
    if (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) {
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

    var el = document.getElementById("boot-screen-text");
    var skip = document.getElementById("boot-screen-skip");

    var LINES = [
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
    ];

    var done = false;
    function finish() {
        if (done) return;
        done = true;
        try { sessionStorage.setItem("asfc_booted", "1"); } catch (e) {}
        boot.classList.add("boot-out");
        setTimeout(function () { boot.style.display = "none"; }, 420);
        document.removeEventListener("keydown", onKey, true);
    }
    function onKey(e) { finish(); }

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

    // Kick off once the element exists (it does — script is right after it)
    tick();
    document.addEventListener("keydown", onKey, true);
    boot.addEventListener("click", finish);
})();
