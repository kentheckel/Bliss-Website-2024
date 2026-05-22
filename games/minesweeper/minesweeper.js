// Minesweeper — classic Win95 rules.

const { mountLeaderboard } = window.ASFCLeaderboard;

const DIFFS = {
  easy:   { rows: 9,  cols: 9,  mines: 10, label: "Easy" },
  medium: { rows: 12, cols: 12, mines: 24, label: "Medium" },
  hard:   { rows: 16, cols: 16, mines: 50, label: "Hard" }
};

let diffKey = "medium";
let cfg = DIFFS[diffKey];

const state = {
  grid: [],          // 2D array of cells
  revealed: 0,
  flagsLeft: cfg.mines,
  startedAt: 0,
  timerId: null,
  elapsed: 0,
  status: "ready"    // ready | playing | won | lost
};

// --- DOM ---
const $ = (id) => document.getElementById(id);
const boardEl = $("board");
const mineCounterEl = $("mineCounter");
const timeCounterEl = $("timeCounter");
const smileyBtn = $("smileyBtn");
const statusEl = $("msStatus");
const endOverlay = $("endOverlay");
const endTitle = $("endTitle");
const endEmoji = $("endEmoji");
const endMessage = $("endMessage");
const endTime = $("endTime");
const endLeaderboardEl = $("endLeaderboard");
const msLeaderboardEl = $("msLeaderboard");

document.querySelectorAll('input[name="diff"]').forEach((r) => {
  r.addEventListener("change", () => {
    diffKey = r.value;
    cfg = DIFFS[diffKey];
    newGame();
    refreshSideLeaderboard();
  });
});

smileyBtn.addEventListener("click", newGame);
$("newGameMenu").addEventListener("click", newGame);
$("endPlayAgain").addEventListener("click", () => {
  endOverlay.classList.add("hidden");
  newGame();
});
$("endClose").addEventListener("click", () => endOverlay.classList.add("hidden"));
$("helpMenu").addEventListener("click", () => {
  alert("Left-click reveals a cell. Right-click (or long-press on mobile) plants a flag. Clear all non-mine cells to win. Your time is your score — lower is better.");
});

// --- Game logic ---
function newGame() {
  if (state.timerId) clearInterval(state.timerId);
  state.grid = [];
  state.revealed = 0;
  state.flagsLeft = cfg.mines;
  state.startedAt = 0;
  state.elapsed = 0;
  state.status = "ready";
  for (let r = 0; r < cfg.rows; r++) {
    const row = [];
    for (let c = 0; c < cfg.cols; c++) {
      row.push({ r, c, mine: false, n: 0, revealed: false, flagged: false, exploded: false });
    }
    state.grid.push(row);
  }
  smileyBtn.textContent = "🙂";
  statusEl.textContent = "Ready — left-click to begin";
  endOverlay.classList.add("hidden");
  renderBoard();
  updateHud();
}

function plantMines(safeR, safeC) {
  let placed = 0;
  while (placed < cfg.mines) {
    const r = Math.floor(Math.random() * cfg.rows);
    const c = Math.floor(Math.random() * cfg.cols);
    if (state.grid[r][c].mine) continue;
    // Keep first-click safe: no mine in clicked cell or its neighbors.
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    state.grid[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < cfg.rows; r++) {
    for (let c = 0; c < cfg.cols; c++) {
      if (state.grid[r][c].mine) continue;
      state.grid[r][c].n = neighbors(r, c).filter((n) => n.mine).length;
    }
  }
}

function neighbors(r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= cfg.rows || nc >= cfg.cols) continue;
      out.push(state.grid[nr][nc]);
    }
  }
  return out;
}

function startTimer() {
  state.startedAt = Date.now();
  state.timerId = setInterval(() => {
    state.elapsed = Math.min(999, Math.floor((Date.now() - state.startedAt) / 1000));
    timeCounterEl.textContent = pad3(state.elapsed);
  }, 250);
}

function reveal(r, c) {
  const cell = state.grid[r][c];
  if (cell.revealed || cell.flagged || state.status === "won" || state.status === "lost") return;
  if (state.status === "ready") {
    plantMines(r, c);
    state.status = "playing";
    startTimer();
  }
  if (cell.mine) {
    cell.revealed = true;
    cell.exploded = true;
    lose();
    return;
  }
  // Flood-fill for 0s
  const stack = [cell];
  while (stack.length) {
    const cur = stack.pop();
    if (cur.revealed || cur.flagged) continue;
    cur.revealed = true;
    state.revealed++;
    if (cur.n === 0 && !cur.mine) {
      neighbors(cur.r, cur.c).forEach((n) => {
        if (!n.revealed && !n.flagged && !n.mine) stack.push(n);
      });
    }
  }
  if (state.revealed === cfg.rows * cfg.cols - cfg.mines) win();
  renderBoard();
}

