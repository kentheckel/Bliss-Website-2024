"use strict";

const agencyRestoredBounds = new WeakMap();
const agencyTrackedDocuments = new WeakSet();

// Events inside iframe apps do not bubble into the desktop. Keep its existing
// screensaver informed while someone reads, scrolls, or uses an embedded app.
function trackEmbeddedActivity(frame) {
    let doc;
    try { doc = frame.contentDocument; } catch (_) { return; }
    if (!doc || agencyTrackedDocuments.has(doc)) return;
    agencyTrackedDocuments.add(doc);
    let lastActivity = 0;
    function activity() {
        const now = Date.now();
        if (now - lastActivity < 500) return;
        lastActivity = now;
        document.dispatchEvent(new Event("asfc:activity"));
    }
    ["pointermove", "pointerdown", "keydown", "scroll"].forEach(name =>
        doc.addEventListener(name, activity, { capture: true, passive: true })
    );
}

document.addEventListener("load", event => {
    if (event.target instanceof HTMLIFrameElement) trackEmbeddedActivity(event.target);
}, true);

function setWindowBounds(modal, bounds) {
    Object.entries(bounds).forEach(([name, value]) =>
        modal.style.setProperty(name, typeof value === "number" ? value + "px" : value, "important")
    );
    modal.style.transform = "none";
}

function toggleWindowMaximize(modal) {
    const button = modal.querySelector("[data-window-maximize]");
    if (modal.classList.contains("is-maximized")) {
        modal.style.cssText = agencyRestoredBounds.get(modal) || "";
        modal.classList.remove("is-maximized");
        button?.setAttribute("aria-label", "Maximize window");
    } else {
        agencyRestoredBounds.set(modal, modal.style.cssText);
        modal.classList.add("is-maximized");
        setWindowBounds(modal, { left: 12, top: 12, width: innerWidth - 24, height: innerHeight - 94 });
        button?.setAttribute("aria-label", "Restore window size");
    }
    bringToFront(modal);
}

function arrangePresentationWindow(modal) {
    // 12px outer frame + 34px title area + the deck's 52px navigation bar.
    // Size the remaining content as a 16:9 slide, including on shorter laptops.
    const maxHeight = innerHeight - 170;
    const width = Math.min(1280, innerWidth - 72, (maxHeight - 98) * 16 / 9 + 12);
    const height = (width - 12) * 9 / 16 + 98;
    setWindowBounds(modal, { left: innerWidth - width - 24, top: 80, width, height });
}

function arrangeChannelWindows(analytics, strategy) {
    const left = innerWidth >= 1200 ? 150 : 24;
    const available = innerWidth - left - 24;
    const height = Math.max(300, innerHeight - 150);
    const strategyWidth = innerWidth >= 1200 ? Math.min(440, available * .34) : Math.min(460, available - 28);
    const analyticsWidth = innerWidth >= 1200 ? available - strategyWidth - 18 : available - 28;
    [analytics, strategy].forEach(modal => {
        if (modal.classList.contains("is-maximized")) toggleWindowMaximize(modal);
    });
    if (strategy.dataset.windowLayout === "presentation") {
        setWindowBounds(analytics, { left, top: 48, width: Math.min(1100, available), height });
        arrangePresentationWindow(strategy);
        bringToFront(strategy);
        return;
    }
    setWindowBounds(analytics, { left, top: 48, width: analyticsWidth, height });
    setWindowBounds(strategy, {
        left: innerWidth >= 1200 ? left + analyticsWidth + 18 : innerWidth - strategyWidth - 24,
        top: innerWidth >= 1200 ? 48 : 94,
        width: strategyWidth,
        height: innerWidth >= 1200 ? height : height - 46
    });
}

function openAgencyApp(app) {
    if (innerWidth <= 768) {
        openApp(app === "contact" ? "book" : app);
        return;
    }
    const windows = { team: "ModalAbout", products: "ModalOurProducts", work: "ModalOurWork", services: "ModalServices" };
    if (app === "contact") document.getElementById("contactBtn").click();
    else if (app === "explore") minimizeModal(document.getElementById("ModalWelcome"));
    else if (windows[app]) openModal(document.getElementById(windows[app]));
}

