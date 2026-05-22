// Viral Surfer — endless runner.
// Surf the feed. Jump over haters (👎), duck under copyright strikes,
// collect 👍 to combo your way up the leaderboard. Don't get cancelled.

const { mountLeaderboard } = window.ASFCLeaderboard;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const scoreLcd = document.getElementById("scoreLcd");
const likesLcd = document.getElementById("likesLcd");
const bestLcd  = document.getElementById("bestLcd");
const statusEl = document.getElementById("vsStatus");
const startTip = document.getElementById("startTip");
const endOverlay = document.getElementById("endOverlay");
const endEmoji = document.getElementById("endEmoji");
const endMessage = document.getElementById("endMessage");
const endScore = document.getElementById("endScore");
const endLeaderboardEl = document.getElementById("endLeaderboard");
const vsLeaderboardEl = document.getElementById("vsLeaderboard");

const BEST_KEY = "asfc_viral_surfer_best";

const GROUND_Y = H - 48;
const GRAVITY = 0.7;
const JUMP_V = -13;
const DUCK_JUMP_V = -10;
const BASE_SPEED = 4.2;
const SPEED_RAMP = 0.0008; // per frame

// Surfer (the player)
const surfer = {
  x: 80,
  y: GROUND_Y,
  w: 32,
  h: 40,
  vy: 0,
  onGround: true,
  ducking: false,
  alive: true
};

const state = {
  running: false,
  speed: BASE_SPEED,
  distance: 0,        // raw frames * speed
  score: 0,
  likes: 0,
  combo: 0,
  comboTimer: 0,
  best: parseInt(localStorage.getItem(BEST_KEY) || "0", 10),
  obstacles: [],
  pickups: [],
  bgOffset: 0,
  spawnCooldown: 90,
  pickupCooldown: 50
};

// --- Input ---
let pointerJumpQueued = false;

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") { jump(); e.preventDefault(); }
  if (e.code === "ArrowDown") { surfer.ducking = true; e.preventDefault(); }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowDown") surfer.ducking = false;
});
canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  jump();
});

document.getElementById("endPlayAgain").addEventListener("click", () => {
  endOverlay.classList.add("hidden");
  startGame();
});
document.getElementById("endClose").addEventListener("click", () => endOverlay.classList.add("hidden"));
document.getElementById("newGameMenu").addEventListener("click", startGame);
document.getElementById("helpMenu").addEventListener("click", () => {
  alert("Tap, click, Space, or ↑ to jump. Hold ↓ to duck. Jump over thumbs-down 👎 haters. Duck under flying ⚠️ copyright strikes. Collect 👍 to build a combo and bank likes. The longer you surf the faster the feed gets.");
});

function jump() {
  if (!state.running) { startGame(); return; }
  if (!surfer.alive) return;
  if (surfer.onGround) {
    surfer.vy = surfer.ducking ? DUCK_JUMP_V : JUMP_V;
    surfer.onGround = false;
  }
}

function startGame() {
  state.running = true;
  state.speed = BASE_SPEED;
  state.distance = 0;
  state.score = 0;
  state.likes = 0;
  state.combo = 0;
  state.comboTimer = 0;
  state.obstacles = [];
  state.pickups = [];
  state.spawnCooldown = 60;
  state.pickupCooldown = 30;
  surfer.x = 80;
  surfer.y = GROUND_Y;
  surfer.vy = 0;
  surfer.onGround = true;
  surfer.alive = true;
  surfer.ducking = false;
  startTip.classList.add("hidden");
  endOverlay.classList.add("hidden");
  statusEl.textContent = "Surfing…";
  updateHud();
}

function endGame(cause) {
  state.running = false;
  surfer.alive = false;
  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem(BEST_KEY, String(state.best));
  }
  statusEl.textContent = `Cancelled — ${state.score} pts`;
  endEmoji.textContent = cause === "hater" ? "👎" : (cause === "strike" ? "⚠️" : "📉");
  endMessage.textContent = randomFrom([
    "You got rate-limited.",
    "The algorithm has unsubscribed.",
    "Your post was buried by the For You page.",
    "Cancelled. Try posting on Threads.",
    "Engagement bait detected."
  ]);
  endScore.textContent = state.score.toLocaleString();
  mountLeaderboard(endLeaderboardEl, {
    game: "viral_surfer",
    order: "desc",
    scoreLabel: "Score",
    formatScore: (s) => s.toLocaleString(),
    limit: 10,
    pendingScore: { score: state.score, meta: { likes: state.likes } },
    onSubmitted: refreshSideLeaderboard
  });
  endOverlay.classList.remove("hidden");
  updateHud();
}