function toggleFlag(r, c) {
  const cell = state.grid[r][c];
  if (cell.revealed || state.status === "won" || state.status === "lost") return;
  if (state.status === "ready") return;
  cell.flagged = !cell.flagged;
  state.flagsLeft += cell.flagged ? -1 : 1;
  renderBoard();
  updateHud();
}

function win() {
  state.status = "won";
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  // Auto-flag remaining mines
  state.grid.flat().forEach((c) => {
    if (c.mine && !c.flagged) {
      c.flagged = true;
      state.flagsLeft--;
    }
  });
  smileyBtn.textContent = "😎";
  statusEl.textContent = `Swept in ${state.elapsed}s — ${cfg.label}`;
  renderBoard();
  updateHud();
  showEnd(true);
}

function lose() {
  state.status = "lost";
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  // Reveal all mines, mark misflags.
  state.grid.flat().forEach((c) => {
    if (c.mine && !c.flagged) c.revealed = true;
    if (c.flagged && !c.mine) c.misflag = true;
  });
  smileyBtn.textContent = "💀";
  statusEl.textContent = `Boom — ${cfg.label} (${state.elapsed}s)`;
  renderBoard();
  showEnd(false);
}

// --- Rendering ---
function renderBoard() {
  boardEl.style.gridTemplateColumns = `repeat(${cfg.cols}, 26px)`;
  boardEl.innerHTML = "";
  for (let r = 0; r < cfg.rows; r++) {
    for (let c = 0; c < cfg.cols; c++) {
      const cell = state.grid[r][c];
      const btn = document.createElement("button");
      btn.className = "ms-cell";
      btn.dataset.r = r;
      btn.dataset.c = c;
      if (cell.revealed) {
        btn.classList.add("revealed");
        if (cell.mine) {
          btn.classList.add("mine");
          if (cell.exploded) btn.classList.add("exploded");
          btn.textContent = "💣";
        } else if (cell.n > 0) {
          btn.dataset.n = cell.n;
          btn.textContent = cell.n;
        }
      } else if (cell.flagged) {
        btn.classList.add("flagged");
      } else if (cell.misflag) {
        btn.classList.add("misflag");
      }
      attachCellHandlers(btn, r, c);
      boardEl.appendChild(btn);
    }
  }
}

function attachCellHandlers(btn, r, c) {
  btn.addEventListener("mousedown", (e) => {
    if (state.status === "won" || state.status === "lost") return;
    if (e.button === 0) smileyBtn.textContent = "😮";
  });
  btn.addEventListener("mouseup", () => {
    if (state.status === "playing" || state.status === "ready") smileyBtn.textContent = "🙂";
  });
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    reveal(r, c);
  });
  btn.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    toggleFlag(r, c);
  });
  // Long-press flag for mobile
  let pressTimer = null;
  btn.addEventListener("touchstart", (e) => {
    pressTimer = setTimeout(() => {
      toggleFlag(r, c);
      pressTimer = null;
    }, 350);
  }, { passive: true });
  btn.addEventListener("touchend", (e) => {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
  });
  btn.addEventListener("touchmove", () => {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
  });
}

function updateHud() {
  mineCounterEl.textContent = pad3(Math.max(0, state.flagsLeft));
  timeCounterEl.textContent = pad3(state.elapsed);
}

function pad3(n) {
  return String(n).padStart(3, "0");
}

// --- End screen + leaderboard ---
function showEnd(won) {
  endTitle.textContent = won ? "Field cleared" : "Boom";
  endEmoji.textContent = won ? "😎" : "💀";
  endMessage.textContent = won
    ? `Cleared ${cfg.label} in ${state.elapsed} seconds.`
    : `You hit a mine on ${cfg.label}. Try again.`;
  endTime.textContent = won ? `Difficulty: ${cfg.label}` : `Difficulty: ${cfg.label} · ${state.elapsed}s`;
  const pending = won ? { score: state.elapsed, meta: { difficulty: diffKey } } : null;
  mountLeaderboard(endLeaderboardEl, {
    game: "minesweeper",
    order: "asc",
    scoreLabel: `Time · ${cfg.label}`,
    formatScore: (s) => `${s}s`,
    limit: 10,
    pendingScore: pending,
    extraFilters: { "meta->>difficulty": `eq.${diffKey}` },
    onSubmitted: refreshSideLeaderboard
  });
  endOverlay.classList.remove("hidden");
}

function refreshSideLeaderboard() {
  mountLeaderboard(msLeaderboardEl, {
    game: "minesweeper",
    order: "asc",
    scoreLabel: `Time · ${cfg.label}`,
    formatScore: (s) => `${s}s`,
    limit: 10,
    extraFilters: { "meta->>difficulty": `eq.${diffKey}` }
  });
}

// --- Init ---
newGame();
refreshSideLeaderboard();
