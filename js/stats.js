"use strict";

// ===========================================
// NETWORK STATS TRACKER
// Live daily-views chart + category-grouped table
// Hover tooltip, range selector, maximize, tray
// ===========================================

(function () {
    let cachedConfig = null;
    let cachedLive = null;
    let allDailyTotals = [];
    let allDailyDates = [];
    let currentRange = 30;
    let hasAnimated = false;
    let chartPositions = []; // store {x, y, date, value} for hover

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

    function getChartDimensions() {
        const canvas = document.getElementById("statsLineChart");
        if (!canvas) return null;
        const dpr = window.devicePixelRatio || 1;
        return {
            canvas, dpr,
            W: canvas.width / dpr,
            H: canvas.height / dpr,
            pad: { top: 16, right: 16, bottom: 28, left: 56 }
        };
    }

    function drawChart(dailyTotals, dates, progress) {
        const dim = getChartDimensions();
        if (!dim) return;
        const { canvas, dpr, W, H, pad } = dim;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

        // Store positions for hover lookup
        chartPositions = [];
        for (let i = 0; i < n; i++) {
            chartPositions.push({ x: xPos(i), y: yPos(dailyTotals[i]), date: dates[i], value: dailyTotals[i] });
        }

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
                ctx.fillText(dates[idx].slice(5), xPos(idx), H - 6);
            }
        });

        if (visibleCount < 2) { ctx.restore(); return; }

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
        gradient.addColorStop(0, "rgba(51, 255, 153, 0.18)");
        gradient.addColorStop(1, "rgba(51, 255, 153, 0.01)");
        ctx.beginPath();
        ctx.moveTo(xPos(0), yPos(visibleData[0]));
        for (let i = 1; i < visibleCount; i++) ctx.lineTo(xPos(i), yPos(visibleData[i]));
        ctx.lineTo(xPos(visibleCount - 1), pad.top + chartH);
        ctx.lineTo(xPos(0), pad.top + chartH);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(xPos(0), yPos(visibleData[0]));
        for (let i = 1; i < visibleCount; i++) ctx.lineTo(xPos(i), yPos(visibleData[i]));
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

    // Draw hover crosshair + dot
    function drawHoverOverlay(idx) {
        const dim = getChartDimensions();
        if (!dim || !chartPositions[idx]) return;
        const { canvas, dpr, W, H, pad } = dim;
        const ctx = canvas.getContext("2d");
        const pt = chartPositions[idx];

        // Redraw base chart first
        const slicedTotals = allDailyTotals.slice(-currentRange || undefined);
        const slicedDates = allDailyDates.slice(-currentRange || undefined);
        drawChart(currentRange === 0 ? allDailyTotals : slicedTotals, currentRange === 0 ? allDailyDates : slicedDates, 1);

        ctx.save();
        ctx.scale(dpr, dpr);

        // Vertical crosshair line
        ctx.strokeStyle = "#33ff9944";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pt.x, pad.top);
        ctx.lineTo(pt.x, H - pad.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        // Highlight dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#33ff99";
        ctx.shadowColor = "#33ff99";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    function setupCanvas() {
        const canvas = document.getElementById("statsLineChart");
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const wrap = canvas.parentElement;
        const w = wrap.clientWidth || 688;
        const h = 160;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
    }

    function renderChart(animate) {
        setupCanvas();
        const totals = currentRange === 0 ? allDailyTotals : allDailyTotals.slice(-currentRange);
        const dates = currentRange === 0 ? allDailyDates : allDailyDates.slice(-currentRange);

        // Update label
        const label = document.querySelector(".stats-chart-label");
        if (label && dates.length) {
            label.textContent = `DAILY VIEWS \u2014 ${dates[0]} to ${dates[dates.length - 1]}`;
        }

        if (animate) {
            const duration = 1800;
            const start = performance.now();
            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                drawChart(totals, dates, easeOutCubic(progress));
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        } else {
            drawChart(totals, dates, 1);
        }
    }

    // ---- HOVER TOOLTIP ----

    function setupHover() {
        const canvas = document.getElementById("statsLineChart");
        const tooltip = document.getElementById("statsTooltip");
        if (!canvas || !tooltip) return;

        canvas.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const scaleX = canvas.width / (window.devicePixelRatio || 1) / rect.width;
            const adjustedX = mouseX * scaleX;

            // Find nearest point
            let nearest = null;
            let nearestDist = Infinity;
            chartPositions.forEach((pt, i) => {
                const dist = Math.abs(pt.x - adjustedX);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = { ...pt, idx: i };
                }
            });

            if (nearest && nearestDist < 20) {
                drawHoverOverlay(nearest.idx);
                tooltip.style.display = "block";
                tooltip.innerHTML = `<span class="stats-tooltip-date">${nearest.date}</span><span class="stats-tooltip-val">${formatNumber(nearest.value)} views</span>`;

                // Position tooltip near cursor but within bounds
                const tipX = Math.min(Math.max(e.clientX - rect.left - 60, 0), rect.width - 140);
                const tipY = Math.max(e.clientY - rect.top - 50, 0);
                tooltip.style.left = tipX + "px";
                tooltip.style.top = tipY + "px";
            } else {
                tooltip.style.display = "none";
            }
        });

        canvas.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
            // Redraw without overlay
            const totals = currentRange === 0 ? allDailyTotals : allDailyTotals.slice(-currentRange);
            const dates = currentRange === 0 ? allDailyDates : allDailyDates.slice(-currentRange);
            drawChart(totals, dates, 1);
        });
    }

    // ---- RANGE SELECTOR ----

    function setupRangeButtons() {
        document.querySelectorAll(".stats-range-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                document.querySelectorAll(".stats-range-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                currentRange = parseInt(btn.dataset.range, 10);
                renderChart(false);
            });
        });
    }

    // ---- MAXIMIZE ----

    function setupMaximize() {
        const modal = document.getElementById("ModalStats");
        if (!modal) return;
        const maxBtn = modal.querySelector(".window-btn-max");
        if (!maxBtn) return;

        let isMaximized = false;
        let prevStyles = {};

        maxBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isMaximized) {
                // Save current state
                prevStyles = {
                    width: modal.style.width,
                    height: modal.style.height,
                    top: modal.style.top,
                    left: modal.style.left,
                    transform: modal.style.transform,
                    cssWidth: modal.offsetWidth + "px",
                    cssHeight: modal.offsetHeight + "px",
                };
                // Maximize
                modal.style.width = "calc(100vw - 20px)";
                modal.style.height = "calc(100vh - 80px)";
                modal.style.top = "10px";
                modal.style.left = "10px";
                modal.style.transform = "none";
                maxBtn.innerHTML = "&#9632;"; // filled square = restore
                maxBtn.title = "Restore";
                isMaximized = true;
            } else {
                // Restore
                modal.style.width = prevStyles.cssWidth || "";
                modal.style.height = prevStyles.cssHeight || "";
                modal.style.top = prevStyles.top || "";
                modal.style.left = prevStyles.left || "";
                modal.style.transform = prevStyles.transform || "";
                maxBtn.innerHTML = "&#9633;"; // empty square = maximize
                maxBtn.title = "Maximize";
                isMaximized = false;
            }
            // Re-render chart for new size
            setTimeout(() => renderChart(false), 50);
        });
    }

    // ---- TABLE ----

    function mergeChannelData(categories, liveData) {
        return categories.map((cat) => {
            const channels = cat.channels.map((ch) => {
                if (ch.liveKey && liveData && liveData.channels[ch.liveKey]) {
                    const live = liveData.channels[ch.liveKey];
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
                    return { ...ch, views: live.total_views, growth30d, subscribers: ch.subscribers || 0, videos: ch.videos || 0 };
                }
                return { ...ch, views: ch.views || 0, subscribers: ch.subscribers || 0, videos: ch.videos || 0, growth30d: ch.growth30d || 0 };
            });
            return { ...cat, channels };
        });
    }

    function renderTable(categories, animate) {
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

        categories.forEach((cat) => {
            const catViews = cat.channels.reduce((s, c) => s + c.views, 0);
            const catGrowth = cat.channels.reduce((s, c) => s + c.growth30d, 0);

            html += `
                    <tr class="stats-category-row">
                        <td class="stats-category-name" colspan="2">${cat.name}</td>
                        <td class="stats-num stats-cat-num" data-target="${catViews}">${animate ? "0" : formatNumber(catViews)}</td>
                        <td class="stats-num stats-cat-num stats-growth" data-target="${catGrowth}">${animate ? "+0" : "+" + formatNumber(catGrowth)}</td>
                    </tr>`;

            cat.channels.forEach((ch) => {
                const platformIcon = ch.platform === "youtube" ? "&#9654; YT" : ch.platform;
                const nameClass = ch.sensitive ? "stats-channel-name stats-sensitive" : "stats-channel-name";
                html += `
                    <tr class="stats-channel-row">
                        <td class="${nameClass}">${ch.name}</td>
                        <td class="stats-platform">${platformIcon}</td>
                        <td class="stats-num" data-target="${ch.views}">${animate ? "0" : formatNumber(ch.views)}</td>
                        <td class="stats-num stats-growth" data-target="${ch.growth30d}">${animate ? "+0" : "+" + formatNumber(ch.growth30d)}</td>
                    </tr>`;
            });
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

        // Totals bar
        const totalsDiv = document.getElementById("statsTotals");
        if (totalsDiv) {
            totalsDiv.innerHTML = `
                <div class="stats-totals-row">
                    <span class="stats-totals-label">NETWORK TOTAL</span>
                    <span class="stats-totals-item">Total Views: <span class="stats-total-num" data-target="${totalViews}">${animate ? "0" : formatNumber(totalViews)}</span></span>
                    <span class="stats-totals-item">30d Views: <span class="stats-total-num stats-growth" data-target="${totalGrowth}">${animate ? "+0" : "+" + formatNumber(totalGrowth)}</span></span>
                </div>`;
        }

        if (animate) animateNumbers();
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
                const current = easeOutCubic(progress) * target;
                el.textContent = (isGrowth ? "+" : "") + formatNumber(current);
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    // ---- SYSTEM TRAY ----

    function updateTray(totalViews, growth30d) {
        const trayVal = document.getElementById("statsTrayViews");
        if (!trayVal) return;
        trayVal.textContent = formatCompact(growth30d) + "/30d";
        const tray = document.getElementById("stats-tray");
        if (tray) {
            tray.title = `Network: ${formatNumber(totalViews)} total views | ${formatNumber(growth30d)} last 30d`;
            tray.style.cursor = "pointer";
            tray.onclick = () => {
                const modal = document.getElementById("ModalStats");
                if (modal) {
                    if (typeof openModal === "function") openModal(modal);
                    else { modal.style.display = "block"; }
                }
            };
        }
    }

    // ---- LOAD & INIT ----

    async function loadStats() {
        try {
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

            // Build full daily arrays
            if (cachedLive && cachedLive.daily && allDailyDates.length === 0) {
                allDailyDates = Object.keys(cachedLive.daily).sort();
                allDailyTotals = allDailyDates.map((d) => {
                    const entry = cachedLive.daily[d];
                    if (typeof entry === "object") {
                        return entry._total || Object.keys(entry).filter((k) => k !== "_total").reduce((s, k) => s + entry[k], 0);
                    }
                    return entry;
                });
            }

            const shouldAnimate = !hasAnimated;

            // Chart
            renderChart(shouldAnimate);

            // Table
            const merged = mergeChannelData(cachedConfig.categories, cachedLive);
            renderTable(merged, shouldAnimate);

            // System tray
            const allChannels = merged.flatMap((cat) => cat.channels);
            const totalViews = allChannels.reduce((s, c) => s + c.views, 0);
            const totalGrowth = allChannels.reduce((s, c) => s + c.growth30d, 0);
            updateTray(totalViews, totalGrowth);

            hasAnimated = true;

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

        observer.observe(modal, { attributes: true, attributeFilter: ["style"] });
    }

    function init() {
        watchForOpen();
        setupRangeButtons();
        setupHover();
        setupMaximize();

        // Pre-fetch data for system tray (runs on page load)
        setTimeout(async () => {
            try {
                if (!cachedConfig) {
                    const configResp = await fetch("data/channels.json");
                    cachedConfig = await configResp.json();
                }
                if (!cachedLive) {
                    const liveResp = await fetch(cachedConfig.liveDataUrl);
                    cachedLive = await liveResp.json();
                }
                // Build daily arrays
                if (cachedLive && cachedLive.daily) {
                    allDailyDates = Object.keys(cachedLive.daily).sort();
                    allDailyTotals = allDailyDates.map((d) => {
                        const entry = cachedLive.daily[d];
                        if (typeof entry === "object") {
                            return entry._total || Object.keys(entry).filter((k) => k !== "_total").reduce((s, k) => s + entry[k], 0);
                        }
                        return entry;
                    });
                }
                // Update tray
                const merged = mergeChannelData(cachedConfig.categories, cachedLive);
                const allChannels = merged.flatMap((cat) => cat.channels);
                updateTray(
                    allChannels.reduce((s, c) => s + c.views, 0),
                    allChannels.reduce((s, c) => s + c.growth30d, 0)
                );
            } catch (e) {
                console.warn("Tray prefetch failed:", e);
            }
        }, 2000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
