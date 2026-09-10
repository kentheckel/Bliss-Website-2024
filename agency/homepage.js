"use strict";

// The homepage is an app inside ASFCos. All channel launches go through the
// same desktop handler used by the Channels folder; there are no demo dialogs.
function requestDesktop(action, value) {
    if (window.parent === window) {
        const query = new URLSearchParams({ [action]: value || "home" });
        window.location.href = "../index.html?" + query;
        return;
    }
    window.parent.postMessage(
        { type: "asfc:homepage", action, value },
        location.protocol === "file:" ? "*" : location.origin
    );
}

document.addEventListener("click", event => {
    const channel = event.target.closest("[data-channel]");
    const app = event.target.closest("[data-app]");
    if (channel) {
        event.preventDefault();
        requestDesktop("channel", channel.dataset.channel);
    } else if (app) {
        event.preventDefault();
        requestDesktop("app", app.dataset.app);
    }
});

document.addEventListener("pointerdown", () => {
    if (window.parent !== window) requestDesktop("focus");
}, { capture: true });

// The database supplies the estimate; interpolate between periodic server snapshots.
const networkViews = document.getElementById('network-views');
if (networkViews) {
    const formatViews = new Intl.NumberFormat('en-US');
    function updateNetworkViews() {
        networkViews.textContent = formatViews.format(window.getASFCNetworkViews());
    }
    window.addEventListener('asfc:counter-update', updateNetworkViews);
    updateNetworkViews();
    const networkTimer = setInterval(updateNetworkViews, 1000);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) updateNetworkViews();
    });
    window.addEventListener('pageshow', updateNetworkViews);
    window.addEventListener('pagehide', event => {
        if (!event.persisted) clearInterval(networkTimer);
    });
}
