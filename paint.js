// Collaborative pixel canvas — 100x100 grid, 5px cells, Supabase Realtime sync.
// Public anon key by design: writes are gated by RLS, not secrecy.
(function () {
    'use strict';

    const SUPABASE_URL = 'https://aupolmxluoewdcpamqqm.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_9V4LhofB8S4Co0xOcQY5Pw_3EyOvPZd';

    const GRID = 100;
    const CELL = 5;

    const PALETTE = [
        '#000000', '#FFFFFF', '#7F7F7F', '#C3C3C3',
        '#880015', '#ED1C24', '#FF7F27', '#FFF200',
        '#22B14C', '#00A2E8', '#3F48CC', '#A349A4',
        '#B5E61D', '#99D9EA', '#FFAEC9', '#B97A57',
    ];

    let supabase = null;
    let canvas, ctx, paletteEl, selectedSwatchEl, statusEl;
    let selectedColor = PALETTE[5];
    let brushSize = 1;
    let lastTappedColor = '';
    let colorTapCount = 0;
    let painting = false;
    let lastPainted = '';
    let initialized = false;
    const CACHE_KEY = 'asfc-paint-canvas-v1';
    const PENDING_PREFIX = 'asfc-paint-pending-v1:';
    const pixels = new Map();
    const pending = new Map();
    let changesDuringLoad = null;
    let loading = false;
    let reloadRequested = false;
    let connected = false;
    let loadFailed = false;
    let saveFailed = false;
    let storageFailed = false;
    let saving = false;
    let saveTimer, cacheTimer;

    const pixelKey = (row) => `${row.x},${row.y}`;
    const validPixel = (row) => row && Number.isInteger(row.x) && Number.isInteger(row.y)
        && row.x >= 0 && row.x < GRID && row.y >= 0 && row.y < GRID
        && /^#[0-9a-f]{6}$/i.test(row.color);

    function updateStatus() {
        if (storageFailed && pending.size) setStatus('Keep this tab open — local backup unavailable', 'offline');
        else if (!supabase) setStatus('Offline — saved on this browser', 'offline');
        else if (saveFailed) setStatus('Saved locally — retrying sync…', 'offline');
        else if (pending.size) setStatus('Saving…', null);
        else if (loadFailed) setStatus('Offline — showing local copy', 'offline');
        else if (loading) setStatus('Loading…', null);
        else if (connected) setStatus('Live • painting together', 'connected');
        else setStatus('Saved • reconnecting…', 'offline');
    }

    function cacheCanvas() {
        clearTimeout(cacheTimer);
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify([...pixels.values()]));
        } catch (error) {
            console.warn('Paint: local canvas backup unavailable', error);
        }
    }

    function applyPixel(row) {
        if (!validPixel(row)) return;
        const key = pixelKey(row);
        pixels.set(key, { x: row.x, y: row.y, color: row.color });
        if (changesDuringLoad) changesDuringLoad.set(key, pixels.get(key));
        drawPixel(row.x, row.y, row.color);
        clearTimeout(cacheTimer);
        cacheTimer = setTimeout(cacheCanvas, 300);
    }

    function readPending() {
        try {
            const stored = new Map();
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key.startsWith(PENDING_PREFIX)) continue;
                try {
                    const row = JSON.parse(localStorage.getItem(key));
                    if (validPixel(row) && typeof row.id === 'string') stored.set(pixelKey(row), row);
                } catch { /* Ignore an invalid local entry. */ }
            }
            // Keep in-memory edits if local storage could not save them.
            if (!storageFailed) pending.clear();
            stored.forEach((row, key) => {
                if (!storageFailed || !pending.has(key)) pending.set(key, row);
            });
        } catch {
            storageFailed = true;
        }
    }

    function restoreCanvas() {
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
            if (Array.isArray(cached)) cached.forEach(applyPixel);
        } catch { /* A missing or invalid cache is safe to ignore. */ }
        readPending();
        pending.forEach(applyPixel);
    }

    function scheduleSave(delay = 100) {
        if (saving || saveTimer || !supabase || !pending.size) return;
        saveTimer = setTimeout(() => {
            saveTimer = null;
            flushPending();
        }, delay);
    }

    async function flushPending() {
        if (saving || !supabase) return;
        clearTimeout(saveTimer);
        saveTimer = null;
        saving = true;
        const save = async () => {
            readPending();
            const batch = [...pending.values()].slice(0, 200);
            if (!batch.length) { saveFailed = false; return; }
            const { error } = await supabase.from('pixels').upsert(
                batch.map(({ x, y, color }) => ({ x, y, color })),
                { onConflict: 'x,y' }
            );
            if (error) throw error;
            saveFailed = false;
            for (const row of batch) {
                const key = pixelKey(row);
                // A newer stroke may have arrived while this batch was saving.
                if (pending.get(key)?.id !== row.id) continue;
                try {
                    const stored = JSON.parse(localStorage.getItem(PENDING_PREFIX + key) || 'null');
                    if (stored && stored.id !== row.id) {
                        pending.set(key, stored);
                        continue;
                    }
                    localStorage.removeItem(PENDING_PREFIX + key);
                } catch { storageFailed = true; }
                if (changesDuringLoad) changesDuringLoad.set(key, { x: row.x, y: row.y, color: row.color });
                pending.delete(key);
            }
        };
        try {
            // Tabs share one durable outbox; serialize their requests where supported.
            if (navigator.locks) await navigator.locks.request('asfc-paint-save', save);
            else await save();
        } catch (error) {
            console.warn('Paint: save will retry', error);
            saveFailed = true;
        } finally {
            saving = false;
            updateStatus();
            scheduleSave(saveFailed ? 2000 : 100);
        }
    }

    function attachSyncHandlers() {
        window.addEventListener('storage', (event) => {
            if (!event.key?.startsWith(PENDING_PREFIX)) return;
            const key = event.key.slice(PENDING_PREFIX.length);
            if (event.newValue) {
                try {
                    const row = JSON.parse(event.newValue);
                    if (!validPixel(row) || typeof row.id !== 'string') return;
                    pending.set(key, row);
                    applyPixel(row);
                } catch { return; }
            } else {
                // Do not clear a newer local edit when another tab acknowledges a save.
                try {
                    if (pending.get(key)?.id === JSON.parse(event.oldValue)?.id) {
                        if (changesDuringLoad) changesDuringLoad.set(key, pixels.get(key));
                        pending.delete(key);
                    }
                } catch { return; }
            }
            if (!pending.size) saveFailed = false;
            updateStatus();
            scheduleSave();
        });
        const refresh = () => {
            flushPending();
            loadCanvas();
        };
        window.addEventListener('online', refresh);
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') refresh();
            else cacheCanvas();
        });
        window.addEventListener('pagehide', cacheCanvas);
        // Reconcile missed events, including when a WebSocket silently drops.
        setInterval(() => {
            if (document.visibilityState === 'visible') loadCanvas();
        }, 15000);
    }

    function setStatus(text, kind) {
        if (!statusEl) return;
        statusEl.textContent = text;
        statusEl.classList.remove('connected', 'offline');
        if (kind) statusEl.classList.add(kind);
    }

    function fillBackground() {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawPixel(x, y, color) {
        if (x < 0 || x >= GRID || y < 0 || y >= GRID) return;
        ctx.fillStyle = color;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }

    function buildPalette() {
        paletteEl.innerHTML = '';
        PALETTE.forEach((color) => {
            const btn = document.createElement('button');
            btn.className = 'paint-swatch';
            btn.style.backgroundColor = color;
            btn.dataset.color = color;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                colorTapCount = lastTappedColor === color ? colorTapCount + 1 : 1;
                lastTappedColor = color;
                if (colorTapCount === 5) {
                    brushSize = brushSize === 1 ? 5 : 1;
                    colorTapCount = 0;
                    lastPainted = '';
                    const label = document.getElementById('paintBrushSize');
                    if (label) {
                        label.hidden = false;
                        label.textContent = `Brush: ${brushSize} × ${brushSize}`;
                    }
                    const cursor = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25"><rect x="1.5" y="1.5" width="22" height="22" fill="none" stroke="white" stroke-width="3"/><rect x="1.5" y="1.5" width="22" height="22" fill="none" stroke="black"/></svg>';
                    canvas.style.cursor = brushSize === 5
                        ? `url("data:image/svg+xml,${encodeURIComponent(cursor)}") 12 12, crosshair`
                        : 'crosshair';
                }
                selectedColor = color;
                selectedSwatchEl.style.backgroundColor = color;
                paletteEl.querySelectorAll('.paint-swatch').forEach((s) => s.classList.remove('selected'));
                btn.classList.add('selected');
            });
            if (color === selectedColor) btn.classList.add('selected');
            paletteEl.appendChild(btn);
        });
        selectedSwatchEl.style.backgroundColor = selectedColor;
        // Any click outside the palette breaks the secret sequence, even when
        // a window control stops the event from bubbling.
        document.addEventListener('click', (event) => {
            if (!paletteEl.contains(event.target)) {
                lastTappedColor = '';
                colorTapCount = 0;
            }
        }, true);
    }

    function cellFromEvent(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = (e.clientX - rect.left) * scaleX;
        const py = (e.clientY - rect.top) * scaleY;
        return { x: Math.floor(px / CELL), y: Math.floor(py / CELL) };
    }

    function paintBrush(x, y) {
        if (x < 0 || x >= GRID || y < 0 || y >= GRID) return;
        const key = `${x},${y},${selectedColor},${brushSize}`;
        if (key === lastPainted) return;
        lastPainted = key;

        const radius = Math.floor(brushSize / 2);
        for (let px = Math.max(0, x - radius); px <= Math.min(GRID - 1, x + radius); px++) {
            for (let py = Math.max(0, y - radius); py <= Math.min(GRID - 1, y + radius); py++) {
                const row = { x: px, y: py, color: selectedColor, id: crypto.randomUUID() };
                if (pixels.get(pixelKey(row))?.color === selectedColor) continue;
                pending.set(pixelKey(row), row);
                // Keep every cell durable and use the same batched sync as the small pen.
                try {
                    localStorage.setItem(PENDING_PREFIX + pixelKey(row), JSON.stringify(row));
                } catch { storageFailed = true; }
                applyPixel(row);
            }
        }
        updateStatus();
        scheduleSave();
    }

    function attachCanvasHandlers() {
        canvas.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            painting = true;
            lastTappedColor = '';
            colorTapCount = 0;
            lastPainted = '';
            const { x, y } = cellFromEvent(e);
            paintBrush(x, y);
        });
        canvas.addEventListener('mousemove', (e) => {
            if (!painting) return;
            const { x, y } = cellFromEvent(e);
            paintBrush(x, y);
        });
        window.addEventListener('mouseup', () => {
            painting = false;
            lastPainted = '';
        });
        canvas.addEventListener('mouseleave', () => {
            lastPainted = '';
        });
        // Block the modal drag handler from hijacking canvas clicks
        canvas.addEventListener('click', (e) => e.stopPropagation());
    }

    async function loadCanvas() {
        if (!supabase) { updateStatus(); return; }
        if (loading) { reloadRequested = true; return; }
        loading = true;
        changesDuringLoad = new Map();
        updateStatus();
        try {
            const snapshot = new Map();
            // The API caps each response. Page in stable coordinate order to load
            // all 10,000 cells rather than silently truncating the shared canvas.
            const pageSize = 500;
            for (let offset = 0; offset < GRID * GRID; offset += pageSize) {
                const { data, error } = await supabase.from('pixels')
                    .select('x, y, color').order('x').order('y')
                    .range(offset, offset + pageSize - 1);
                if (error) throw error;
                data.filter(validPixel).forEach((row) => snapshot.set(pixelKey(row), row));
                if (data.length < pageSize) break;
            }
            // Loading must never paint an old snapshot over a stroke or live event.
            changesDuringLoad.forEach((row, key) => {
                if (row) snapshot.set(key, row);
                else snapshot.delete(key);
            });
            pending.forEach((row, key) => snapshot.set(key, row));
            pixels.clear();
            fillBackground();
            snapshot.forEach((row, key) => {
                pixels.set(key, { x: row.x, y: row.y, color: row.color });
                drawPixel(row.x, row.y, row.color);
            });
            cacheCanvas();
            loadFailed = false;
        } catch (error) {
            console.warn('Paint: could not refresh canvas', error);
            loadFailed = true;
        } finally {
            changesDuringLoad = null;
            loading = false;
            updateStatus();
            if (reloadRequested) {
                reloadRequested = false;
                loadCanvas();
            }
        }
    }

    function subscribeRealtime() {
        if (!supabase) return;
        supabase.channel('pixels-stream')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pixels' }, (payload) => {
                const row = payload.eventType === 'DELETE' ? payload.old : payload.new;
                if (!row || pending.has(pixelKey(row))) return;
                if (payload.eventType === 'DELETE') {
                    const key = pixelKey(row);
                    pixels.delete(key);
                    if (changesDuringLoad) changesDuringLoad.set(key, null);
                    drawPixel(row.x, row.y, '#FFFFFF');
                    cacheCanvas();
                } else applyPixel(row);
            })
            .subscribe((status) => {
                connected = status === 'SUBSCRIBED';
                updateStatus();
                if (connected) {
                    // Catch up after subscribing/reconnecting, closing the load/subscribe gap.
                    loadCanvas();
                    scheduleSave();
                }
            });
    }

    function initPaintApp() {
        if (initialized) return;

        canvas = document.getElementById('paintCanvas');
        ctx = canvas?.getContext('2d');
        paletteEl = document.getElementById('paintPalette');
        selectedSwatchEl = document.getElementById('paintSelectedSwatch');
        statusEl = document.getElementById('paintStatus');

        if (!canvas || !ctx || !paletteEl || !selectedSwatchEl || !statusEl) {
            console.error('Paint: missing DOM nodes');
            return;
        }

        initialized = true;

        if (window.supabase && typeof window.supabase.createClient === 'function') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                realtime: { params: { eventsPerSecond: 30 } },
            });
        } else {
            console.warn('Paint: Supabase library not loaded — painting locally only');
        }

        buildPalette();
        fillBackground();
        restoreCanvas();
        attachCanvasHandlers();
        attachSyncHandlers();
        scheduleSave();
        loadCanvas();
        subscribeRealtime();
    }

    function bootstrap() {
        const paintBtn = document.getElementById('paintBtn');
        const modal = document.getElementById('ModalPaint');
        if (!paintBtn || !modal) {
            console.error('Paint: paintBtn or ModalPaint not in DOM');
            return;
        }

        paintBtn.addEventListener('click', () => {
            if (paintBtn.dataset.wasDragged === 'true') return;
            modal.style.display = 'block';
            initPaintApp();
        });

        const closeBtn = document.getElementById('paintClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                modal.style.display = 'none';
            });
        }
        const minBtn = document.getElementById('paintMinimize');
        if (minBtn) {
            minBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                modal.style.display = 'none';
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
