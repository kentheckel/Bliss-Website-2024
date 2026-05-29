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
    let painting = false;
    let lastPainted = '';
    let initialized = false;

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
        PALETTE.forEach((color, i) => {
            const btn = document.createElement('button');
            btn.className = 'paint-swatch';
            btn.style.backgroundColor = color;
            btn.dataset.color = color;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedColor = color;
                selectedSwatchEl.style.backgroundColor = color;
                paletteEl.querySelectorAll('.paint-swatch').forEach((s) => s.classList.remove('selected'));
                btn.classList.add('selected');
            });
            if (color === selectedColor) btn.classList.add('selected');
            paletteEl.appendChild(btn);
        });
        selectedSwatchEl.style.backgroundColor = selectedColor;
    }

    function cellFromEvent(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = (e.clientX - rect.left) * scaleX;
        const py = (e.clientY - rect.top) * scaleY;
        return { x: Math.floor(px / CELL), y: Math.floor(py / CELL) };
    }

    async function paintCell(x, y) {
        if (x < 0 || x >= GRID || y < 0 || y >= GRID) return;
        const key = `${x},${y},${selectedColor}`;
        if (key === lastPainted) return;
        lastPainted = key;

        drawPixel(x, y, selectedColor);

        if (!supabase) return;
        const { error } = await supabase
            .from('pixels')
            .upsert({ x, y, color: selectedColor }, { onConflict: 'x,y' });
        if (error) {
            console.error('paint upsert failed', error);
            setStatus('Save failed', 'offline');
        }
    }

    function attachCanvasHandlers() {
        canvas.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            painting = true;
            lastPainted = '';
            const { x, y } = cellFromEvent(e);
            paintCell(x, y);
        });
        canvas.addEventListener('mousemove', (e) => {
            if (!painting) return;
            const { x, y } = cellFromEvent(e);
            paintCell(x, y);
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
        fillBackground();
        if (!supabase) {
            setStatus('Offline mode', 'offline');
            return;
        }
        setStatus('Loading...', null);
        const { data, error } = await supabase
            .from('pixels')
            .select('x, y, color');
        if (error) {
            console.error('load failed', error);
            setStatus('Offline — not syncing', 'offline');
            return;
        }
        data.forEach((p) => drawPixel(p.x, p.y, p.color));
        setStatus(`Live • ${data.length} painted`, 'connected');
    }

    function subscribeRealtime() {
        if (!supabase) return;
        supabase
            .channel('pixels-stream')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'pixels' },
                (payload) => {
                    const row = payload.new;
                    if (!row) return;
                    drawPixel(row.x, row.y, row.color);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setStatus('Live • painting together', 'connected');
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    setStatus('Reconnecting...', 'offline');
                }
            });
    }

    function initPaintApp() {
        if (initialized) return;
        initialized = true;

        canvas = document.getElementById('paintCanvas');
        ctx = canvas.getContext('2d');
        paletteEl = document.getElementById('paintPalette');
        selectedSwatchEl = document.getElementById('paintSelectedSwatch');
        statusEl = document.getElementById('paintStatus');

        if (!canvas || !ctx || !paletteEl || !selectedSwatchEl || !statusEl) {
            console.error('Paint: missing DOM nodes');
            return;
        }

        if (window.supabase && typeof window.supabase.createClient === 'function') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                realtime: { params: { eventsPerSecond: 30 } },
            });
        } else {
            console.warn('Paint: Supabase library not loaded — painting locally only');
        }

        buildPalette();
        fillBackground();
        attachCanvasHandlers();
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