function updateHud() {
  scoreLcd.textContent = state.score.toLocaleString();
  likesLcd.textContent = state.likes.toLocaleString();
  bestLcd.textContent  = state.best.toLocaleString();
}

// --- World ---
function spawnObstacle() {
  // 60/40 mix of haters (jumpable) vs copyright strikes (duckable)
  const isStrike = Math.random() < 0.4;
  if (isStrike) {
    state.obstacles.push({
      type: "strike",
      x: W + 20,
      y: GROUND_Y - 60, // flies high — must duck
      w: 36, h: 28,
      icon: "⚠️"
    });
  } else {
    // Ground hater(s) — sometimes a double
    const double = Math.random() < 0.18 && state.speed > 5;
    state.obstacles.push({ type: "hater", x: W + 20, y: GROUND_Y - 26, w: 26, h: 26, icon: "👎" });
    if (double) {
      state.obstacles.push({ type: "hater", x: W + 50, y: GROUND_Y - 26, w: 26, h: 26, icon: "👎" });
    }
  }
}

function spawnPickup() {
  // Floating 👍 — sometimes higher (requires jump)
  const high = Math.random() < 0.5;
  state.pickups.push({
    x: W + 20,
    y: high ? GROUND_Y - 80 : GROUND_Y - 30,
    w: 24, h: 24,
    icon: "👍",
    points: high ? 20 : 10
  });
}

function step() {
  state.distance += state.speed;
  state.score = Math.floor(state.distance / 5);
  state.speed = Math.min(11, BASE_SPEED + state.distance * SPEED_RAMP);
  state.bgOffset = (state.bgOffset + state.speed) % W;

  // Combo decay
  if (state.combo > 0) {
    state.comboTimer--;
    if (state.comboTimer <= 0) state.combo = 0;
  }

  // Spawn
  state.spawnCooldown--;
  if (state.spawnCooldown <= 0) {
    spawnObstacle();
    state.spawnCooldown = Math.max(36, Math.floor(80 - state.speed * 3));
  }
  state.pickupCooldown--;
  if (state.pickupCooldown <= 0) {
    spawnPickup();
    state.pickupCooldown = Math.max(45, Math.floor(110 - state.speed * 4) + Math.floor(Math.random() * 40));
  }

  // Physics
  surfer.vy += GRAVITY;
  surfer.y += surfer.vy;
  if (surfer.y >= GROUND_Y) {
    surfer.y = GROUND_Y;
    surfer.vy = 0;
    surfer.onGround = true;
  }

  // Move + cull obstacles
  state.obstacles.forEach((o) => o.x -= state.speed);
  state.pickups.forEach((p) => p.x -= state.speed);
  state.obstacles = state.obstacles.filter((o) => o.x + o.w > -10);
  state.pickups = state.pickups.filter((p) => p.x + p.w > -10);

  // Collisions
  const surferBox = surferHitbox();
  for (const o of state.obstacles) {
    if (boxOverlap(surferBox, o)) {
      endGame(o.type);
      return;
    }
  }
  for (let i = state.pickups.length - 1; i >= 0; i--) {
    const p = state.pickups[i];
    if (boxOverlap(surferBox, p)) {
      state.combo += 1;
      state.comboTimer = 120;
      const gain = p.points * (1 + Math.floor(state.combo / 3));
      state.likes += gain;
      state.score += gain;
      state.pickups.splice(i, 1);
    }
  }

  updateHud();
}

function surferHitbox() {
  const h = surfer.ducking ? surfer.h * 0.55 : surfer.h;
  return {
    x: surfer.x + 4,
    y: surfer.y - h,
    w: surfer.w - 8,
    h: h
  };
}

