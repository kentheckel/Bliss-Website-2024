// ASFC arcade leaderboard — shared across all games.
// Classic script (no ES modules) so it works under file:// too.
// Talks directly to Supabase REST. No SDK dependency.

(function () {

const SUPABASE_URL = "https://aupolmxluoewdcpamqqm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_9V4LhofB8S4Co0xOcQY5Pw_3EyOvPZd";

const TABLE = "asfc_game_scores";
const REST_URL = `${SUPABASE_URL}/rest/v1/${TABLE}`;

const HEADERS = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  "Content-Type": "application/json"
};

const NAME_KEY = "asfc_player_name";

function getSavedName() {
  try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; }
}
function saveName(name) {
  try { localStorage.setItem(NAME_KEY, name); } catch (e) {}
}

// Submit a score. Throws on HTTP errors. Returns the row.
async function submitScore({ game, name, score, meta }) {
  const clean = (name || "").trim().slice(0, 20);
  if (!clean) throw new Error("Name required");
  if (!Number.isFinite(score) || score < 0) throw new Error("Bad score");
  saveName(clean);
  const res = await fetch(REST_URL, {
    method: "POST",
    headers: { ...HEADERS, Prefer: "return=representation" },
    body: JSON.stringify([{
      game,
      name: clean,
      score: Math.floor(score),
      meta: meta || {}
    }])
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Submit failed: ${res.status} ${text}`);
  }
  const rows = await res.json();
  return rows[0];
}

// Fetch top N scores for a game. `order` is "desc" (high wins) or "asc" (low wins).
// `extraFilters` is an object of extra PostgREST filter params, e.g.
//   { "meta->>difficulty": "eq.easy" }
async function fetchTopScores({ game, limit, order, extraFilters }) {
  limit = limit || 10;
  order = order || "desc";
  const params = new URLSearchParams();
  params.set("game", `eq.${game}`);
  params.set("select", "name,score,created_at,meta");
  params.set("order", `score.${order},created_at.asc`);
  params.set("limit", String(limit));
  if (extraFilters) {
    for (const [k, v] of Object.entries(extraFilters)) params.append(k, v);
  }
  const res = await fetch(`${REST_URL}?${params.toString()}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

// Mounts a leaderboard panel into `containerEl`.
// Options:
//   game         — string key (matches RLS allow-list)
//   order        — "desc" (default) high score wins, or "asc" lowest wins
//   scoreLabel   — header text for score column (default "Score")
//   formatScore  — fn(score) => string for display
//   limit        — top N (default 10)
//   pendingScore — { score, meta } to prompt the player to submit
//   onSubmitted  — callback after successful submit
function mountLeaderboard(containerEl, opts) {
  const game = opts.game;
  const order = opts.order || "desc";
  const scoreLabel = opts.scoreLabel || "Score";
  const formatScore = opts.formatScore || function (s) { return String(s); };
  const limit = opts.limit || 10;
  const pendingScore = opts.pendingScore || null;
  const onSubmitted = opts.onSubmitted || function () {};
  const extraFilters = opts.extraFilters || null;

  containerEl.innerHTML = `
    <div class="lb-wrap">
      <div class="lb-header">
        <span class="lb-title">🏆 Top ${limit}</span>
        <button class="lb-refresh" type="button">refresh</button>
      </div>
      <table class="lb-table">
        <thead>
          <tr><th class="lb-col-rank">#</th><th class="lb-col-name">Name</th><th class="lb-col-score">${escapeHtml(scoreLabel)}</th></tr>
        </thead>
        <tbody class="lb-body"><tr><td colspan="3" class="lb-loading">loading…</td></tr></tbody>
      </table>
      ${pendingScore ? renderSubmitForm(pendingScore, scoreLabel, formatScore) : ""}
    </div>
  `;

  const bodyEl = containerEl.querySelector(".lb-body");
  const refreshBtn = containerEl.querySelector(".lb-refresh");
  const form = containerEl.querySelector(".lb-form");

  async function load() {
    bodyEl.innerHTML = `<tr><td colspan="3" class="lb-loading">loading…</td></tr>`;
    try {
      const rows = await fetchTopScores({ game, limit, order, extraFilters });
      if (!rows.length) {
        bodyEl.innerHTML = `<tr><td colspan="3" class="lb-empty">be the first to post a score</td></tr>`;
        return;
      }
      bodyEl.innerHTML = rows.map((r, i) => `
        <tr>
          <td class="lb-col-rank">${i + 1}</td>
          <td class="lb-col-name">${escapeHtml(r.name)}</td>
          <td class="lb-col-score">${escapeHtml(formatScore(r.score))}</td>
        </tr>
      `).join("");
    } catch (e) {
      bodyEl.innerHTML = `<tr><td colspan="3" class="lb-error">offline (couldn't load)</td></tr>`;
    }
  }

  refreshBtn.addEventListener("click", load);

  if (form) {
    const nameInput = form.querySelector("input[name=name]");
    nameInput.value = getSavedName();
    const submitBtn = form.querySelector("button[type=submit]");
    const statusEl = form.querySelector(".lb-form-status");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      statusEl.textContent = "submitting…";
      statusEl.className = "lb-form-status";
      try {
        await submitScore({
          game,
          name: nameInput.value,
          score: pendingScore.score,
          meta: pendingScore.meta || {}
        });
        statusEl.textContent = "saved!";
        statusEl.classList.add("ok");
        form.remove();
        await load();
        onSubmitted();
      } catch (err) {
        statusEl.textContent = err.message || "failed";
        statusEl.classList.add("err");
        submitBtn.disabled = false;
      }
    });
  }

  load();
  return { reload: load };
}

function renderSubmitForm(pending, scoreLabel, formatScore) {
  return `
    <form class="lb-form" autocomplete="off">
      <div class="lb-form-row">
        <span class="lb-form-label">Your ${escapeHtml(scoreLabel.toLowerCase())}:</span>
        <strong class="lb-form-score">${escapeHtml(formatScore(pending.score))}</strong>
      </div>
      <div class="lb-form-row">
        <label class="lb-form-label" for="lb-name">Name:</label>
        <input id="lb-name" name="name" type="text" maxlength="20" required placeholder="kentsWeirdCamera">
        <button type="submit" class="lb-form-submit">Submit</button>
      </div>
      <div class="lb-form-status"></div>
    </form>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Expose globally
window.ASFCLeaderboard = {
  mountLeaderboard: mountLeaderboard,
  submitScore: submitScore,
  fetchTopScores: fetchTopScores,
  getSavedName: getSavedName,
  saveName: saveName
};

})();
