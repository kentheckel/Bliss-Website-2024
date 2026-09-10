"use strict";

// Supabase owns the total, daily rate, and UTC reporting clock. Visitors only read.
(() => {
    const endpoint = 'https://aupolmxluoewdcpamqqm.supabase.co/rest/v1/rpc/asfc_network_snapshot';
    const publicKey = 'sb_publishable_9V4LhofB8S4Co0xOcQY5Pw_3EyOvPZd';
    let snapshot = null;
    let receivedAt = 0;
    let lastKnown = 6800000000;
    let pending = false;
    try { const cached = Number(localStorage.getItem('asfc-network-last-total')); if (Number.isSafeInteger(cached) && cached >= lastKnown) lastKnown = cached; } catch (_) {}

    window.getASFCNetworkViews = () => {
        if (!snapshot) return lastKnown;
        // Freeze interpolation after ten minutes offline, rather than inventing growth indefinitely.
        const elapsed = Math.min(600000, Math.max(0, performance.now() - receivedAt));
        const sinceMidnight = Math.max(0, Date.parse(snapshot.server_now) - Date.parse(snapshot.as_of) + elapsed);
        return snapshot.total_views + Math.floor(sinceMidnight / 86400000 * snapshot.daily_growth);
    };
    window.refreshASFCNetworkViews = async () => {
        if (pending) return;
        pending = true;
        try {
            const response = await fetch(endpoint, {headers: {apikey: publicKey}, cache: 'no-store', signal: AbortSignal.timeout(8000)});
            if (!response.ok) throw new Error('Counter unavailable');
            const [value] = await response.json();
            if (!value || !Number.isSafeInteger(value.total_views) || !Number.isSafeInteger(value.daily_growth) || value.total_views < 0 || value.daily_growth < 0 || !Number.isFinite(Date.parse(value.as_of)) || !Number.isFinite(Date.parse(value.server_now))) throw new Error('Invalid counter snapshot');
            snapshot = value;
            receivedAt = performance.now();
            lastKnown = window.getASFCNetworkViews();
            try { localStorage.setItem('asfc-network-last-total', String(lastKnown)); } catch (_) {}
            window.dispatchEvent(new Event('asfc:counter-update'));
        } catch (_) {
            // Retain the last known estimate during a temporary database/network outage.
        } finally { pending = false; }
    };
    window.refreshASFCNetworkViews();
    setInterval(() => { if (!document.hidden) window.refreshASFCNetworkViews(); }, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) window.refreshASFCNetworkViews(); });
    window.addEventListener('pageshow', window.refreshASFCNetworkViews);
})();
