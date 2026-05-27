// Space Antisocial Pinball v2 — simpler, slower, no plunger lane.
// Ball drops in from the top of the playfield. Two flippers defend a
// drain at the bottom. Bumpers, slingshots, and a V-I-R-A-L drop-target
// row score points. Physics uses two substeps per frame so a ball moving
// at full speed can't tunnel through a wall or flipper.

const { mountLeaderboard } = window.ASFCLeaderboard;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const W = canvas.width;   // 360
const H = canvas.height;  // 540

const scoreLcd = document.getElementById("scoreLcd");
const ballsLcd = document.getElementById("ballsLcd");
const bestLcd  = document.getElementById("bestLcd");
const statusEl = document.getElementById("pbStatus");
const endOverlay = document.getElementById("endOverlay");
const endMessage = document.getElementById("endMessage");
const endScore = document.getElementById("endScore");
const endLeaderboardEl = document.getElementById("endLeaderboard");
const pbLeaderboardEl = document.getElementById("pbLeaderboard");

const BEST_KEY = "asfc_pinball_best";

// --- World ---
const WALL = 14;
const GRAVITY = 0.18;
const FRICTION = 0.996;
const BALL_MAX_V = 11;          // low enough that two half-step collisions never tunnel
const BUMPER_KICK = 3.0;
const SLING_KICK = 4.0;
const FLIPPER_KICK = 9.0;

// Drain geometry — flipper pivots and the gap they leave open
const LEFT_PIVOT_X  = 120;
const RIGHT_PIVOT_X = W - 120;
const PIVOT_Y = H - 70;

const FLIPPER_LEN = 52;
const FLIPPER_REST_ANG = 0.45;
const FLIPPER_ACTIVE_ANG = -0.55;

// --- Game state ---
const game = {
  score: 0,
  balls: 3,
  best: parseInt(localStorage.getItem(BEST_KEY) || "0", 10),
  running: false
};

const ball = {
  x: W - 40,
  y: 60,
  vx: 0,
  vy: 0,
  r: 8,
  alive: false
};

// Bumpers (round, springy)
const bumpers = [
  { x: W * 0.30, y: 170, r: 22, points: 100, color: "#ff3b8a", glow: 0 },
  { x: W * 0.70, y: 170, r: 22, points: 100, color: "#22c1ff", glow: 0 },
  { x: W * 0.50, y: 240, r: 22, points: 150, color: "#ffd34d", glow: 0 }
];

// Drop targets — V I R A L
const targets = [
  { x: WALL + 24,  y: 90, w: 28, h: 14, hit: false, label: "V" },
  { x: WALL + 62,  y: 90, w: 28, h: 14, hit: false, label: "I" },
  { x: WALL + 100, y: 90, w: 28, h: 14, hit: false, label: "R" },
  { x: WALL + 138, y: 90, w: 28, h: 14, hit: false, label: "A" },
  { x: WALL + 176, y: 90, w: 28, h: 14, hit: false, label: "L" }
];

// Slingshots — angled bumper segments above the flippers
const slings = [
  { x1: WALL,        y1: 380, x2: WALL + 70,     y2: 430, points: 50, glow: 0 },
  { x1: W - WALL,    y1: 380, x2: W - WALL - 70, y2: 430, points: 50, glow: 0 }
];

// Side rails — slope from slingshot ends down to flipper pivots
const sideRails = [
  { x1: WALL + 70,     y1: 430, x2: LEFT_PIVOT_X,  y2: PIVOT_Y },
  { x1: W - WALL - 70, y1: 430, x2: RIGHT_PIVOT_X, y2: PIVOT_Y }
];

// Flippers
const flippers = {
  left:  { pivotX: LEFT_PIVOT_X,  pivotY: PIVOT_Y, angle: FLIPPER_REST_ANG,             side: -1 },
  right: { pivotX: RIGHT_PIVOT_X, pivotY: PIVOT_Y, angle: Math.PI - FLIPPER_REST_ANG,   side: 1  }
};