window.addEventListener("message", event => {
    if (event.origin === location.origin && event.data?.type === "asfc:services" && event.data.action === "contact") {
        const trusted = [...document.querySelectorAll('.services-frame')].some(frame => frame.contentWindow === event.source);
        if (trusted) openAgencyApp('contact');
        return;
    }
    const frame = document.getElementById("agency-home-frame");
    if (event.source !== frame?.contentWindow || event.origin !== location.origin || event.data?.type !== "asfc:homepage") return;
    const { action, value } = event.data;
    if (action === "channel") openChannelModals(value);
    else if (action === "app") openAgencyApp(value);
    else if (action === "focus" && innerWidth > 768) bringToFront(document.getElementById("ModalWelcome"));
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("iframe").forEach(trackEmbeddedActivity);
    const welcome = document.getElementById("ModalWelcome");
    const frame = document.getElementById("agency-home-frame");
    const desktopSlot = document.getElementById("agency-desktop-slot");
    const mobileSlot = document.getElementById("phone-homepage-host");
    const mobileQuery = matchMedia("(max-width: 768px)");

    document.querySelectorAll('#ModalWelcome, #ModalServices, [id^="ModalAnalytics"], [id^="ModalTextBox"]').forEach(modal => {
        modal.classList.add("managed-window");
        const header = modal.querySelector(".window-controls");
        if (!header) return;
        const controls = header.querySelector(".window-btn-container") || header;
        const maximize = document.createElement("button");
        maximize.className = "window-btn";
        maximize.dataset.windowMaximize = "";
        maximize.textContent = "□";
        maximize.setAttribute("aria-label", "Maximize window");
        const close = [...controls.querySelectorAll("button")].find(button => button.textContent.trim() === "X");
        controls.insertBefore(maximize, close || null);
        maximize.addEventListener("click", () => toggleWindowMaximize(modal));
        header.querySelectorAll("button").forEach(button => {
            if (button.textContent.trim() === "X") button.setAttribute("aria-label", "Close window");
            if (button.textContent.trim() === "-") button.setAttribute("aria-label", "Minimize window");
        });
        modal.querySelectorAll("iframe").forEach(child => {
            if (!child.title) child.title = header.querySelector("span")?.textContent || "Channel content";
            let registeredDocument;
            function trackFocus() {
                try {
                    const doc = child.contentDocument;
                    if (!doc || doc === registeredDocument) return;
                    registeredDocument = doc;
                    doc.addEventListener("pointerdown", () => bringToFront(modal), { capture: true });
                } catch (_) { /* An external embedded page manages its own focus. */ }
            }
            child.addEventListener("load", trackFocus);
            trackFocus();
        });
    });

    function placeHomepage() {
        const target = mobileQuery.matches ? mobileSlot : desktopSlot;
        if (frame.parentNode !== target) {
            const scrollTop = frame.contentDocument?.getElementById("page")?.scrollTop || 0;
            frame.addEventListener("load", () => {
                const page = frame.contentDocument?.getElementById("page");
                if (page) page.scrollTo({ top: scrollTop, behavior: "instant" });
            }, { once: true });
            target.appendChild(frame);
        }
        if (!mobileQuery.matches) openModal(welcome);
    }
    placeHomepage();
    mobileQuery.addEventListener("change", placeHomepage);
    window.addEventListener("resize", () => {
        document.querySelectorAll(".managed-window.is-maximized").forEach(modal =>
            setWindowBounds(modal, { left: 12, top: 12, width: innerWidth - 24, height: innerHeight - 94 })
        );
        if (innerWidth > 768) {
            document.querySelectorAll('[data-window-layout="presentation"]:not(.is-maximized)').forEach(modal => {
                if (modal.style.display !== "none") arrangePresentationWindow(modal);
            });
        }
    });

    const params = new URLSearchParams(location.search);
    if (params.has("channel")) openChannelModals(params.get("channel"));
    else if (params.has("app")) openAgencyApp(params.get("app"));
});
