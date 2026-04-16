"use strict";

// ===========================================
// NETWORK STATS TRACKER
// Live daily-views chart + category-grouped table
// CRT terminal aesthetic
// ===========================================

(function () {
    let cachedConfig = null;
    let cachedLive = null;

    function formatNumber(n) {
        return Math.round(n).toLocaleString("en-US");
    }

    function formatCompact(n) {
        if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
        if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
        if (n >= 1000) return (n / 1000).toFixed(0) + "K";
        return n.toString();
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // ---- LINE CHART ----

    function drawChart(dailyTotals, dates, progress) {
        const canvas = document.getElementById("statsLineChart");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        const W = canvas.width / dpr;
        const H = canvas.height / dpr;
        const pad = { top: 16, right: 16, bottom: 28, left: 56 };

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = "#0a0a1e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.scale(dpr, dpr);

        const n = dailyTotals.length;
        const visibleCount = Math.max(2, Math.round(n * progress));
        const visibleData = dailyTotals.slice(0, visibleCount);

        const maxVal = Math.max(...dailyTotals) * 1.1;
        const minVal = Math.min(...dailyTotals) * 0.85;

        const chartW = W - pad.left - pad.right;
        const chartH = H - pad.top - pad.bottom;

        function xPos(i) { return pad.left + (i / (n - 1)) * chartW; }
        function yPos(v) { return pad.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH; }

        // Grid lines + Y labels
        ctx.strokeStyle = "#1a2a3a";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
            const y = pad.top + (chartH / 3) * i;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(W - pad.right, y);
            ctx.stroke();

            const val = maxVal - ((maxVal - minVal) / 3) * i;
            ctx.fillStyle = "#33ff9988";
            ctx.font = "11px 'MS Sans Serif', 'Pixelated MS Sans Serif', Arial, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(formatCompact(val), pad.left - 6, y + 4);
        }

        // X-axis date labels
        ctx.fillStyle = "#33ff9966";
        ctx.textAlign = "center";
        ctx.font = "10px 'MS Sans Serif', 'Pixelated MS Sans Serif', Arial, sans-serif";
        const labelPositions = [0, Math.floor(n * 0.25), Math.floor(n * 0.5), Math.floor(n * 0.75), n - 1];
        labelPositions.forEach((idx) => {
            if (idx < dates.length) {
                const d = dates[idx];
                const label = d.slice(5); // "MM-DD"
                ctx.fillText(label, xPos(idx), H - 6);
            }
        });

        if (visibleCount < 2) { ctx.restore(); return; }

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
        gradient.addColorStop(0, "rgba(51, 255, 153, 0.18)");
        gradient.addColorStop(1, "rgba(51, 255, 153, 0.01)");

        ctx.beginPath();
        ctx.moveTo(xPos(0), yPos(visibleData[0]));
        for (let i = 1; i < visibleCount; i++) {
            ctx.lineTo(xPos(i), yPos(visibleData[i]));
        }
        ctx.lineTo(xPos(visibleCount - 1), pad.top + chartH);
        ctx.lineTo(xPos(0), pad.top + chartH);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(xPos(0), yPos(visibleData[0]));
        for (let i = 1; i < visibleCount; i++) {
            ctx.lineTo(xPos(i), yPos(visibleData[i]));
        }
        ctx.strokeStyle = "#33ff99";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#33ff99";
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // End dot
        const lastIdx = visibleCount - 1;
        ctx.beginPath();
        ctx.arc(xPos(lastIdx), yPos(visibleData[lastIdx]), 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#33ff99";
        ctx.shadowColor = "#33ff99";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    function setupCanvas() {
        const canvas = document.getElementById("statsLineChart");
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        const w = 688;
        const h = 160;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
    }

    function animateChart(dailyTotals, dates) {
        setupCanvas();
        const duration = 1800;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            drawChart(dailyTotals, dates, easeOutCubic(progress));
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // ---- TABLE ----

    function mergeChannelData(categories, liveData) {
        // Merge live total_views into channels that have a liveKey
        return categories.map((cat) => {
            const channels = cat.channels.map((ch) => {
                if (ch.liveKey && liveData && liveData.channels[ch.liveKey]) {
                    const live = liveData.channels[ch.liveKey];
                    // Compute 30d growth from daily data
                    let growth30d = 0;
                    if (liveData.daily) {
                        const allDates = Object.keys(liveData.daily).sort();
                        const last30 = allDates.slice(-30);
                        last30.forEach((d) => {
                            const dayData = liveData.daily[d];
                            if (dayData && typeof dayData === "object" && dayData[ch.liveKey]) {
                                growth30d += dayData[ch.liveKey];
                            }
                        });
                    }
                    return {
                        ...ch,
                        views: live.total_views,
                        growth30d: growth30d,
                        subscribers: ch.subscribers || 0,
                        videos: ch.videos || 0,
                    };
                }
                return {
                    ...ch,
                    views: ch.views || 0,
                    subscribers: ch.subscribers || 0,
                    videos: ch.videos || 0,
                    growth30d: ch.growth30d || 0,
                };
            });
            return { ...cat, channels };
        });
    }

    function renderTable(categories) {
        const container = document.getElementById("statsTableContainer");
        if (!container) return;

        const allChannels = categories.flatMap((cat) => cat.channels);
        const totalViews = allChannels.reduce((s, c) => s + c.views, 0);
        const totalGrowth = allChannels.reduce((s, c) => s + c.growth30d, 0);

        let html = `
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Channel</th>
                        <th>Platform</th>
                        <th>Total Views</th>
                        <th>30d Views</th>
                    </tr>
                </thead>
                <tbody>`;

        let rowIdx = 0;
        categories.forEach((cat) => {
            const catViews = cat.channels.reduce((s, c) => s + c.views, 0);
            const catGrowth = cat.channels.reduce((s, c) => s + c.growth30d, 0);

            html += `
                    <tr class="stats-category-row">
                        <td class="stats-category-name" colspan="2">${cat.name}</td>
                        <td class="stats-num stats-cat-num" data-target="${catViews}">0</td>
                        <td class="stats-num stats-cat-num stats-growth" data-target="${catGrowth}">+0</td>
                    </tr>`;

            cat.channels.forEach((ch) => {
                const platformIcon = ch.platform === "youtube" ? "&#9654; YT" : ch.platform;
                const nameClass = ch.sensitive ? "stats-channel-name stats-sensitive" : "stats-channel-name";
                html += `
                    <tr class="stats-channel-row">
                        <td class="${nameClass}">${ch.name}</td>
                        <td class="stats-platform">${platformIcon}</td>
                        <td class="stats-num" data-target="${ch.views}">0</td>
                        <td class="stats-num stats-growth" data-target="${ch.growth30d}">+0</td>
                    </tr>`;
                rowIdx++;
            });
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
                    <span class="stats-totals-item">Total Views: <span class="stats-total-num" data-target="${totalViews}">0</span></span>
                    <span class="stats-totals-item">30d Views: <span class="stats-total-num stats-growth" data-target="${totalGrowth}">+0</span></span>
                </div>`;
        }
    }

    function animateNumbers() {
        const duration = 1500;
        document.querySelectorAll("#statsTableContainer .stats-num, #statsTotals .stats-total-num").forEach((el) => {
            const target = parseFloat(el.dataset.target);
            const isGrowth = el.classList.contains("stats-growth");
            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutCubic(progress);
                const current = eased * target;
                el.textContent = (isGrowth ? "+" : "") + formatNumber(current);
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    // ---- LOAD & INIT ----

    async function loadStats() {
        try {
            // Fetch config and live data in parallel
            if (!cachedConfig) {
                const configResp = await fetch("data/channels.json");
                cachedConfig = await configResp.json();
            }

            if (!cachedLive) {
                try {
                    const liveResp = await fetch(cachedConfig.liveDataUrl);
                    cachedLive = await liveResp.json();
                } catch (e) {
                    console.warn("Could not fetch live data, using static only:", e);
                    cachedLive = null;
                }
            }

            // Chart: extract daily totals
            if (cachedLive && cachedLive.daily) {
                const allDates = Object.keys(cachedLive.daily).sort();
                const chartDays = cachedConfig.chartDays || 60;
                const chartDates = allDates.slice(-chartDays);
                const chartTotals = chartDates.map((d) => {
                    const entry = cachedLive.daily[d];
                    if (typeof entry === "object") {
                        return entry._total || Object.keys(entry).filter((k) => k !== "_total").reduce((s, k) => s + entry[k], 0);
                    }
                    return entry;
                });
                animateChart(chartTotals, chartDates);

                // Update chart label with date range
                const label = document.querySelector(".stats-chart-label");
                if (label) {
                    label.textContent = `DAILY VIEWS \u2014 ${chartDates[0]} to ${chartDates[chartDates.length - 1]}`;
                }
            }

            // Table: merge live data into categories
            const merged = mergeChannelData(cachedConfig.categories, cachedLive);
            renderTable(merged);
            animateNumbers();

        } catch (err) {
            console.error("Failed to load channel stats:", err);
            const container = document.getElementById("statsTableContainer");
            if (container) {
                container.innerHTML = '<p style="color: #ff4444; padding: 20px;">Error loading stats data.</p>';
            }
        }
    }

    function watchForOpen() {
        const modal = document.getElementById("ModalStats");
        if (!modal) return;

        const observer = new MutationObserver(() => {
            if (modal.style.display === "block") {
                loadStats();
            }
        });

        observer.observe(modal, {
            attributes: true,
            attributeFilter: ["style"],
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", watchForOpen);
    } else {
        watchForOpen();
    }
})();