// --- Input ---
const keys = { left: false, right: false };
document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft")  { keys.left = true;  e.preventDefault(); }
  if (e.code === "ArrowRight") { keys.right = true; e.preventDefault(); }
  if (e.code === "Space")      { tryLaunch();       e.preventDefault(); }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft")  keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
});

document.getElementById("launchBtn").addEventListener("click", tryLaunch);
document.getElementById("newGameBtn").addEventListener("click", newGame);
document.getElementById("endPlayAgain").addEventListener("click", () => {
  endOverlay.classList.add("hidden");
  newGame();
});
document.getElementById("endClose").addEventListener("click", () => endOverlay.classList.add("hidden"));
document.getElementById("newGameMenu").addEventListener("click", newGame);
document.getElementById("helpMenu").addEventListener("click", () => {
  alert("Press Space (or Launch Ball) to drop the ball into play. Left/Right arrows flip the flippers. Hit bumpers, slingshots, and V-I-R-A-L drop targets for points. Don't drain.");
});

// --- Lifecycle ---
function newGame() {
  game.score = 0;
  game.balls = 3;
  game.running = true;
  targets.forEach((t) => (t.hit = false));
  resetBall();
  statusEl.textContent = "Press Space to drop the ball";
  endOverlay.classList.add("hidden");
  updateHud();
}

function resetBall() {
  ball.x = W - 40;
  ball.y = 60;
  ball.vx = 0;
  ball.vy = 0;
  ball.alive = false;
}

function tryLaunch() {
  if (!game.running) { newGame(); return; }
  if (game.balls <= 0 || ball.alive) return;
  resetBall();
  ball.alive = true;
  // Gentle leftward drop — drifts naturally into bumpers without overshooting.
  ball.vx = -0.6 - Math.random() * 0.4;
  ball.vy = 1.5 + Math.random();
  statusEl.textContent = "Ball in play";
}

function ballLost() {
  ball.alive = false;
  game.balls--;
  if (game.balls <= 0) {
    gameOver();
  } else {
    resetBall();
    statusEl.textContent = `Drained — ${game.balls} ball(s) left. Press Space.`;
  }
  updateHud();
}

function gameOver() {
  game.running = false;
  if (game.score > game.best) {
    game.best = game.score;
    localStorage.setItem(BEST_KEY, String(game.best));
  }
  statusEl.textContent = `Game over — ${game.score} pts`;
  endMessage.textContent = randomFrom([
    "The algorithm has spoken.",
    "Try harder. The feed never sleeps.",
    "Almost trending.",
    "Cancelled.",
    "Engagement bait detected."
  ]);
  endScore.textContent = String(game.score);
  mountLeaderboard(endLeaderboardEl, {
    game: "pinball",
    order: "desc",
    scoreLabel: "Score",
    formatScore: (s) => s.toLocaleString(),
    limit: 10,
    pendingScore: { score: game.score, meta: {} },
    onSubmitted: refreshSideLeaderboard
  });
  endOverlay.classList.remove("hidden");
  updateHud();
}

function updateHud() {
  scoreLcd.textContent = game.score.toLocaleString();
  ballsLcd.textContent = String(game.balls);
  bestLcd.textContent = game.best.toLocaleString();
}

function addScore(n) { game.score += n; updateHud(); }

// --- Physics ---
function step() {
  // Flipper interpolation (smooth rotation toward target angle)
  const lTarget = keys.left  ? FLIPPER_ACTIVE_ANG               : FLIPPER_REST_ANG;
  const rTarget = keys.right ? Math.PI - FLIPPER_ACTIVE_ANG     : Math.PI - FLIPPER_REST_ANG;
  flippers.left.angle  += (lTarget - flippers.left.angle)  * 0.45;
  flippers.right.angle += (rTarget - flippers.right.angle) * 0.45;

  if (!ball.alive) return;

  ball.vy += GRAVITY;
  ball.vx *= FRICTION;
  ball.vy *= FRICTION;
  ball.vx = clamp(ball.vx, -BALL_MAX_V, BALL_MAX_V);
  ball.vy = clamp(ball.vy, -BALL_MAX_V, BALL_MAX_V);

  // Two substeps per frame so half-step distance is < ball radius
  for (let s = 0; s < 2; s++) {
    ball.x += ball.vx / 2;
    ball.y += ball.vy / 2;
    handleCollisions();
  }

  if (ball.y > H + 30) ballLost();
}

