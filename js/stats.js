"use strict";

// ===========================================
// NETWORK STATS TRACKER
// Fetches channel data and renders an animated
// stats table inside the Stats modal
// ===========================================

(function () {
    let channelsData = null;
    let hasAnimated = false;

    // Format number with commas: 1570000 -> "1,570,000"
    function formatNumber(n) {
        return Math.round(n).toLocaleString("en-US");
    }

    // Easing function (ease-out cubic)
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Animate a single number from 0 to target over duration ms
    function animateNumber(el, target, duration) {
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const current = eased * target;
            el.textContent = formatNumber(current);
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }
        requestAnimationFrame(tick);
    }

    // Build the stats table HTML
    function renderTable(channels) {
        const container = document.getElementById("statsTableContainer");
        if (!container) return;

        // Calculate totals
        const totalSubs = channels.reduce((s, c) => s + c.subscribers, 0);
        const totalViews = channels.reduce((s, c) => s + c.views, 0);
        const totalVideos = channels.reduce((s, c) => s + c.videos, 0);
        const totalGrowth = channels.reduce((s, c) => s + c.growth30d, 0);

        let html = `
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Channel</th>
                        <th>Platform</th>
                        <th>Subscribers</th>
                        <th>Views</th>
                        <th>Videos</th>
                        <th>30d Growth</th>
                    </tr>
                </thead>
                <tbody>`;

        channels.forEach((ch, i) => {
            const platformIcon = ch.platform === "youtube" ? "&#9654; YT" : ch.platform;
            html += `
                    <tr>
                        <td class="stats-channel-name">${ch.name}</td>
                        <td class="stats-platform">${platformIcon}</td>
                        <td class="stats-num" data-target="${ch.subscribers}" data-row="${i}" data-col="subs">0</td>
                        <td class="stats-num" data-target="${ch.views}" data-row="${i}" data-col="views">0</td>
                        <td class="stats-num" data-target="${ch.videos}" data-row="${i}" data-col="videos">0</td>
                        <td class="stats-num stats-growth" data-target="${ch.growth30d}" data-row="${i}" data-col="growth">+0</td>
                    </tr>`;
        });

        html += `
                </tbody>
            </table>`;

        container.innerHTML = html;

        // Totals bar
        const totalsDiv = document.getElementById("statsTotals");
        if (totalsDiv) {
            totalsDiv.innerHTML = `
                <div class="stats-totals-row">
                    <span class="stats-totals-label">NETWORK TOTAL</span>
                    <span class="stats-totals-item">Subs: <span class="stats-total-num" data-target="${totalSubs}">0</span></span>
                    <span class="stats-totals-item">Views: <span class="stats-total-num" data-target="${totalViews}">0</span></span>
                    <span class="stats-totals-item">Videos: <span class="stats-total-num" data-target="${totalVideos}">0</span></span>
                    <span class="stats-totals-item">30d: <span class="stats-total-num stats-growth" data-target="${totalGrowth}">+0</span></span>
                </div>`;
        }
    }

    // Trigger trickle-feed animation on all number cells
    function animateAll() {
        const duration = 1500; // 1.5 seconds

        // Animate table cells
        document.querySelectorAll("#statsTableContainer .stats-num").forEach((el) => {
            const target = parseFloat(el.dataset.target);
            const isGrowth = el.classList.contains("stats-growth");
            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutCubic(progress);
                const current = eased * target;
                el.textContent = (isGrowth ? "+" : "") + formatNumber(current);
                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            }
            requestAnimationFrame(tick);
        });

        // Animate totals
        document.querySelectorAll("#statsTotals .stats-total-num").forEach((el) => {
            const target = parseFloat(el.dataset.target);
            const isGrowth = el.classList.contains("stats-growth");
            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutCubic(progress);
                const current = eased * target;
                el.textContent = (isGrowth ? "+" : "") + formatNumber(current);
                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            }
            requestAnimationFrame(tick);
        });
    }

    // Fetch data and render
    async function loadStats() {
        if (channelsData) {
            renderTable(channelsData);
            animateAll();
            return;
        }
        try {
            const resp = await fetch("data/channels.json");
            const data = await resp.json();
            channelsData = data.channels;
            renderTable(channelsData);
            animateAll();
        } catch (err) {
            console.error("Failed to load channel stats:", err);
            const container = document.getElementById("statsTableContainer");
            if (container) {
                container.innerHTML = '<p style="color: #ff4444; padding: 20px;">Error loading stats data.</p>';
            }
        }
    }

    // Watch for the Stats modal being opened
    // Use a MutationObserver on the modal's display style
    function watchForOpen() {
        const modal = document.getElementById("ModalStats");
        if (!modal) return;

        const observer = new MutationObserver(() => {
            if (modal.style.display === "block") {
                hasAnimated = false;
                loadStats();
            }
        });

        observer.observe(modal, {
            attributes: true,
            attributeFilter: ["style"],
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", watchForOpen);
    } else {
        watchForOpen();
    }
})();