function boxOverlap(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// --- Render ---
function draw() {
  // Sky
  ctx.fillStyle = "#6ec9ff";
  ctx.fillRect(0, 0, W, GROUND_Y - 6);

  // Distant clouds (parallax)
  drawClouds();

  // Ocean / feed
  const grad = ctx.createLinearGradient(0, GROUND_Y - 6, 0, H);
  grad.addColorStop(0, "#0066cc");
  grad.addColorStop(1, "#003a78");
  ctx.fillStyle = grad;
  ctx.fillRect(0, GROUND_Y - 6, W, H - (GROUND_Y - 6));

  // Wave crest
  ctx.fillStyle = "#0080e0";
  ctx.fillRect(0, GROUND_Y - 6, W, 6);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  for (let i = 0; i < W; i += 24) {
    const xx = (i - state.bgOffset * 2) % W;
    ctx.fillRect((xx + W) % W, GROUND_Y - 6, 12, 2);
  }

  // Obstacles
  for (const o of state.obstacles) drawEmojiBox(o);
  for (const p of state.pickups) drawEmojiBox(p);

  // Surfer
  drawSurfer();

  // Combo display
  if (state.combo > 1) {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 18px 'MS Sans Serif', Tahoma";
    ctx.textAlign = "left";
    ctx.fillText(`x${state.combo} combo!`, 12, 28);
  }

  // Speed indicator
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.font = "11px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText(`speed ${state.speed.toFixed(1)}`, W - 8, 16);
}

function drawClouds() {
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 4; i++) {
    const baseX = (i * 220 - state.bgOffset * 0.3) % (W + 220);
    const x = baseX < 0 ? baseX + W + 220 : baseX;
    const y = 30 + (i % 2) * 18;
    drawCloud(x, y);
  }
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.arc(x + 14, y - 4, 14, 0, Math.PI * 2);
  ctx.arc(x + 30, y, 12, 0, Math.PI * 2);
  ctx.fill();
}

function drawEmojiBox(item) {
  ctx.font = "26px 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(item.icon, item.x + item.w / 2, item.y + item.h / 2);
}

function drawSurfer() {
  const cx = surfer.x + surfer.w / 2;
  const baseY = surfer.y;
  const ducking = surfer.ducking && surfer.onGround;
  // Surfboard
  ctx.fillStyle = "#ffce63";
  ctx.fillRect(surfer.x - 8, baseY - 6, surfer.w + 16, 8);
  ctx.fillStyle = "#a86b2a";
  ctx.fillRect(surfer.x - 8, baseY - 2, surfer.w + 16, 2);
  // Body
  if (ducking) {
    ctx.fillStyle = "#0080ff";
    ctx.fillRect(cx - 12, baseY - 22, 24, 16);
    // Head
    ctx.fillStyle = "#ffd6a0";
    ctx.beginPath();
    ctx.arc(cx + 8, baseY - 24, 7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Legs
    ctx.fillStyle = "#22356a";
    ctx.fillRect(cx - 8, baseY - 22, 6, 18);
    ctx.fillRect(cx + 2, baseY - 22, 6, 18);
    // Body
    ctx.fillStyle = "#0080ff";
    ctx.fillRect(cx - 10, baseY - 36, 20, 18);
    // Head
    ctx.fillStyle = "#ffd6a0";
    ctx.beginPath();
    ctx.arc(cx, baseY - 42, 7, 0, Math.PI * 2);
    ctx.fill();
    // Hair / cap
    ctx.fillStyle = "#222";
    ctx.fillRect(cx - 7, baseY - 47, 14, 4);
    // Arms — one out for balance, animate
    ctx.strokeStyle = "#ffd6a0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    const armSwing = Math.sin(state.distance * 0.3) * 4;
    ctx.moveTo(cx - 10, baseY - 30);
    ctx.lineTo(cx - 18, baseY - 28 + armSwing);
    ctx.moveTo(cx + 10, baseY - 30);
    ctx.lineTo(cx + 18, baseY - 28 - armSwing);
    ctx.stroke();
  }
}

function loop() {
  if (state.running && surfer.alive) step();
  draw();
  requestAnimationFrame(loop);
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Leaderboard side panel ---
function refreshSideLeaderboard() {
  mountLeaderboard(vsLeaderboardEl, {
    game: "viral_surfer",
    order: "desc",
    scoreLabel: "Score",
    formatScore: (s) => s.toLocaleString(),
    limit: 10
  });
}

// --- Init ---
updateHud();
refreshSideLeaderboard();
draw();
loop();
