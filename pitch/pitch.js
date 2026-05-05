/* ============================================================
   ASFC PITCH.exe — Presentation OS
   Boot sequence, slide engine, ticker, taskbar.
   ============================================================ */

(() => {
  'use strict';

  /* ----------------------------------------------------------
     URL PARAMS — audience targeting + path presets + admin
     ---------------------------------------------------------- */
  const params = new URLSearchParams(window.location.search);
  const AUDIENCE = params.get('audience') || 'default'; // youtube|brand|team|athlete|default
  const TRACK    = params.get('track')    || null;       // athletes|teams|departments|null
  const SKIP_BOOT = params.get('skipboot') === '1';

  /* ----------------------------------------------------------
     BOOT SEQUENCE
     ---------------------------------------------------------- */
  const bootLines = [
    { text: 'ASFC BIOS v2.6.1 — Antisocial Friends Club Systems', cls: 'brand', delay: 60 },
    { text: 'Copyright (C) 2026 ASFC. All rights reserved.',                       delay: 60 },
    { text: '',                                                                     delay: 200 },
    { text: 'Detecting CPU................. CREATIVE_DIRECTOR @ 11+ years',         delay: 220 },
    { text: 'Detecting Memory.............. 1,000,000,000+ organic views',         delay: 220 },
    { text: 'Detecting Network............. 28 channels online',                   delay: 220 },
    { text: 'Detecting YouTube Crew........ MEMBER (1 of 20)',  cls: 'accent',     delay: 240 },
    { text: '',                                                                     delay: 200 },
    { text: 'Loading kernel modules:',                                              delay: 100 },
    { text: '  [OK] roster_monitor.sys',         cls: 'ok',                         delay: 120 },
    { text: '  [OK] league_benchmark.sys',       cls: 'ok',                         delay: 120 },
    { text: '  [OK] uptides_catalog.sys',        cls: 'ok',                         delay: 120 },
    { text: '  [OK] reverse_funnel.sys',         cls: 'ok',                         delay: 120 },
    { text: '  [OK] post_career_compounder.sys', cls: 'ok',                         delay: 180 },
    { text: '',                                                                     delay: 180 },
    { text: 'Mounting /team partition:',                                            delay: 100 },
    { text: '  [OK] kent_heckel.........CEO',                cls: 'ok',             delay: 90 },
    { text: '  [OK] jordyn_brooks.......Director of Ops',    cls: 'ok',             delay: 90 },
    { text: '  [OK] levi_rassmussen.....Lead Strategist',    cls: 'ok',             delay: 90 },
    { text: '  [OK] brendan_cole........Lead Strategist',    cls: 'ok',             delay: 90 },
    { text: '  [OK] brelan_butler.......Vertical Specialist',cls: 'ok',             delay: 90 },
    { text: '  [OK] spencer_lowder......Thumbnail Designer', cls: 'ok',             delay: 90 },
    { text: '  [OK] jake_groulx.........Vertical Specialist',cls: 'ok',             delay: 90 },
    { text: '  [OK] david_martin........Vertical Specialist',cls: 'ok',             delay: 140 },
    { text: '  > 8 humans online · scaling to 16-32 next 6-12 months', cls: 'warn', delay: 220 },
    { text: '',                                                                     delay: 200 },
    { text: 'Audience profile: ' + AUDIENCE.toUpperCase(),  cls: 'warn',           delay: 200 },
    { text: 'Track preset:     ' + (TRACK ? TRACK.toUpperCase() : 'NONE'),         delay: 200 },
    { text: '',                                                                     delay: 240 },
    { text: 'Mounting /pitch ............... ', append: 'OK', cls: 'ok',           delay: 220 },
    { text: 'Starting PITCH.exe ........... ', append: 'READY', cls: 'ok',         delay: 240 },
    { text: '',                                                                     delay: 300 },
    { text: '> launching desktop_', cls: 'brand', cursor: true,                    delay: 600 },
  ];

  const bootEl = document.getElementById('boot-text');
  const bootScreen = document.getElementById('boot-screen');
  const bootSkip = document.getElementById('boot-skip');
  const desktop = document.getElementById('desktop');
  let bootDone = false;

  function finishBoot() {
    if (bootDone) return;
    bootDone = true;
    bootScreen.style.transition = 'opacity 0.4s';
    bootScreen.style.opacity = '0';
    setTimeout(() => {
      bootScreen.classList.add('hidden');
      desktop.classList.remove('hidden');
      onDesktopReady();
    }, 400);
  }

  async function runBoot() {
    if (SKIP_BOOT) { finishBoot(); return; }
    for (const line of bootLines) {
      if (bootDone) return;
      const span = document.createElement('span');
      if (line.cls) span.className = line.cls;
      span.textContent = line.text;
      bootEl.appendChild(span);
      if (line.append) {
        await wait(line.delay);
        const tail = document.createElement('span');
        tail.className = line.cls || '';
        tail.textContent = line.append;
        bootEl.appendChild(tail);
      }
      if (line.cursor) {
        const c = document.createElement('span');
        c.className = 'cursor-blink';
        bootEl.appendChild(c);
      }
      bootEl.appendChild(document.createTextNode('\n'));
      await wait(line.delay);
    }
    await wait(800);
    finishBoot();
  }

  bootSkip.addEventListener('click', finishBoot);
  document.addEventListener('keydown', (e) => {
    if (!bootDone) finishBoot();
  }, { once: true });

  /* ----------------------------------------------------------
     DESKTOP READY — show icon, auto-launch deck
     ---------------------------------------------------------- */
  const pitchExeIcon = document.getElementById('pitchExeIcon');
  const deckWindow = document.getElementById('deck-window');
  const ticker = document.getElementById('ticker');

  function onDesktopReady() {
    // Hide the desktop icon — boot hands directly off to the deck now
    pitchExeIcon.style.display = 'none';
    startTicker();
    startClock();
    startCountdown();
    launchDeck();
  }

  pitchExeIcon.addEventListener('click', launchDeck);

  function launchDeck() {
    if (!deckWindow.classList.contains('hidden')) return;
    deckWindow.classList.remove('hidden');
    pitchExeIcon.classList.remove('pulse');
    renderChapterPips();
    showSlide(0);
  }

  /* ----------------------------------------------------------
     SLIDE REGISTRY — placeholder for slides we haven't built yet
     ---------------------------------------------------------- */
  const SLIDES = [
    { id: 'title',        title: 'Take YouTube to the Next Level', render: renderTitle },
    { id: 'who-we-are',   title: 'Who We Are',               render: renderWhoWeAre },
    { id: 'wins',         title: 'Proven Wins',              render: renderWins },
    { id: 'cs-spurs',     title: 'Case Study: Spurs',        render: renderSpurs },
    { id: 'cs-cam',       title: 'Case Study: Cam + Org',    render: renderCam },
    { id: 'cs-ocho',      title: 'How We Launch From 0',     render: renderOcho, optional: true },
    { id: 'post-career',  title: 'Post-Career Content Case Studies', render: renderPostCareer },
    { id: 'strategy',     title: 'The Reverse Funnel',       render: renderStrategy },
    { id: 'tools',        title: 'Proprietary Tools',        render: renderTools },
    { id: 'nil',          title: 'NIL Frameworks',           render: renderNIL },
    { id: 'wave',         title: 'The Untapped Wave',        render: renderWave },
    { id: 'work',         title: 'How We Work',              render: renderWork },
    { id: 'capacity',     title: 'Studio Capacity',          render: renderCapacity },
    { id: 'contact',      title: 'Contact',                  render: renderContact },
  ];

  document.getElementById('slide-total').textContent = SLIDES.length;

  let currentIdx = 0;
  const visited = new Set();

  function showSlide(idx) {
    if (idx < 0 || idx >= SLIDES.length) return;
    const stage = document.getElementById('slide-stage');

    // Nuke any lingering slides from prior rapid navigation. querySelector('.slide')
    // returns the FIRST match in DOM order, so a stale outgoing slide can hide the
    // real current one and leak past its 200ms removal timeout.
    stage.querySelectorAll('.slide.slide-out').forEach(s => s.remove());
    const liveSlides = stage.querySelectorAll('.slide:not(.slide-out)');

    const newSlideEl = document.createElement('section');
    newSlideEl.className = 'slide';
    newSlideEl.dataset.slideId = SLIDES[idx].id;
    SLIDES[idx].render(newSlideEl, idx);

    liveSlides.forEach(old => {
      old.classList.add('slide-out');
      setTimeout(() => old.remove(), 200);
    });
    stage.appendChild(newSlideEl);

    currentIdx = idx;
    visited.add(idx);
    document.getElementById('slide-current').textContent = idx + 1;
    document.getElementById('slide-title-display').textContent = SLIDES[idx].title;
    updateNavButtons();
    renderChapterPips();
  }

  function nextSlide() { showSlide(Math.min(currentIdx + 1, SLIDES.length - 1)); }
  function prevSlide() { showSlide(Math.max(currentIdx - 1, 0)); }

  function updateNavButtons() {
    document.getElementById('nav-prev').disabled = currentIdx === 0;
    document.getElementById('nav-next').disabled = currentIdx === SLIDES.length - 1;
  }

  function renderChapterPips() {
    const wrap = document.getElementById('nav-chapters');
    wrap.innerHTML = '';
    SLIDES.forEach((s, i) => {
      const pip = document.createElement('button');
      pip.className = 'chapter-pip';
      if (i === currentIdx) pip.classList.add('active');
      else if (visited.has(i)) pip.classList.add('visited');
      pip.textContent = i + 1;
      pip.title = s.title;
      pip.addEventListener('click', () => showSlide(i));
      wrap.appendChild(pip);
    });
  }

  document.getElementById('nav-next').addEventListener('click', nextSlide);
  document.getElementById('nav-prev').addEventListener('click', prevSlide);

  document.addEventListener('keydown', (e) => {
    if (deckWindow.classList.contains('hidden')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); nextSlide(); }
    if (e.key === 'ArrowLeft'  || e.key === 'PageUp')                    { e.preventDefault(); prevSlide(); }
    if (e.key === 'Home') showSlide(0);
    if (e.key === 'End')  showSlide(SLIDES.length - 1);
  });

  /* ----------------------------------------------------------
     WINDOW CHROME — minimize / maximize / close
     ---------------------------------------------------------- */
  document.getElementById('deck-minimize').addEventListener('click', () => {
    deckWindow.classList.add('hidden');
    addTaskbarWindow('ASFC_Pitch.exe', () => {
      deckWindow.classList.remove('hidden');
    });
  });

  document.getElementById('deck-maximize').addEventListener('click', () => {
    deckWindow.classList.toggle('maximized');
  });

  document.getElementById('deck-close').addEventListener('click', () => {
    runShutdown();
  });

  function runShutdown() {
    if (document.getElementById('shutdown-screen')) return;

    const overlay = document.createElement('div');
    overlay.id = 'shutdown-screen';
    overlay.innerHTML = `
      <div class="sd-stage sd-stage-1">
        <pre id="sd-log"></pre>
      </div>
      <div class="sd-stage sd-stage-2 hidden">
        <div class="sd-bluebox">
          <div class="sd-bluebox-title">▮ ASFC_Pitch.exe</div>
          <div class="sd-bluebox-body">
            Shutting down...
            <div class="sd-bar"><div class="sd-bar-fill"></div></div>
          </div>
        </div>
      </div>
      <div class="sd-stage sd-stage-3 hidden">
        <div class="sd-final">
          It is now safe to return to the desktop.
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const log = overlay.querySelector('#sd-log');
    const lines = [
      { text: '> close ASFC_Pitch.exe',                        cls: 'warn',   delay: 80  },
      { text: 'Saving session state ............. OK',          cls: 'ok',     delay: 220 },
      { text: 'Closing slide engine .............. OK',         cls: 'ok',     delay: 220 },
      { text: 'Unmounting /pitch ................. OK',         cls: 'ok',     delay: 240 },
      { text: 'Stopping ticker ................... OK',         cls: 'ok',     delay: 200 },
      { text: '',                                                              delay: 120 },
      { text: 'Returning to desktop...',                cls: 'brand',  delay: 320 },
    ];

    let i = 0;
    function step() {
      if (i >= lines.length) {
        setTimeout(toBlueScreen, 200);
        return;
      }
      const ln = lines[i++];
      const span = document.createElement('span');
      if (ln.cls) span.className = ln.cls;
      span.textContent = ln.text + '\n';
      log.appendChild(span);
      setTimeout(step, ln.delay);
    }
    step();

    function toBlueScreen() {
      overlay.querySelector('.sd-stage-1').classList.add('hidden');
      overlay.querySelector('.sd-stage-2').classList.remove('hidden');
      setTimeout(() => {
        overlay.querySelector('.sd-stage-2').classList.add('hidden');
        overlay.querySelector('.sd-stage-3').classList.remove('hidden');
        setTimeout(() => {
          window.location.href = '../';
        }, 850);
      }, 1400);
    }
  }

  function addTaskbarWindow(label, onClick) {
    const tb = document.getElementById('taskbar-windows');
    const btn = document.createElement('button');
    btn.className = 'taskbar-window-button';
    btn.innerHTML = `<span class="start-icon">▶</span> ${label}`;
    btn.addEventListener('click', () => {
      onClick();
      btn.remove();
    });
    tb.appendChild(btn);
  }

  /* ----------------------------------------------------------
     DRAGGABLE DECK WINDOW
     ---------------------------------------------------------- */
  (() => {
    const header = document.getElementById('deck-header');
    let dragging = false, startX, startY, startLeft, startTop;
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-buttons')) return;
      if (deckWindow.classList.contains('maximized')) return;
      dragging = true;
      const rect = deckWindow.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      startLeft = rect.left; startTop = rect.top;
      deckWindow.style.transform = 'none';
      deckWindow.style.left = startLeft + 'px';
      deckWindow.style.top = startTop + 'px';
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      deckWindow.style.left = (startLeft + e.clientX - startX) + 'px';
      deckWindow.style.top  = (startTop + e.clientY - startY) + 'px';
    });
    document.addEventListener('mouseup', () => { dragging = false; });
  })();

  /* ----------------------------------------------------------
     TICKER — live network stats
     ---------------------------------------------------------- */
  let stats = null;
  let liveTotal = 0;
  let liveLast30 = 0;
  let liveSubs = 0;
  let liveUploads = 0;
  let lastTick = Date.now();

  const FALLBACK_STATS = {
    totalViews: 2690410657,
    viewsLast30Days: 33068630,
    viewsPerSecond: 12.76,
    youtubeChannelCount: 12,
    socialChannelCount: 38,
    subscriberCount: 14250000,
    subscribersPerHour: 38,
    totalUploads: 12426,
    uploadsPerDay: 20,
    contentRevenueLifetime: 1000000,
    brandRevenueLifetime: 2000000,
  };

  async function loadStats() {
    try {
      const res = await fetch('data/network-stats.json?t=' + Date.now());
      stats = await res.json();
    } catch (e) {
      console.warn('Stats fetch failed, using fallback', e);
      stats = FALLBACK_STATS;
    }
    liveTotal   = stats.totalViews;
    liveLast30  = stats.viewsLast30Days;
    liveSubs    = stats.subscriberCount;
    liveUploads = stats.totalUploads;
    lastTick    = Date.now();
  }

  function fmt(n) {
    return Math.floor(n).toLocaleString('en-US');
  }

  function tickerHtml() {
    return `
      <span>📡 NETWORK TOTAL VIEWS:</span>
      <span class="num" data-live="total">${fmt(liveTotal)}</span>
      <span class="sep">▸</span>
      <span>LAST 30 DAYS:</span>
      <span class="num" data-live="last30">${fmt(liveLast30)}</span>
      <span class="sep">▸</span>
      <span>YOUTUBE CHANNELS:</span>
      <span class="num">${stats.youtubeChannelCount}</span>
      <span class="sep">▸</span>
      <span>SOCIAL CHANNELS:</span>
      <span class="num">${stats.socialChannelCount}</span>
      <span class="sep">▸</span>
      <span>NETWORK SUBSCRIBERS:</span>
      <span class="num" data-live="subs">${fmt(liveSubs)}</span>
      <span class="sep">▸</span>
      <span>TOTAL UPLOADS:</span>
      <span class="num" data-live="uploads">${fmt(liveUploads)}</span>
      <span class="sep">▸</span>
      <span>MEDIAN GROWTH:</span>
      <span class="num">+282%</span>
      <span class="sep">▸</span>
      <span>FLOOR GROWTH:</span>
      <span class="num">+22%</span>
      <span class="sep">▸</span>
      <span>STATUS:</span>
      <span class="num">COMPOUNDING</span>
      <span class="sep">▸▸▸</span>
    `;
  }

  function refreshTicker() {
    document.getElementById('ticker-content').innerHTML = tickerHtml() + tickerHtml();
  }

  function startTicker() {
    loadStats().then(() => {
      ticker.classList.remove('hidden');
      refreshTicker();
      // Increment live numbers between fetches
      setInterval(() => {
        const now = Date.now();
        const dt = (now - lastTick) / 1000;
        lastTick = now;
        liveTotal   += stats.viewsPerSecond * dt;
        liveLast30  += stats.viewsPerSecond * dt;
        liveSubs    += (stats.subscribersPerHour / 3600) * dt;
        liveUploads += (stats.uploadsPerDay / 86400) * dt;
        // Update inline live nodes (for places like the title slide)
        document.querySelectorAll('[data-live="total"]').forEach(el => el.textContent = fmt(liveTotal));
        document.querySelectorAll('[data-live="last30"]').forEach(el => el.textContent = fmt(liveLast30));
        document.querySelectorAll('[data-live="subs"]').forEach(el => el.textContent = fmt(liveSubs));
        document.querySelectorAll('[data-live="uploads"]').forEach(el => el.textContent = fmt(liveUploads));
      }, 200);
      // Re-render the marquee text every 30s so new totals appear
      setInterval(refreshTicker, 30000);
    });
  }

  /* ----------------------------------------------------------
     LA 2028 LIVE COUNTDOWN
     Updates any [data-countdown="days|hours|minutes|seconds"]
     node every second. Target: LA28 Opening Ceremony.
     ---------------------------------------------------------- */
  const LA28_OPENING = new Date('2028-07-14T20:00:00-07:00').getTime();
  function startCountdown() {
    function pad(n, w) { return String(Math.max(0, n)).padStart(w, '0'); }
    function tick() {
      const now = Date.now();
      let diff = Math.max(0, LA28_OPENING - now);
      const days = Math.floor(diff / 86400000); diff -= days * 86400000;
      const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
      const mins = Math.floor(diff / 60000);    diff -= mins * 60000;
      const secs = Math.floor(diff / 1000);
      document.querySelectorAll('[data-countdown="days"]').forEach(el => el.textContent = pad(days, 3));
      document.querySelectorAll('[data-countdown="hours"]').forEach(el => el.textContent = pad(hours, 2));
      document.querySelectorAll('[data-countdown="minutes"]').forEach(el => el.textContent = pad(mins, 2));
      document.querySelectorAll('[data-countdown="seconds"]').forEach(el => el.textContent = pad(secs, 2));
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ----------------------------------------------------------
     TASKBAR CLOCK
     ---------------------------------------------------------- */
  function startClock() {
    const el = document.getElementById('clock-time');
    function tick() {
      const d = new Date();
      const h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = ((h + 11) % 12) + 1;
      el.textContent = `${h12}:${m} ${ampm}`;
    }
    tick();
    setInterval(tick, 1000 * 30);
  }

  /* ==========================================================
     SLIDE RENDERERS
     ========================================================== */

  function renderTitle(el, idx) {
    el.classList.add('slide-title');
    el.innerHTML = `
      <div class="stamp">CONFIDENTIAL</div>
      <div class="eyebrow">Antisocial Friends Club</div>
      <h1>Let's take YouTube<br>to the next level.</h1>
      <div class="live-counter">
        <span class="label">▮ NETWORK TOTAL VIEWS · LIVE ▮</span>
        <span data-live="total">${fmt(liveTotal || 2690410657)}</span>
      </div>
      <div class="cta-press">▸ press → to begin ◂</div>
      <div class="footer-meta">ASFC PRESENTATION OS v2.0 · ${new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric'})}</div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE 3 — WHO WE ARE (System Specs)
     ---------------------------------------------------------- */
  function renderWhoWeAre(el) {
    el.classList.add('slide-specs');
    el.innerHTML = `
      <div class="specs-header">
        <div class="eyebrow">▮ SYSTEM > ABOUT</div>
        <h1>We've been doing this<br>for 12 years.</h1>
      </div>

      <div class="specs-body">
        <!-- LEFT: single-column spec panel -->
        <div class="specs-left">
          <div class="pane-eyebrow">▮ NETWORK STATS ▮</div>
          <div class="spec-panel">
            <div class="row"><span class="label">EXPERIENCE</span><span class="value">12 YEARS</span></div>
            <div class="row organic-row">
              <span class="label">ORGANIC VIEWS</span>
              <span class="value organic-value">
                <span class="organic-line"><span class="organic-num" data-live="total">${fmt(liveTotal || 2690410657)}</span><span class="organic-tag">all-time</span></span>
                <span class="organic-line"><span class="organic-num" data-live="last30">${fmt(liveLast30 || 33068630)}</span><span class="organic-tag">last 30 days</span></span>
              </span>
            </div>
            <div class="row"><span class="label">TOTAL UPLOADS</span><span class="value" data-live="uploads">${fmt(liveUploads || 12426)}</span></div>
            <div class="row"><span class="label">CREATORS SERVED</span><span class="value">70+</span></div>
            <div class="row"><span class="label">CONTENT REVENUE</span><span class="value">$1,000,000+</span></div>
            <div class="row"><span class="label">BRAND REVENUE</span><span class="value">$2,000,000+</span></div>
            <div class="row">
              <span class="label">YT SILVER PLAQUES</span>
              <span class="value plaque-value">
                <span class="plaque-strip">${'<span class="plaque-mini silver"></span>'.repeat(11)}</span>
                <span class="plaque-num">×11</span>
              </span>
            </div>
            <div class="row no-border">
              <span class="label">YT GOLD PLAQUES</span>
              <span class="value plaque-value">
                <span class="plaque-strip">${'<span class="plaque-mini gold"></span>'.repeat(2)}</span>
                <span class="plaque-num">×2</span>
              </span>
            </div>
          </div>

          <div class="growth-panel">
            <div class="growth-eyebrow">▮ GROWTH METRICS ▮</div>
            <div class="growth-row">
              <div class="growth-cell">
                <div class="growth-num">+282%</div>
                <div class="growth-lbl">MEDIAN GROWTH<br><span class="growth-sub">start-to-now</span></div>
              </div>
              <div class="growth-cell">
                <div class="growth-num">+22%</div>
                <div class="growth-lbl">FLOOR GROWTH<br><span class="growth-sub">network-wide</span></div>
              </div>
              <div class="growth-cell">
                <div class="growth-num">~3 mos</div>
                <div class="growth-lbl">TO 1M-VIEW MO.<br><span class="growth-sub">launch avg</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: vertical journey, BIG -->
        <div class="specs-right">
          <div class="pane-eyebrow">▮ THE JOURNEY ▮</div>
          <div class="journey-pane">
            <div class="journey-v">
              <div class="stage-v">
                <div class="stage-num">01</div>
                <div>
                  <div class="stage-title">1,074 daily vlogs</div>
                  <div class="stage-sub">personal channel · the obsession</div>
                </div>
              </div>
              <div class="arrow-v">▼</div>

              <div class="stage-v">
                <div class="stage-num">02</div>
                <div>
                  <div class="stage-title">1.5 yrs daily vlog</div>
                  <div class="stage-sub">for a tech founder</div>
                </div>
              </div>
              <div class="arrow-v">▼</div>

              <div class="stage-v">
                <div class="stage-num">03</div>
                <div>
                  <div class="stage-title">Freelance YouTube editor</div>
                  <div class="stage-sub">for top creators</div>
                </div>
              </div>
              <div class="arrow-v">▼</div>

              <div class="stage-v">
                <div class="stage-num">04</div>
                <div>
                  <div class="stage-title">YouTube Strategist</div>
                  <div class="stage-sub">YouTube preferred vendor</div>
                </div>
              </div>
              <div class="arrow-v">▼</div>

              <div class="stage-v">
                <div class="stage-num">05</div>
                <div>
                  <div class="stage-title">YouTube Director</div>
                  <div class="stage-sub">3 years directing YouTube team for former NFL player</div>
                </div>
              </div>
              <div class="arrow-v">▼</div>

              <div class="stage-v current">
                <div class="stage-num">06</div>
                <div>
                  <div class="stage-title">ASFC LAUNCH</div>
                  <div class="stage-sub">▶ present day · still compounding</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE 4 — PROVEN WINS (stat card grid)
     ---------------------------------------------------------- */
  const WINS = [
    { name: 'San Antonio Spurs',     stat: '17th → 1st',           detail: 'Biggest jump of any team in 2025-2026 NBA season',             featured: true,  app: 'NBA_Rank.exe',
      url: 'https://www.youtube.com/@spurs' },
    { name: 'Cam Newton',            stat: '500K → 42M /mo',       detail: 'Monthly views · 3 yrs · $0 → $1M+ brand',                     featured: true, app: 'CamChannel.exe',
      url: 'https://www.youtube.com/@CamNewton',
      extras: [{ label: '4th & 1', url: 'https://www.youtube.com/@4thand1CamNewton' }] },
    { name: 'All The Smoke Network', stat: '4M → 50M /mo',         detail: 'Monthly network views across 6 podcasts',                      app: 'AllTheSmoke.exe',
      url: 'https://www.youtube.com/@AllTheSmokeProductions',
      extras: [
        { label: 'ATS Fight',        url: 'https://www.youtube.com/@ATSFight' },
        { label: 'KG Certified',     url: 'https://www.youtube.com/@KGCertified' },
        { label: 'Ring Champs',      url: 'https://www.youtube.com/@RingChampsPodcast' },
        { label: 'Anik & Florian',   url: 'https://www.youtube.com/@AnikFlorianPodcast' },
        { label: 'Morning Kombat',   url: 'https://www.youtube.com/@MorningKombat' },
      ] },
    { name: 'Ochocinco Soccer Pod',  stat: '5.5M opening wknd',    detail: 'New podcast, new sport, new audience',                         app: 'Ochocinco.exe',
      url: 'https://www.youtube.com/@thelaterunshow' },
    { name: 'Jim Gaffigan',          stat: '62M views',            detail: '$415K content rev in 6 months',                                app: 'Gaffigan.exe',
      url: 'https://www.youtube.com/@jimgaffigan' },
    { name: 'Build-A-Bear Workshop', stat: '1M KPI → 2M delivered',detail: 'Original animated kids series · 2× target',                    app: 'BuildABear.exe',
      url: 'https://www.youtube.com/@buildabear' },
    { name: 'ASFC Network',          stat: '2.69B+ views',         detail: '28 channels · 33M views / 30d · still compounding',            app: 'Network.exe' },
  ];

  function renderWins(el) {
    el.classList.add('slide-wins');
    el.innerHTML = `
      <h1>The receipts.</h1>
      <div class="subtitle">▸ ▸ ▸ &nbsp; PROVEN_WINS.exe &nbsp; ◂ ◂ ◂</div>
      <div class="wins-grid">
        ${WINS.map(w => {
          const arrow = w.url ? ' <span class="win-name-arrow">↗</span>' : '';
          const extrasHTML = w.extras && w.extras.length
            ? `<div class="win-extras">${w.extras.map(x => `<a class="win-extra" href="${x.url}" target="_blank" rel="noopener">+ ${x.label}</a>`).join('')}</div>`
            : '';
          const cardClass = `win-card${w.featured ? ' featured' : ''}${w.url ? ' linked' : ''}`;
          return `
          <div class="${cardClass}"${w.url ? ` data-url="${w.url}"` : ''}>
            <div class="win-header">
              <span>${w.app}</span>
              <span class="x">×</span>
            </div>
            <div class="win-body">
              <div class="win-name">${w.name}${arrow}</div>
              <div class="win-stat">${w.stat}</div>
              <div class="win-detail">${w.detail}</div>
              ${extrasHTML}
            </div>
          </div>
        `;}).join('')}
      </div>
      <div class="wins-footer">
        <strong>★</strong> next two slides are deep dives on the gold-bordered ones <strong>★</strong>
      </div>
    `;

    el.querySelectorAll('.win-card.linked').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.win-extra')) return;
        const url = card.getAttribute('data-url');
        if (url) window.open(url, '_blank', 'noopener');
      });
    });
  }

  /* ----------------------------------------------------------
     SLIDE 5a — SPURS DEEP DIVE
     ---------------------------------------------------------- */
  function renderSpurs(el) {
    el.classList.add('slide-spurs');
    // NBA OVERALL: 19 -> 4 (partial fill on a 19→1 scale = ~83.3%)
    // YOUTUBE:     17 -> 1 (full fill)
    const nbaFill = ((19 - 4) / (19 - 1)) * 100;

    // Inline platform glyphs (monochrome, currentColor)
    const PLAT_SVG = {
      x: '<svg viewBox="0 0 16 16" class="plat-logo" aria-hidden="true"><path d="M2.5 2.5L13.5 13.5M13.5 2.5L2.5 13.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>',
      ig: '<svg viewBox="0 0 16 16" class="plat-logo" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="8" cy="8" r="2.8" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="11.5" cy="4.5" r="0.9" fill="currentColor"/></svg>',
      tt: '<svg viewBox="0 0 16 16" class="plat-logo" aria-hidden="true"><path d="M9.4 1.5v8.7a2.4 2.4 0 1 1-2.4-2.4v1.7a.7.7 0 1 0 .7.7V1.5h1.7a2.6 2.6 0 0 0 2.6 2.6v1.7a4.3 4.3 0 0 1-2.6-.9" fill="currentColor"/></svg>',
      yt: '<svg viewBox="0 0 16 16" class="plat-logo" aria-hidden="true"><rect x="1.2" y="3.6" width="13.6" height="8.8" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><polygon points="6.5,5.8 6.5,10.2 10.6,8" fill="currentColor"/></svg>',
      fb: '<svg viewBox="0 0 16 16" class="plat-logo" aria-hidden="true"><circle cx="8" cy="8" r="6.6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M9.2 5.4V6.6h1.6l-.2 1.6H9.2V13H7.5V8.2H6.3V6.6h1.2V5.2c0-1 .6-1.7 1.7-1.7h1.5v1.6H9.7c-.3 0-.5.2-.5.4z" fill="currentColor"/></svg>',
    };

    // YoY view deltas (May '24→'25 vs May '25→'26), generalized + animated
    // X:  2.2M    -> 44.49M   ≈ +42M   video views
    // IG: 138.62M -> 1.73B    ≈ +1.6B  media views (rounded conservative: +1.5B)
    // TT: 115.39M -> 140.21M  ≈ +25M   video views
    // YT: 11.67M  -> 75.74M   ≈ +64M   video views
    // FB: 518.99M -> 1.33B    ≈ +800M  media views
    // Aggregate: ~+2.5B+ views YoY across platforms

    el.innerHTML = `
      <div class="spurs-header">
        <div class="hdr-left">
          <div class="eyebrow">▮ CASE STUDY · 01 ▮</div>
          <h1>San Antonio Spurs</h1>
          <p class="spurs-quote">"Biggest social jump of any team in the 2025–2026 NBA season."</p>
        </div>
      </div>

      <div class="rank-stack">
        <div class="rank-dates">
          <div class="rd-label">RANK SOURCE</div>
          <div class="rd-start">MAY 2025</div>
          <div class="rd-end">MAY 2026</div>
        </div>
        <div class="rank-row nba">
          <div class="rank-meta">
            <span class="rm-top">NBA OVERALL</span>
            <span class="rm-bot">SOCIAL RANK</span>
          </div>
          <div class="rank-pill start">19<span class="ord">th</span></div>
          <div class="rank-bar">
            <div class="rank-bar-fill" style="--fill:${nbaFill.toFixed(1)}%"></div>
            <div class="rank-bar-tick" style="left:${nbaFill.toFixed(1)}%"></div>
          </div>
          <div class="rank-pill end">4<span class="ord">th</span></div>
        </div>
        <div class="rank-row yt">
          <div class="rank-meta">
            <span class="rm-top">YOUTUBE</span>
            <span class="rm-bot">RANK</span>
          </div>
          <div class="rank-pill start">17<span class="ord">th</span></div>
          <div class="rank-bar">
            <div class="rank-bar-fill" style="--fill:100%"></div>
          </div>
          <div class="rank-pill end">1<span class="ord">st</span></div>
        </div>
      </div>

      <div class="spurs-mid spurs-mid-2col">
        <div class="spurs-scope">
          <div class="sc-head">
            <span class="sc-tag">▮ THE WORK ▮</span>
            <span class="sc-sub">Inputs → outcomes</span>
          </div>
          <ul class="sc-list">
            <li>
              <span class="sc-title">2025-26 season social strategy</span>
              <span class="sc-outcome">→ #19 → #4 NBA ranking</span>
            </li>
            <li>
              <span class="sc-title">Reverse-funnel content workflow</span>
              <span class="sc-outcome">→ 8,514 posts pre-ASFC → 21,602 in the ASFC era</span>
            </li>
            <li>
              <span class="sc-title">Interim social lead</span>
              <span class="sc-outcome">→ more than consulting; ran the team end-of-season into playoffs</span>
            </li>
          </ul>
        </div>

        <div class="spurs-strategies">
          <div class="ss-head">
            <span class="ss-tag">▮ STRATEGIES BUILT ▮</span>
            <span class="ss-sub">Season-long playbook · tentpole-by-tentpole</span>
          </div>
          <ul class="ss-list">
            <li><span class="ss-bullet">▸</span><span class="ss-title">2025–26 NBA Season</span></li>
            <li><span class="ss-bullet">▸</span><span class="ss-title">NBA Cup</span></li>
            <li><span class="ss-bullet">▸</span><span class="ss-title">NBA All-Star Week</span></li>
            <li><span class="ss-bullet">▸</span><span class="ss-title">Spurs Paris Week</span></li>
            <li><span class="ss-bullet">▸</span><span class="ss-title">Spurs Austin Week</span></li>
            <li><span class="ss-bullet">▸</span><span class="ss-title">NBA Playoffs</span></li>
          </ul>
        </div>
      </div>

      <div class="spurs-footer">
        <div class="sf-label">
          <span class="sf-l-tag">▮ YEAR-OVER-YEAR VIEW GROWTH ▮</span>
          <span class="sf-total"><span class="sf-tnum" data-counter="2.5e9" data-format="bplus">+0</span> views YoY across platforms</span>
        </div>
        <div class="sf-grid">
          <a class="sf-cell" href="https://x.com/spurs" target="_blank" rel="noopener">
            <span class="sf-plat">${PLAT_SVG.x}<span class="sf-pname">X</span><span class="sf-arrow">↗</span></span>
            <span class="sf-num" data-counter="42e6" data-format="m">+0</span>
            <span class="sf-kind">video views</span>
          </a>
          <a class="sf-cell" href="https://instagram.com/spurs" target="_blank" rel="noopener">
            <span class="sf-plat">${PLAT_SVG.ig}<span class="sf-pname">Instagram</span><span class="sf-arrow">↗</span></span>
            <span class="sf-num" data-counter="1.5e9" data-format="b">+0</span>
            <span class="sf-kind">media views</span>
          </a>
          <a class="sf-cell" href="https://tiktok.com/@spurs" target="_blank" rel="noopener">
            <span class="sf-plat">${PLAT_SVG.tt}<span class="sf-pname">TikTok</span><span class="sf-arrow">↗</span></span>
            <span class="sf-num" data-counter="25e6" data-format="m">+0</span>
            <span class="sf-kind">video views</span>
          </a>
          <a class="sf-cell" href="https://youtube.com/@spurs" target="_blank" rel="noopener">
            <span class="sf-plat">${PLAT_SVG.yt}<span class="sf-pname">YouTube</span><span class="sf-arrow">↗</span></span>
            <span class="sf-num" data-counter="64e6" data-format="m">+0</span>
            <span class="sf-kind">video views</span>
          </a>
          <a class="sf-cell" href="https://facebook.com/sanantoniospurs" target="_blank" rel="noopener">
            <span class="sf-plat">${PLAT_SVG.fb}<span class="sf-pname">Facebook</span><span class="sf-arrow">↗</span></span>
            <span class="sf-num" data-counter="800e6" data-format="m">+0</span>
            <span class="sf-kind">media views</span>
          </a>
        </div>
      </div>
    `;

    // Animate count-up for YoY deltas
    const fmt = (n, f) => {
      if (f === 'bplus') return '+' + (n / 1e9).toFixed(1) + 'B';
      if (f === 'b')     return '+' + (n / 1e9).toFixed(1) + 'B';
      if (f === 'm')     return '+' + Math.round(n / 1e6) + 'M';
      return '+' + Math.round(n).toLocaleString('en-US');
    };
    const counters = el.querySelectorAll('[data-counter]');
    const duration = 1400;
    const startTs = performance.now() + 250; // small delay so the slide-in animation finishes
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    function step(now) {
      const t = Math.max(0, Math.min(1, (now - startTs) / duration));
      const e = easeOut(t);
      counters.forEach(c => {
        const target = parseFloat(c.dataset.counter);
        const f = c.dataset.format;
        c.textContent = fmt(target * e, f);
      });
      if (t < 1 && el.isConnected) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ----------------------------------------------------------
     SLIDE 5b — CAM NEWTON + KENT LEADERSHIP
     ---------------------------------------------------------- */
  function renderCam(el) {
    el.classList.add('slide-cam');

    // Real monthly YouTube views (May 2023 → Dec 2024) — for inline sparklines.
    const flagshipMonthly = [11.0,7.2,10.3,10.3,14.1,14.9,35.3,43.7,26.9,23.3,9.8,10.6,12.3,6.0,7.9,8.7,6.7,8.6,6.7,5.0];
    const fourth1Monthly  = [0,0,0,0,0,0,0.06,0.35,1.85,4.81,2.42,1.64,1.52,1.37,4.57,13.69,22.42,15.30,18.56,11.80];
    const liveMonthly     = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1.45,1.94,0.50,0.46,0.11,0.17];

    function spark(values, color) {
      const w = 120, h = 26;
      const max = Math.max(...values);
      const min = 0;
      const range = (max - min) || 1;
      const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 2) - 1;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      const area = `0,${h} ${pts} ${w},${h}`;
      return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <polygon points="${area}" fill="${color}" fill-opacity="0.18" />
        <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" />
      </svg>`;
    }

    el.innerHTML = `
      <div class="cam-header">
        <div class="eyebrow">▮ CASE STUDY · 02 ▮</div>
        <h1>Cam Newton</h1>
        <div class="cam-subhead">
          Inherited <strong>1 channel · 3 shows · 3 audiences</strong> — split into a <strong>3-channel network</strong>, each packaged for its own algorithm.
        </div>
      </div>

      <div class="cam-top">
        <div class="cam-split">
          <div class="split-before">
            <div class="split-tag">BEFORE</div>
            <div class="split-card split-card-mono">
              <div class="split-card-title">▶ CAM NEWTON</div>
              <div class="split-card-sub">pop culture · sports · live</div>
              <div class="split-card-warn">3 audiences · 1 feed</div>
            </div>
          </div>

          <div class="split-arrow">→</div>

          <div class="split-after">
            <div class="split-tag">AFTER · 3 CHANNELS</div>
            <div class="split-after-stack">
              <div class="split-card split-card-after">
                <div class="split-card-row">
                  <div class="split-card-title">▶ CAM NEWTON</div>
                  <div class="split-card-total">279.4M</div>
                </div>
                ${spark(flagshipMonthly, '#80d0ff')}
                <div class="split-card-sub">Pop-culture flagship</div>
              </div>
              <div class="split-card split-card-after split-card-launch">
                <div class="split-card-row">
                  <div class="split-card-title">▶ 4TH &amp; 1 <span class="launch-badge">LAUNCHED</span></div>
                  <div class="split-card-total">100.4M</div>
                </div>
                ${spark(fourth1Monthly, '#00ff66')}
                <div class="split-card-sub">Sports — from zero</div>
              </div>
              <div class="split-card split-card-after split-card-launch">
                <div class="split-card-row">
                  <div class="split-card-title">▶ CAM NEWTON LIVE <span class="launch-badge">LAUNCHED</span></div>
                  <div class="split-card-total">4.6M</div>
                </div>
                ${spark(liveMonthly, '#00ff66')}
                <div class="split-card-sub">Streaming — gaming &amp; live</div>
              </div>
            </div>
            <div class="split-after-foot">YouTube views · May '23 → Dec '24</div>
          </div>
        </div>

        <div class="cam-pane cam-highlights">
          <div class="cam-h-eyebrow">▸ HIGHLIGHTS</div>
          <ul class="cam-highlights-list">
            <li><strong>Launched 4th &amp; 1 from zero</strong> — 227.5M Y1 views · 900K Y1 followers</li>
            <li><strong>120+ videos / month</strong> at peak cadence</li>
            <li><strong>Biggest horizontal: 11M views</strong> · biggest Short: 10M views</li>
          </ul>
        </div>
      </div>

      <div class="cam-results-row">
        <div class="cam-result-box">
          <div class="crb-label">MONTHLY VIEWS</div>
          <div class="crb-stat">
            <span class="crb-num">500K</span>
            <span class="crb-arrow">→</span>
            <span class="crb-num crb-num-after">42.4M</span>
          </div>
        </div>
        <div class="cam-result-box">
          <div class="crb-label">CONTENT REV / MO</div>
          <div class="crb-stat">
            <span class="crb-num">$3K</span>
            <span class="crb-arrow">→</span>
            <span class="crb-num crb-num-after">$87K</span>
          </div>
        </div>
        <div class="cam-result-box">
          <div class="crb-label">BRAND REV</div>
          <div class="crb-stat">
            <span class="crb-num">$0</span>
            <span class="crb-arrow">→</span>
            <span class="crb-num crb-num-after">$1M+</span>
          </div>
        </div>
      </div>

      <div class="cam-meta-row">
        <span class="cmr-pill"><strong>1B+</strong> lifetime organic views</span>
        <span class="cmr-pill"><strong>82M</strong> peak month</span>
        <span class="cmr-pill"><strong>3 yrs</strong> tenure</span>
      </div>

      <div class="cam-bottom-callout">
        Keep the main thing the main thing<span class="callout-dots">...</span> <strong>YouTube.</strong>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE 5c — LAUNCH FRAMEWORK ("THE PILLOW")
     ---------------------------------------------------------- */
  function renderOcho(el) {
    el.classList.add('slide-ocho');

    // Sparklines — every show starts at 0 (pre-launch) and ramps up
    // Late Run Show — opening-window cumulative views (M), Day 0 → opening peak
    const lateRunRamp     = [0, 0.3, 0.9, 2.0, 3.7, 5.5];
    // 4th & 1: pre-launch + Nov '23 → Jul '24 monthly YT views (M)
    const fourth1Ramp     = [0, 0.06, 0.35, 1.85, 4.81, 2.42, 1.64, 1.52, 1.37, 4.57];
    // Ring Champs: pre-launch + Jan '25 → Dec '25 monthly YT views (M)
    const ringChampsRamp  = [0, 0.002, 0.002, 0.22, 0.08, 0.24, 2.15, 7.73, 3.82, 3.06, 0.61, 1.08, 0.88];

    function spark(values, color) {
      const w = 140, h = 38;
      const max = Math.max(...values);
      const range = max || 1;
      const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - (v / range) * (h - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      const area = `0,${h} ${pts} ${w},${h}`;
      return `<svg class="ocho-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <polygon points="${area}" fill="${color}" fill-opacity="0.22" />
        <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" />
      </svg>`;
    }

    el.innerHTML = `
      <div class="ocho-head">
        <div class="eyebrow">▮ CASE STUDY · 03 (OPTIONAL) — LAUNCH FRAMEWORK ▮</div>
        <h1>How we launch from <span class="zero">0</span>.</h1>
        <div class="ocho-sub">
          We call it <strong>"The Pillow."</strong> Prime the channel with content so the algorithm
          knows you and knows your audience. Pack a launch-week stockpile, then fire content out of a machine gun.
        </div>
      </div>

      <!-- THREE-PHASE PILLOW FRAMEWORK -->
      <div class="pillow-frame">
        <div class="pillow-arrow-bg"></div>
        <div class="pillow-phase">
          <div class="pp-head">
            <div class="pp-num">01</div>
            <div class="pp-headings">
              <div class="pp-name">PRIME</div>
              <div class="pp-tag">fluff the pillow</div>
            </div>
          </div>
          <div class="pp-body">Prime the channel with a few weeks of content in the run-up to launch.</div>
        </div>
        <div class="pillow-phase">
          <div class="pp-head">
            <div class="pp-num">02</div>
            <div class="pp-headings">
              <div class="pp-name">PACK</div>
              <div class="pp-tag">stockpile the drop</div>
            </div>
          </div>
          <div class="pp-body">Bank a multi-week library of episodes and begin a steady, consistent rollout — followed by copious supplementary content.</div>
        </div>
        <div class="pillow-phase">
          <div class="pp-head">
            <div class="pp-num">03</div>
            <div class="pp-headings">
              <div class="pp-name">POUND</div>
              <div class="pp-tag">machine-gun output</div>
            </div>
          </div>
          <div class="pp-body">Multi-format daily releases across all social channels.</div>
        </div>
      </div>

      <!-- THREE LAUNCH CARDS — proven-wins style -->
      <div class="ocho-launches">
        <a class="launch-card linked" href="https://www.youtube.com/@thelaterunshow" target="_blank" rel="noopener">
          <div class="lc-header">
            <span>LateRunShow.exe</span>
            <span class="x">×</span>
          </div>
          <div class="lc-body">
            <div class="lc-name">The Late Run Show <span class="win-name-arrow">↗</span></div>
            <div class="lc-host">Chad "Ochocinco" Johnson · soccer pod</div>
            <div class="lc-stat">5.5M opening weekend</div>
            <div class="lc-spark-wrap">${spark(lateRunRamp, '#ff6b00')}</div>
            <div class="lc-meta">
              <span><strong>0</strong> → 5.5M / weekend</span>
              <span>cold start · new sport</span>
            </div>
            <div class="lc-detail">New genre, no warm soccer audience. Packaged YT-native, sequenced around Chad's existing distribution, dropped a stockpile in 72 hours.</div>
          </div>
        </a>

        <a class="launch-card linked" href="https://www.youtube.com/@4thand1CamNewton" target="_blank" rel="noopener">
          <div class="lc-header">
            <span>4thAnd1.exe</span>
            <span class="x">×</span>
          </div>
          <div class="lc-body">
            <div class="lc-name">4th &amp; 1 <span class="win-name-arrow">↗</span></div>
            <div class="lc-host">Cam Newton · NFL podcast</div>
            <div class="lc-stat">0 → 4.8M / mo · 4 mos</div>
            <div class="lc-spark-wrap">${spark(fourth1Ramp, '#0044c2')}</div>
            <div class="lc-meta">
              <span><strong>Nov '23</strong> launch</span>
              <span>100M+ views year one</span>
            </div>
            <div class="lc-detail">Spun out of Cam's flagship to give NFL fans their own room. Hit nearly 5M monthly views by month four — the fastest ramp of any sub-channel we've launched.</div>
          </div>
        </a>

        <a class="launch-card linked" href="https://www.youtube.com/@RingChampsPodcast" target="_blank" rel="noopener">
          <div class="lc-header">
            <span>RingChamps.exe</span>
            <span class="x">×</span>
          </div>
          <div class="lc-body">
            <div class="lc-name">Ring Champs <span class="win-name-arrow">↗</span></div>
            <div class="lc-host">All The Smoke Network · boxing</div>
            <div class="lc-stat">2K → 7.7M / mo</div>
            <div class="lc-spark-wrap">${spark(ringChampsRamp, '#7b2cbf')}</div>
            <div class="lc-meta">
              <span><strong>Jan '25</strong> launch</span>
              <span>19.9M YT views in 2025</span>
            </div>
            <div class="lc-detail">5 months of priming, then a packed launch window in June-July. The algorithm tipped — single month went from 240K to 7.7M views.</div>
          </div>
        </a>
      </div>

      <div class="ocho-closer">
        <span class="oc-stat">3 launches</span>
        <span class="oc-dot">·</span>
        <span class="oc-stat">3 sports</span>
        <span class="oc-dot">·</span>
        <span class="oc-stat">3 KPI clears</span>
        <span class="oc-dot">·</span>
        <span class="oc-stat">$0 paid spend</span>
        <span class="oc-bar">▶</span>
        <span class="oc-tag">Same playbook every time.</span>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE 6 — POST-CAREER PROOF (Corkboard)
     ---------------------------------------------------------- */
  function renderPostCareer(el) {
    el.classList.add('slide-postcareer');
    el.innerHTML = `
      <div class="eyebrow">▮ THE 30-YEAR FLEX ▮</div>
      <h1>The career is just beginning when you walk off the field.</h1>

      <div class="polaroid-row">
        <div class="polaroid">
          <div class="photo">
            <img src="images/patbanner.jpg" alt="The Pat McAfee Show">
            <div class="role">PUNTER ▸ MOGUL</div>
          </div>
          <div class="caption">
            Retired punter → 9-figure media biz → ESPN deal. Channel still compounding daily.
          </div>
        </div>

        <div class="polaroid">
          <div class="photo photo-split">
            <img src="images/shayshay.jpg" alt="Club Shay Shay">
            <img src="images/nightcap.jpg" alt="Nightcap">
            <div class="role">TE ▸ MEDIA EMPIRE</div>
          </div>
          <div class="caption">
            HOF tight end → two top-20 podcasts → owns his audience. Two shows, one cultural reset.
          </div>
        </div>

        <div class="polaroid">
          <div class="photo">
            <img src="images/520.jpg" alt="Club 520">
            <div class="role">PG ▸ VOICE</div>
          </div>
          <div class="caption">
            Quiet veteran → most-watched basketball voice on YouTube. The channel is the second career.
          </div>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-card">
          <div class="stat-card-header">
            ▶ THE PAT McAFEE SHOW
            <div class="chart-badge">#13 YT PODCAST CHART</div>
          </div>
          <div class="stat-grid">
            <div class="stat-item"><div class="stat-num">2.99M</div><div class="stat-label">subs</div></div>
            <div class="stat-item"><div class="stat-num">2.5B</div><div class="stat-label">total views</div></div>
            <div class="stat-item"><div class="stat-num">13.9M</div><div class="stat-label">views / 28d</div></div>
            <div class="stat-item"><div class="stat-num">$15K–$44K</div><div class="stat-label">est. rev / 28d</div></div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            ▶ SHAY SHAY + NIGHTCAP <span class="stat-card-sub">(combined)</span>
            <div class="chart-badge">#12 &amp; #17 YT PODCAST CHART</div>
          </div>
          <div class="stat-grid">
            <div class="stat-item"><div class="stat-num">6.24M</div><div class="stat-label">subs</div></div>
            <div class="stat-item"><div class="stat-num">2.19B</div><div class="stat-label">total views</div></div>
            <div class="stat-item"><div class="stat-num">45.5M</div><div class="stat-label">views / 28d</div></div>
            <div class="stat-item"><div class="stat-num">$81K–$228K</div><div class="stat-label">est. rev / 28d</div></div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">▶ CLUB 520 PODCAST</div>
          <div class="stat-grid">
            <div class="stat-item"><div class="stat-num">831K</div><div class="stat-label">subs</div></div>
            <div class="stat-item"><div class="stat-num">507M</div><div class="stat-label">total views</div></div>
            <div class="stat-item"><div class="stat-num">16M</div><div class="stat-label">views / 28d</div></div>
            <div class="stat-item"><div class="stat-num">$20K–$57K</div><div class="stat-label">est. rev / 28d</div></div>
          </div>
        </div>
      </div>

      <div class="postcareer-bottom">
        Athletes <strong>own their voices</strong> and are more in control of their stories than ever.<br>
        Networks now chase <strong>THEM</strong> — instead of athletes fighting for the few TV slots available.
      </div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE — THE REVERSE FUNNEL (Strategy Framework)
     ---------------------------------------------------------- */
  function renderStrategy(el) {
    el.classList.add('slide-strategy');
    el.innerHTML = `
      <div class="eyebrow">▮ STRATEGY FRAMEWORK ▮</div>
      <h1>The Reverse Funnel</h1>
      <div class="strat-subtitle">
        One recording. Three surfaces. Atoms farm the long-form &mdash; long-form repays the atoms.
      </div>

      <div class="funnel-stage">

        <!-- TIER 1 — HERO -->
        <div class="funnel-tier tier-hero">
          <div class="tier-label">TIER 01 &mdash; THE ASSET</div>
          <div class="tier-row">
            <div class="funnel-card card-hero">
              <div class="card-type">"HERO"</div>
              <div class="card-desc">The full podcast episode</div>
              <div class="card-runtime">1:52:34</div>
            </div>
          </div>
          <div class="tier-note sticky-note sticky-note-1">
            <div class="note-body">
              The owned IP. Long-form watch time, mid-rolls + sponsor reads. <em>This is the business.</em>
            </div>
          </div>
        </div>

        <!-- TIER 2 — CLIPS -->
        <div class="funnel-tier tier-clip">
          <div class="tier-label">TIER 02 &mdash; THE DISCOVERY ENGINE</div>
          <div class="tier-row">
            <div class="funnel-card card-clip">
              <div class="card-type">"CLIP"</div>
              <div class="card-desc">Horizontal single-topic clip</div>
              <div class="card-runtime">3:12</div>
            </div>
            <div class="funnel-card card-clip">
              <div class="card-type">"CLIP"</div>
              <div class="card-desc">Horizontal single-topic clip</div>
              <div class="card-runtime">5:48</div>
            </div>
            <div class="funnel-card card-clip">
              <div class="card-type">"CLIP"</div>
              <div class="card-desc">Horizontal single-topic clip</div>
              <div class="card-runtime">7:55</div>
            </div>
            <div class="funnel-card card-clip">
              <div class="card-type">"CLIP"</div>
              <div class="card-desc">Horizontal single-topic clip</div>
              <div class="card-runtime">9:30</div>
            </div>
            <div class="funnel-card card-clip">
              <div class="card-type">"CLIP"</div>
              <div class="card-desc">Horizontal single-topic clip</div>
              <div class="card-runtime">11:48</div>
            </div>
          </div>
          <div class="tier-note sticky-note sticky-note-2">
            <div class="note-body">
              On the title's promise. Each clip is a YouTube search entry point that reroutes back to the hero.
            </div>
          </div>
        </div>

        <!-- TIER 3 — VERTICALS -->
        <div class="funnel-tier tier-vert">
          <div class="tier-label">TIER 03 &mdash; THE TOP OF FUNNEL</div>
          <div class="tier-row tier-row-vert">
            <div class="funnel-card card-vert">
              <div class="card-type">"VERT"</div>
              <div class="card-desc">Short-form</div>
              <div class="card-runtime">:07</div>
            </div>
            <div class="funnel-card card-vert">
              <div class="card-type">"VERT"</div>
              <div class="card-desc">Short-form</div>
              <div class="card-runtime">:14</div>
            </div>
            <div class="funnel-card card-vert">
              <div class="card-type">"VERT"</div>
              <div class="card-desc">Short-form</div>
              <div class="card-runtime">:22</div>
            </div>
            <div class="funnel-card card-vert">
              <div class="card-type">"VERT"</div>
              <div class="card-desc">Short-form</div>
              <div class="card-runtime">:34</div>
            </div>
            <div class="funnel-card card-vert">
              <div class="card-type">"VERT"</div>
              <div class="card-desc">Short-form</div>
              <div class="card-runtime">:45</div>
            </div>
            <div class="funnel-card card-vert">
              <div class="card-type">"VERT"</div>
              <div class="card-desc">Short-form</div>
              <div class="card-runtime">:58</div>
            </div>
            <div class="funnel-card card-vert">
              <div class="card-type">"VERT"</div>
              <div class="card-desc">Short-form</div>
              <div class="card-runtime">1:08</div>
            </div>
            <div class="funnel-card card-vert">
              <div class="card-type">"VERT"</div>
              <div class="card-desc">Short-form</div>
              <div class="card-runtime">1:18</div>
            </div>
            <div class="funnel-card card-vert">
              <div class="card-type">"VERT"</div>
              <div class="card-desc">Short-form</div>
              <div class="card-runtime">1:24</div>
            </div>
            <div class="funnel-card card-vert">
              <div class="card-type">"VERT"</div>
              <div class="card-desc">Short-form</div>
              <div class="card-runtime">1:30</div>
            </div>
          </div>
          <div class="tier-note sticky-note sticky-note-3">
            <div class="note-body">
              Fun, high-energy moments only. Recruits viewers who'd never click a 2-hour pod &mdash; and tests which hooks earn next week's clips.
            </div>
          </div>
        </div>

      </div>

      <div class="strat-bottom">
        <span class="bottom-stat"><strong>1</strong> recording</span>
        <span class="bottom-arrow">▶</span>
        <span class="bottom-stat"><strong>3&ndash;7</strong> clips</span>
        <span class="bottom-arrow">▶</span>
        <span class="bottom-stat"><strong>10+</strong> verticals</span>
        <span class="bottom-arrow">=</span>
        <span class="bottom-stat bottom-stat-final"><strong>10&ndash;20 assets</strong> per record day</span>
      </div>

      <div class="strat-pillars">
        <div class="strat-pillar">
          <div class="pillar-icon">🎬</div>
          <div class="pillar-title">One day of production</div>
          <div class="pillar-body">
            <strong>40–60 pieces</strong> of content. Months of distribution. <em>Volume problem solved at the source.</em>
          </div>
        </div>
        <div class="strat-pillar">
          <div class="pillar-icon">📊</div>
          <div class="pillar-title">Data compounds</div>
          <div class="pillar-body">
            Every shoot makes the next one <strong>sharper, cheaper, and more algorithm-aligned.</strong>
          </div>
        </div>
        <div class="strat-pillar">
          <div class="pillar-icon">📺</div>
          <div class="pillar-title">YouTube-native</div>
          <div class="pillar-body">
            Long-form anchor plus Shorts feeder loop. <em>Exactly what the platform rewards.</em>
          </div>
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE — PROPRIETARY TOOLS
     ---------------------------------------------------------- */
  function renderTools(el) {
    el.classList.add('slide-tools');
    el.innerHTML = `
      <div class="eyebrow">▮ THE REAL DIFFERENTIATOR ▮</div>
      <h1>We were never just a clips agency.</h1>
      <div class="tools-subtitle">
        Three tools built in-house. Each one ships standalone on subscription &mdash; capacity isn't gated by humans.
      </div>

      <div class="tools-grid">

        <div class="tool-card">
          <div class="tool-window">
            <span class="tool-app">ChannelTrack.exe</span>
            <span class="tool-x">×</span>
          </div>
          <div class="tool-body">
            <div class="tool-icon">📡</div>
            <div class="tool-name">CHANNEL TRACK</div>
            <div class="tool-tag">COMPETITION MONITORING</div>
            <ul class="tool-bullets">
              <li>Ingests the <strong>top 100 podcasts</strong> + every pro sports team</li>
              <li>Custom competitor lists, built per show or per client</li>
              <li>Pulls all YouTube data nightly &mdash; titles, thumbnails, transcripts, descriptions</li>
              <li>Models strategy, catches viral trends &amp; topics in real time</li>
              <li><em>Closed feedback loop of what actually works</em></li>
            </ul>
            <div class="tool-stat-row">
              <div class="tool-stat">
                <div class="tool-stat-num">700+</div>
                <div class="tool-stat-lbl">channels tracked</div>
              </div>
              <div class="tool-stat">
                <div class="tool-stat-num">24h</div>
                <div class="tool-stat-lbl">refresh cycle</div>
              </div>
            </div>
          </div>
        </div>

        <div class="tool-card tool-card-mid">
          <div class="tool-window">
            <span class="tool-app">postgameanalytics.exe</span>
            <span class="tool-x">×</span>
          </div>
          <div class="tool-body">
            <div class="tool-icon">📊</div>
            <div class="tool-name">LEAGUE BENCHMARKING</div>
            <div class="tool-tag">300+ TEAMS · NIGHTLY INGEST</div>
            <ul class="tool-bullets">
              <li><strong>300+ teams</strong> globally · every social platform</li>
              <li>Every post of the last <strong>3 years</strong>, ingested nightly</li>
              <li>Each post correlated to its game, match, or race</li>
              <li>Cross-league comparison + in-league competition monitoring</li>
            </ul>
            <div class="tool-stat-row">
              <div class="tool-stat">
                <div class="tool-stat-num">300+</div>
                <div class="tool-stat-lbl">teams covered</div>
              </div>
              <div class="tool-stat">
                <div class="tool-stat-num">3yr</div>
                <div class="tool-stat-lbl">post history</div>
              </div>
            </div>
            <div class="tool-callout">
              <span class="tc-tag">▸ RECEIPT</span>
              Directly responsible for our climb in NBA social rankings &mdash; we mapped every competitor's
              strategy and read it like a box score, nightly.
            </div>
          </div>
        </div>

        <div class="tool-card tool-card-uptides">
          <div class="tool-window">
            <span class="tool-app">Uptides.ai</span>
            <span class="tool-x">×</span>
          </div>
          <div class="tool-body">
            <img class="tool-logo" src="images/uptides-mark.png" alt="Uptides logo">
            <div class="tool-name">UPTIDES<span class="tool-name-tld">.ai</span></div>
            <div class="tool-tag">BACK-CATALOG OPTIMIZER</div>
            <ul class="tool-bullets">
              <li>Re-optimizes your back catalog for the algorithm of <em>today</em></li>
              <li>In-network channels growing on content older than 6 months</li>
              <li>Revenue from videos most teams already wrote off</li>
              <li>Perfectly positioned for <strong>dynamic brand insertion</strong></li>
            </ul>
            <div class="tool-stat-row">
              <div class="tool-stat tool-stat-hero">
                <div class="tool-stat-num">800%+</div>
                <div class="tool-stat-lbl">avg lift on 6+ mo content</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="tools-footer">
        <span class="tf-tag">▸ STANDALONE SaaS</span>
        Each tool can ship on its own subscription &mdash; the YouTube referral pipeline doesn't have to wait for a studio slot to open up.
      </div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE — NIL CREATOR FRAMEWORKS
     ---------------------------------------------------------- */
  function renderNIL(el) {
    el.classList.add('slide-nil');
    const rows = [
      { rank: '#1', medal: '🥇', icon: '🎙️', path: 'Podcast',         best: 'Personality-forward athletes', builds: 'Sponsors, brand deals, IP',                examples: 'Shannon Sharpe · Cam Newton · Pat McAfee' },
      { rank: '#2', medal: '🥈', icon: '💥', path: 'Squad / Group',   best: 'Teammates, friend groups',     builds: 'Massive reach, IP plays',                  examples: 'Dude Perfect · Sidemen · 2HYPE · AMP · NELK' },
      { rank: '#3', medal: '🥉', icon: '🏈', path: 'Sport-specific',  best: 'Niche-skill athletes',         builds: 'Loyal subs, coaching pipeline, sport sponsors', examples: 'Deestroying · Jesser' },
      { rank: '#4', medal: '',   icon: '🎮', path: 'Gaming / Stream', best: 'Gen Z athletes',               builds: 'Live crossover, content monetization',     examples: 'Neymar Jr. · De\'Aaron Fox · JuJu · Josh Hart' },
      { rank: '#5', medal: '',   icon: '📹', path: 'Vlog / Day-in-life', best: 'Lifestyle-forward athletes', builds: 'Family brand, lifestyle deals',         examples: 'Travis Hunter · Olivia Dunne · Bronny James' },
    ];
    el.innerHTML = `
      <div class="eyebrow">▮ NIL CREATOR FRAMEWORKS ▮</div>
      <h1>Not every athlete should run the same playbook.</h1>

      <div class="nil-sticky">
        <div class="nil-sticky-tape"></div>
        Ranked by <strong>monetization potential</strong> &mdash; map talent to format, then build the channel around how their audience actually wants to consume them.
      </div>

      <div class="nil-table">
        <div class="nil-row nil-head">
          <div class="nil-cell-rank">$ RANK</div>
          <div class="nil-cell-path">PATH</div>
          <div class="nil-cell-best">BEST FOR</div>
          <div class="nil-cell-builds">WHAT IT BUILDS</div>
          <div class="nil-cell-ex">CHANNEL EXAMPLES</div>
        </div>
        ${rows.map((r, i) => `
          <div class="nil-row${i === 0 ? ' nil-row-gold' : ''}">
            <div class="nil-cell-rank">
              <span class="nil-rank-num">${r.rank}</span>
              ${r.medal ? `<span class="nil-medal">${r.medal}</span>` : ''}
            </div>
            <div class="nil-cell-path">
              <span class="nil-path-icon">${r.icon}</span>
              <span class="nil-path-name">${r.path}</span>
            </div>
            <div class="nil-cell-best">${r.best}</div>
            <div class="nil-cell-builds">${r.builds}</div>
            <div class="nil-cell-ex">${r.examples}</div>
          </div>
        `).join('')}
      </div>

      <div class="nil-warn">
        <span class="nil-warn-tag">⚠ HEADS UP</span>
        Gaming requires <strong>real commitment.</strong> Weekly streaming minimum, pre-planned matchups, content strategy.
        Don't sign up unless the talent will actually do the reps.
      </div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE — THE UNTAPPED WAVE
     ---------------------------------------------------------- */
  function renderWave(el) {
    el.classList.add('slide-wave');
    el.innerHTML = `
      <div class="eyebrow">▮ FIRST-MOVER ADVANTAGE ▮</div>
      <h1>Two waves we want to support.</h1>
      <div class="wave-subtitle">
        Both have the audience. Both have the demand. Neither has the infrastructure &mdash; yet.
      </div>

      <div class="wave-grid">

        <div class="wave-card wave-female">
          <div class="wave-window">
            <span class="wave-app">Female_Athletes.exe</span>
            <span class="wave-x">×</span>
          </div>
          <div class="wave-body">
            <div class="wave-icon">🏐</div>
            <div class="wave-card-eyebrow">WAVE 01</div>
            <div class="wave-h2">FEMALE ATHLETES</div>
            <div class="wave-tag">AUDIENCE CONNECTION · UNTAPPED MONETIZATION</div>
            <ul class="wave-points">
              <li>
                <span class="wp-head">Audience connection runs deep.</span>
                Female fan connection to women's sports is dramatically higher than the men's side &mdash; audiences want story, depth, and personality.
              </li>
              <li>
                <span class="wp-head">Players want to create.</span>
                Less media-trained and more willing to show real personality on camera.
              </li>
              <li>
                <span class="wp-head">Growth needs creators.</span>
                The next chapter of women's sports gets built on athletes' own platforms &mdash; not waiting on the league feed.
              </li>
              <li>
                <span class="wp-head">Bigger than monetization.</span>
                This is how the sport itself grows.
              </li>
            </ul>
            <div class="wave-stat-row">
              <div class="wave-stat">
                <div class="wave-stat-num">1st</div>
                <div class="wave-stat-lbl">mover advantage</div>
              </div>
              <div class="wave-stat">
                <div class="wave-stat-num">$$$</div>
                <div class="wave-stat-lbl">brand category wide open</div>
              </div>
            </div>
            <div class="wave-callout">
              <span class="wc-tag">▸ RECEIPT</span>
              Our women's volleyball case study confirmed the signal &mdash; the Austin LOVB roster had more social media creators than the men's basketball, G League, and soccer rosters combined.
            </div>
          </div>
        </div>

        <div class="wave-col">
          <div class="wave-card wave-olympic">
            <div class="wave-window">
              <span class="wave-app">LA_2028.exe</span>
              <span class="wave-x">×</span>
            </div>
            <div class="wave-body">
              <div class="wave-icon">🥇</div>
              <div class="wave-card-eyebrow">WAVE 02</div>
              <div class="wave-h2">OLYMPIC RUNWAY</div>
              <div class="wave-tag">LA 2028 · 12-MONTH RAMP MINIMUM</div>
              <ul class="wave-points">
                <li>
                  <span class="wp-head">Two weeks, then silence.</span>
                  The Olympics own the conversation for two weeks &mdash; then those sports vanish from broadcast for four years.
                </li>
                <li>
                  <span class="wp-head">YouTube is built for niche.</span>
                  Almost every Olympic sport could sustain a creator generating millions of views per video.
                </li>
                <li>
                  <span class="wp-head">12-month ramp minimum.</span>
                  Athletes onboarded now are the ones who tell the 2028 story natively.
                </li>
                <li>
                  <span class="wp-head">Mind the 44-month gap.</span>
                  Beyond brand deals &mdash; this is how those sports stay alive between Games.
                </li>
              </ul>
              <div class="wave-callout">
                <span class="wc-tag">▸ THE GAP</span>
                Olympians own global attention every four years, then disappear. We give them a year-round audience &mdash; and give their sport a year-round home.
              </div>
            </div>
          </div>

          <div class="wave-countdown" aria-label="Live countdown to LA 2028 Opening Ceremony">
            <div class="wc-segment">
              <div class="wc-num" data-countdown="days">---</div>
              <div class="wc-lbl">DAYS</div>
            </div>
            <div class="wc-sep">:</div>
            <div class="wc-segment">
              <div class="wc-num" data-countdown="hours">--</div>
              <div class="wc-lbl">HRS</div>
            </div>
            <div class="wc-sep">:</div>
            <div class="wc-segment">
              <div class="wc-num" data-countdown="minutes">--</div>
              <div class="wc-lbl">MIN</div>
            </div>
            <div class="wc-sep">:</div>
            <div class="wc-segment">
              <div class="wc-num" data-countdown="seconds">--</div>
              <div class="wc-lbl">SEC</div>
            </div>
            <div class="wc-target">▸ LIVE · until LA28 opening ceremony</div>
          </div>
        </div>

      </div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE — HOW WE WORK
     ---------------------------------------------------------- */
  function renderWork(el) {
    el.classList.add('slide-work');
    el.innerHTML = `
      <div class="eyebrow">▮ HOW WE'D WORK TOGETHER ▮</div>
      <h1>Two-part model. Designed so YouTube referrals can land at any commitment.</h1>

      <div class="work-twocol">
        <div class="work-phase work-phase-launch">
          <div class="wp-window">
            <span class="wp-app">Launch.exe</span>
            <span class="wp-x">×</span>
          </div>
          <div class="wp-body">
            <div class="wp-icon">🚀</div>
            <div class="wp-tag">PHASE 01</div>
            <h2 class="wp-h2">Launch</h2>
            <p class="wp-desc">One-time engagement to stand the channel up.</p>
            <ul class="wp-list">
              <li><span class="wpl-bullet">▸</span> <span class="wpl-text">Brand identity &amp; channel branding</span></li>
              <li><span class="wpl-bullet">▸</span> <span class="wpl-text">First three production shoots</span></li>
              <li><span class="wpl-bullet">▸</span> <span class="wpl-text">Distribution playbook</span></li>
              <li><span class="wpl-bullet">▸</span> <span class="wpl-text">Analytics &amp; optimization setup</span></li>
            </ul>
          </div>
        </div>

        <div class="work-phase work-phase-engage">
          <div class="wp-window">
            <span class="wp-app">Monthly_Engagement.exe</span>
            <span class="wp-x">×</span>
          </div>
          <div class="wp-body">
            <div class="wp-icon">🔁</div>
            <div class="wp-tag">PHASE 02</div>
            <h2 class="wp-h2">Monthly Engagement</h2>
            <p class="wp-desc">Ongoing production and optimization. The reverse funnel running on a steady cadence.</p>
            <ul class="wp-list">
              <li><span class="wpl-bullet">▸</span> <span class="wpl-text">Production cadence locked</span></li>
              <li><span class="wpl-bullet">▸</span> <span class="wpl-text">Packaging &amp; thumbnail testing</span></li>
              <li><span class="wpl-bullet">▸</span> <span class="wpl-text">Distribution + Shorts loop</span></li>
              <li><span class="wpl-bullet">▸</span> <span class="wpl-text">Brand sales support</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="work-pricing">
        <div class="wpr-head">▮ PRICING LOGIC BY TRACK ▮</div>
        <div class="wpr-tracks">

          <div class="wpr-track wpr-track-athlete">
            <div class="wpr-window">
              <span class="wpr-app">Athlete_Pricing.exe</span>
              <span class="wpr-x">×</span>
            </div>
            <div class="wpr-body">
              <div class="wpr-headrow">
                <div class="wpr-icon">🎙️</div>
                <div class="wpr-headcol">
                  <div class="wpr-tag">TRACK 01</div>
                  <div class="wpr-name">Athletes</div>
                </div>
              </div>
              <div class="wpr-tiers">
                <div class="wpr-tier">
                  <div class="wpr-tier-price">$10,000<span class="wpr-tier-per">/mo</span></div>
                  <div class="wpr-tier-name">YouTube Strategist</div>
                  <div class="wpr-tier-detail">Dedicated strategist running the channel.</div>
                </div>
                <div class="wpr-tier wpr-tier-plus">
                  <div class="wpr-tier-price">$16,000<span class="wpr-tier-per">/mo</span></div>
                  <div class="wpr-tier-name">Strategist + Vertical Editor + Thumbnail Designer</div>
                  <div class="wpr-tier-detail">Full creative pod &mdash; strategist, dedicated vertical video editor, dedicated thumbnail designer.</div>
                </div>
              </div>
              <div class="wpr-asterisk">* with AdSense + brand deal rev share</div>
            </div>
          </div>

          <div class="wpr-track wpr-track-team">
            <div class="wpr-window">
              <span class="wpr-app">Team_Pricing.exe</span>
              <span class="wpr-x">×</span>
            </div>
            <div class="wpr-body">
              <div class="wpr-headrow">
                <div class="wpr-icon">🏟️</div>
                <div class="wpr-headcol">
                  <div class="wpr-tag">TRACK 02</div>
                  <div class="wpr-name">Teams / Athletic Departments</div>
                </div>
              </div>
              <div class="wpr-tiers">
                <div class="wpr-tier">
                  <div class="wpr-tier-price">$30,000<span class="wpr-tier-per">/mo</span></div>
                  <div class="wpr-tier-name">Strategy &amp; Execution</div>
                  <div class="wpr-tier-detail">Custom strategies for every tentpole event, game-over-game strategy, in-person workshops.</div>
                </div>
                <div class="wpr-tier wpr-tier-plus">
                  <div class="wpr-tier-price">$45,000<span class="wpr-tier-per">/mo</span></div>
                  <div class="wpr-tier-name">+ Dedicated Vertical Team + Thumbnail Expert</div>
                  <div class="wpr-tier-detail">Vertical team remotely present at every game producing 100+ verticals/mo. Dedicated thumbnail expert executing across all projects.</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE — SUCCESS FEE / ACHIEVEMENTS
     ---------------------------------------------------------- */
  function renderSuccessFee(el) {
    el.classList.add('slide-success');
    const milestones = [
      { stat: '5M views/mo',  fee: '$7,500'  },
      { stat: '10M views/mo', fee: '$15,000' },
      { stat: '25M views/mo', fee: '$30,000' },
      { stat: '100K subs',    fee: '$10,000' },
      { stat: '500K subs',    fee: '$25,000' },
      { stat: '1M subs',      fee: '$50,000' },
    ];
    el.innerHTML = `
      <div class="eyebrow">▮ ACHIEVEMENTS UNLOCKED ▮</div>
      <h1>Pay us when the channel actually wins.</h1>
      <div class="ach-subtitle">
        Pulled from the Meltzer pitch. Aligns ASFC's earn with the channel's outcome &mdash;
        with a hard cap so we never stack above value delivered.
      </div>

      <div class="ach-grid">

        <div class="ach-panel ach-milestones">
          <div class="ach-panel-head">
            <span class="ap-icon">🏆</span>
            <div>
              <div class="ap-tag">UNLOCK 01</div>
              <div class="ap-name">VIEWERSHIP MILESTONES</div>
              <div class="ap-sub">Sustained 3 months · one-time payouts</div>
            </div>
          </div>
          <div class="ach-trophies">
            ${milestones.map(m => `
              <div class="trophy">
                <div class="trophy-stat">${m.stat}</div>
                <div class="trophy-fee">${m.fee}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="ach-panel ach-rev">
          <div class="ach-panel-head">
            <span class="ap-icon">💰</span>
            <div>
              <div class="ap-tag">UNLOCK 02</div>
              <div class="ap-name">REVENUE REV-SHARE</div>
              <div class="ap-sub">Ongoing · % of channel-attributable revenue</div>
            </div>
          </div>
          <ul class="ach-rev-list">
            <li>
              <span class="arl-line">AdSense</span>
              <span class="arl-pct">15%</span>
              <span class="arl-note">above $5K/mo floor</span>
            </li>
            <li>
              <span class="arl-line">Brand deals (sourced or driven by ASFC)</span>
              <span class="arl-pct">15%</span>
              <span class="arl-note">distribution-attributed</span>
            </li>
            <li>
              <span class="arl-line">CMS pre-roll (once stood up)</span>
              <span class="arl-pct">20%</span>
              <span class="arl-note">network-only</span>
            </li>
          </ul>

          <div class="ach-cap">
            <div class="ach-cap-tag">▸ CLIENT-SIDE CAP</div>
            <div class="ach-cap-body">
              ASFC monthly earn (retainer + all success fees) capped at
              <strong>35% of total channel-attributable revenue.</strong>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE — STUDIO CAPACITY
     ---------------------------------------------------------- */
  function renderCapacity(el) {
    el.classList.add('slide-capacity');
    el.innerHTML = `
      <div class="eyebrow">▮ STUDIO CAPACITY ▮</div>
      <h1>Quality bar, held.</h1>
      <div class="cap-subtitle">
        We scale the team in lockstep with the volume YouTube wants to drive. <em>Not before.</em>
      </div>

      <div class="cap-shell">

        <div class="cap-now">
          <div class="cap-window">
            <span class="cap-app">Capacity_Now.exe</span>
            <span class="cap-x">×</span>
          </div>
          <div class="cap-body">
            <div class="cap-tag">CURRENT (MAY 2026)</div>
            <div class="cap-slots">
              <div class="cap-slot">
                <div class="cap-slot-icon">🏟️</div>
                <div class="cap-slot-num">2</div>
                <div class="cap-slot-lbl">teams</div>
              </div>
              <div class="cap-slot-plus">+</div>
              <div class="cap-slot">
                <div class="cap-slot-icon">🎙️</div>
                <div class="cap-slot-num">2&ndash;4</div>
                <div class="cap-slot-lbl">athletes</div>
              </div>
            </div>
            <div class="cap-team">
              <span class="ct-tag">▸ HUMANS ONLINE</span>
              <span class="ct-num">8</span>
              <span class="ct-roles">CEO · Ops · 2× Lead Strategist · 3× Vertical Specialist · Thumbnail Designer</span>
            </div>
          </div>
        </div>

        <div class="cap-arrow">
          <div class="ca-stem">▶▶▶▶▶▶</div>
          <div class="ca-window">6&ndash;12 months</div>
          <div class="ca-stem">▶▶▶▶▶▶</div>
        </div>

        <div class="cap-soon">
          <div class="cap-window cap-window-future">
            <span class="cap-app">Capacity_2027.exe</span>
            <span class="cap-x">×</span>
          </div>
          <div class="cap-body cap-body-future">
            <div class="cap-tag cap-tag-future">FORECAST · 2&times; TO 4&times;</div>
            <div class="cap-slots">
              <div class="cap-slot cap-slot-future">
                <div class="cap-slot-icon">🏟️</div>
                <div class="cap-slot-num">4&ndash;8</div>
                <div class="cap-slot-lbl">teams</div>
              </div>
              <div class="cap-slot-plus">+</div>
              <div class="cap-slot cap-slot-future">
                <div class="cap-slot-icon">🎙️</div>
                <div class="cap-slot-num">8&ndash;16</div>
                <div class="cap-slot-lbl">athletes</div>
              </div>
            </div>
            <div class="cap-team cap-team-future">
              <span class="ct-tag">▸ HUMANS PLANNED</span>
              <span class="ct-num">16&ndash;32</span>
              <span class="ct-roles">scaled in lockstep with referral volume &mdash; never ahead of it</span>
            </div>
          </div>
        </div>

      </div>

      <div class="cap-footer">
        <span class="cf-tag">▸ THE PRINCIPLE</span>
        Tools (Channel Track, League Bench, Uptides) ship on subscription &mdash;
        <strong>those don't wait for a studio slot.</strong> The referral pipeline stays unblocked.
      </div>
    `;
  }

  /* ----------------------------------------------------------
     SLIDE — CONTACT
     ---------------------------------------------------------- */
  function renderContact(el) {
    el.classList.add('slide-contact');
    el.innerHTML = `
      <div class="eyebrow">▮ END OF DECK · LET'S BUILD ▮</div>
      <h1>Anti-Social Friends Club. Let's Grow Together.</h1>
      <div class="contact-subtitle">
        Tell us which track fits and we'll route you to the right starting point.
      </div>

      <div class="contact-shell">

        <div class="contact-card">
          <div class="cc-window">
            <span class="cc-app">Contact.exe</span>
            <span class="cc-x">×</span>
          </div>
          <div class="cc-body">
            <div class="cc-name">Kent Heckel</div>
            <div class="cc-title">Founder &amp; CEO &middot; Antisocial Friends Club</div>

            <div class="cc-line">
              <span class="cc-icon">📧</span>
              <a href="mailto:kent@kentheckel.com">kent@kentheckel.com</a>
            </div>
            <div class="cc-line">
              <span class="cc-icon">📞</span>
              <a href="tel:+16037486310">+1 (603) 748-6310</a>
            </div>
            <div class="cc-line">
              <span class="cc-icon">🌐</span>
              <a href="https://antisocialfriendsclub.com" target="_blank" rel="noopener">antisocialfriendsclub.com</a>
            </div>
          </div>
        </div>

        <div class="contact-tracks">
          <div class="ct-head">▸ ROUTE ME TO</div>
          <button class="ct-btn ct-btn-athlete" data-track="athlete">
            <span class="ctb-icon">🎙️</span>
            <span class="ctb-name">I'm an athlete</span>
            <span class="ctb-arrow">→</span>
          </button>
          <button class="ct-btn ct-btn-team" data-track="team">
            <span class="ctb-icon">🏟️</span>
            <span class="ctb-name">I run a team</span>
            <span class="ctb-arrow">→</span>
          </button>
          <button class="ct-btn ct-btn-dept" data-track="dept">
            <span class="ctb-icon">🎓</span>
            <span class="ctb-name">I lead an athletic department</span>
            <span class="ctb-arrow">→</span>
          </button>
        </div>

      </div>

      <div class="contact-thanks">
        <span class="th-marker">▮▮▮</span>
        Thanks for taking the meeting. <em>Now let's go own the next 30 years.</em>
        <span class="th-marker">▮▮▮</span>
      </div>
    `;

    el.querySelectorAll('.ct-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const subject = encodeURIComponent('ASFC × ' + btn.dataset.track);
        window.location.href = `mailto:kent@kentheckel.com?subject=${subject}`;
      });
    });
  }

  function placeholder(el, idx) {
    el.classList.add('slide-placeholder');
    const slideMeta = SLIDES[idx];
    el.innerHTML = `
      <div class="construction-tape">▮▮ SLIDE UNDER CONSTRUCTION ▮▮</div>
      <div class="slide-num">${String(idx + 1).padStart(2, '0')}</div>
      <h1>${slideMeta.title}</h1>
      <p style="max-width: 600px; margin: 16px auto; font-size: 18px; color: #606060;">
        This slide is on the build list. We'll layer it in next.
      </p>
      <p style="margin-top: 40px; font-family: 'VT323', monospace; font-size: 16px; color: #808080;">
        ID: <code>${slideMeta.id}</code>
      </p>
    `;
  }

  /* ==========================================================
     KICKOFF
     ========================================================== */
  runBoot();

  // Util
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

})();