function handleCollisions() {
  // Outer walls
  if (ball.x < WALL + ball.r)      { ball.x = WALL + ball.r;     ball.vx = Math.abs(ball.vx) * 0.85; }
  if (ball.x > W - WALL - ball.r)  { ball.x = W - WALL - ball.r; ball.vx = -Math.abs(ball.vx) * 0.85; }
  if (ball.y < WALL + ball.r)      { ball.y = WALL + ball.r;     ball.vy = Math.abs(ball.vy) * 0.85; }

  // Bumpers — circular, reflect + kick
  bumpers.forEach((b) => {
    const dx = ball.x - b.x;
    const dy = ball.y - b.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < b.r + ball.r) {
      const nx = dx / d, ny = dy / d;
      ball.x = b.x + nx * (b.r + ball.r);
      ball.y = b.y + ny * (b.r + ball.r);
      const dot = ball.vx * nx + ball.vy * ny;
      if (dot < 0) {
        ball.vx = (ball.vx - 2 * dot * nx) * 0.85 + nx * BUMPER_KICK;
        ball.vy = (ball.vy - 2 * dot * ny) * 0.85 + ny * BUMPER_KICK;
      }
      b.glow = 12;
      addScore(b.points);
    } else if (b.glow > 0) b.glow--;
  });

  // Slingshots — reflect + kick + score
  slings.forEach((s) => reflectOffSegment(s, SLING_KICK, s.points));
  // Side rails — reflect only
  sideRails.forEach((r) => reflectOffSegment(r, 0, 0));

  // Drop targets
  targets.forEach((t) => {
    if (t.hit) return;
    if (ball.x + ball.r > t.x && ball.x - ball.r < t.x + t.w &&
        ball.y + ball.r > t.y && ball.y - ball.r < t.y + t.h) {
      t.hit = true;
      addScore(200);
      ball.vy = Math.abs(ball.vy) + 1.5; // bounce away downward
    }
  });
  if (targets.every((t) => t.hit)) {
    addScore(2000);
    targets.forEach((t) => (t.hit = false));
    statusEl.textContent = "V-I-R-A-L! +2000";
  }

  // Flippers
  handleFlipper(flippers.left);
  handleFlipper(flippers.right);
}

// Reflect ball off a line segment using the segment's geometric normal.
// `kick` is an outward impulse magnitude (0 for passive walls).
function reflectOffSegment(seg, kick, points) {
  const hit = pointToSegment(ball.x, ball.y, seg.x1, seg.y1, seg.x2, seg.y2);
  if (hit.dist >= ball.r + 3) {
    if (seg.glow > 0) seg.glow--;
    return;
  }
  const tx = seg.x2 - seg.x1;
  const ty = seg.y2 - seg.y1;
  const tl = Math.hypot(tx, ty) || 1;
  // Perpendicular to the segment
  let nx = -ty / tl;
  let ny = tx / tl;
  // Flip to the side the ball center is on
  if ((ball.x - hit.px) * nx + (ball.y - hit.py) * ny < 0) {
    nx = -nx; ny = -ny;
  }
  ball.x = hit.px + nx * (ball.r + 3);
  ball.y = hit.py + ny * (ball.r + 3);
  const dot = ball.vx * nx + ball.vy * ny;
  if (dot < 0) {
    ball.vx = (ball.vx - 2 * dot * nx) * 0.88 + nx * kick;
    ball.vy = (ball.vy - 2 * dot * ny) * 0.88 + ny * kick;
  }
  if (kick > 0) {
    seg.glow = 10;
    if (points) addScore(points);
  }
}

function handleFlipper(f) {
  const tipX = f.pivotX + Math.cos(f.angle) * FLIPPER_LEN;
  const tipY = f.pivotY + Math.sin(f.angle) * FLIPPER_LEN;
  const hit = pointToSegment(ball.x, ball.y, f.pivotX, f.pivotY, tipX, tipY);
  if (hit.dist >= ball.r + 6) return;

  const tx = tipX - f.pivotX, ty = tipY - f.pivotY;
  const tl = Math.hypot(tx, ty) || 1;
  let nx = -ty / tl, ny = tx / tl;
  // Pick the side facing the ball
  if ((ball.x - hit.px) * nx + (ball.y - hit.py) * ny < 0) {
    nx = -nx; ny = -ny;
  }
  ball.x = hit.px + nx * (ball.r + 6);
  ball.y = hit.py + ny * (ball.r + 6);
  const dot = ball.vx * nx + ball.vy * ny;
  if (dot < 0) {
    ball.vx = (ball.vx - 2 * dot * nx) * 0.85;
    ball.vy = (ball.vy - 2 * dot * ny) * 0.85;
  }
  // If the flipper is being held, add an upward + inward kick.
  const active = (f.side === -1 && keys.left) || (f.side === 1 && keys.right);
  if (active) {
    ball.vy -= FLIPPER_KICK;
    ball.vx += f.side * -2.5;
  }
}

function pointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx, cy = y1 + t * dy;
  return { px: cx, py: cy, dist: Math.hypot(px - cx, py - cy) };
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// --- Render ---
function draw() {
  // Playfield background
  ctx.fillStyle = "#001020";
  ctx.fillRect(0, 0, W, H);

  // Outer walls
  ctx.fillStyle = "#2a3550";
  ctx.fillRect(0, 0, W, WALL);
  ctx.fillRect(0, 0, WALL, H);
  ctx.fillRect(W - WALL, 0, WALL, H);

  // Drop targets
  targets.forEach((t) => {
    ctx.fillStyle = t.hit ? "#222" : "#ffe066";
    ctx.fillRect(t.x, t.y, t.w, t.h);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(t.x + 0.5, t.y + 0.5, t.w, t.h);
    if (!t.hit) {
      ctx.fillStyle = "#000";
      ctx.font = "bold 11px 'MS Sans Serif', Tahoma";
      ctx.textAlign = "center";
      ctx.fillText(t.label, t.x + t.w / 2, t.y + 11);
    }
  });

  // Bumpers
  bumpers.forEach((b) => {
    const glow = b.glow / 12;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.4 + glow * 0.6})`;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Slingshots
  slings.forEach((s) => {
    ctx.strokeStyle = s.glow > 0 ? "#fff" : "#888";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
  });

  // Side rails
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  sideRails.forEach((r) => {
    ctx.beginPath();
    ctx.moveTo(r.x1, r.y1);
    ctx.lineTo(r.x2, r.y2);
    ctx.stroke();
  });

  // Flippers
  drawFlipper(flippers.left);
  drawFlipper(flippers.right);

  // Ball or prompt
  if (ball.alive) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (game.running && game.balls > 0) {
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "bold 16px 'MS Sans Serif', Tahoma";
    ctx.textAlign = "center";
    ctx.fillText("Press Space to drop", W / 2, H / 2);
  }
}

function drawFlipper(f) {
  const tipX = f.pivotX + Math.cos(f.angle) * FLIPPER_LEN;
  const tipY = f.pivotY + Math.sin(f.angle) * FLIPPER_LEN;
  ctx.strokeStyle = "#ff3b8a";
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(f.pivotX, f.pivotY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(f.pivotX, f.pivotY, 3, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  if (game.running) step();
  draw();
  requestAnimationFrame(loop);
}

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function refreshSideLeaderboard() {
  mountLeaderboard(pbLeaderboardEl, {
    game: "pinball",
    order: "desc",
    scoreLabel: "Score",
    formatScore: (s) => s.toLocaleString(),
    limit: 10
  });
}

// --- Init ---
updateHud();
refreshSideLeaderboard();
newGame();
loop();
