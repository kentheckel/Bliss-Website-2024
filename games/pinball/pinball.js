// Space Antisocial — simple pinball.
// Vanilla canvas, no physics lib. Bumpers, two flippers, a plunger lane.

const { mountLeaderboard } = window.ASFCLeaderboard;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const scoreLcd = document.getElementById("scoreLcd");
const ballsLcd = document.getElementById("ballsLcd");
const bestLcd = document.getElementById("bestLcd");
const statusEl = document.getElementById("pbStatus");
const endOverlay = document.getElementById("endOverlay");
const endMessage = document.getElementById("endMessage");
const endScore = document.getElementById("endScore");
const endLeaderboardEl = document.getElementById("endLeaderboard");
const pbLeaderboardEl = document.getElementById("pbLeaderboard");

const BEST_KEY = "asfc_pinball_best";

// --- World ---
const WALL = 8;
const PLUNGER_W = 26;
const PLUNGER_X = W - WALL - PLUNGER_W;
const PLAY_W = PLUNGER_X - WALL;

const game = {
  score: 0,
  balls: 3,
  best: parseInt(localStorage.getItem(BEST_KEY) || "0", 10),
  running: false,
  ballInPlay: false,
  message: ""
};

// Bumpers (round, bouncy)
const bumpers = [
  { x: WALL + PLAY_W * 0.32, y: 140, r: 22, points: 100, color: "#ff3b8a", glow: 0 },
  { x: WALL + PLAY_W * 0.68, y: 140, r: 22, points: 100, color: "#22c1ff", glow: 0 },
  { x: WALL + PLAY_W * 0.50, y: 210, r: 22, points: 150, color: "#ffd34d", glow: 0 }
];

// Slingshots (triangle bumpers above flippers)
const slings = [
  { x1: WALL + 8, y1: 380, x2: WALL + 80, y2: 420, points: 50, glow: 0 },
  { x1: PLUNGER_X - 8, y1: 380, x2: PLUNGER_X - 80, y2: 420, points: 50, glow: 0 }
];

// Passive lane guides — angled walls that deflect the ball into the playfield
// when it cresting the plunger lane. No points, no kick — pure reflection.
const guides = [
  { x1: W - WALL - 2, y1: 28, x2: PLUNGER_X - 28, y2: LANE_TOP_Y + 6 }
];

// Drop targets — top row of "viral" letters
const targets = [
  { x: WALL + 36, y: 70, w: 30, h: 14, hit: false, label: "V" },
  { x: WALL + 76, y: 70, w: 30, h: 14, hit: false, label: "I" },
  { x: WALL + 116, y: 70, w: 30, h: 14, hit: false, label: "R" },
  { x: WALL + 156, y: 70, w: 30, h: 14, hit: false, label: "A" },
  { x: WALL + 196, y: 70, w: 30, h: 14, hit: false, label: "L" }
];

// Flippers
const FLIPPER_LEN = 56;
const FLIPPER_REST_ANG = 0.45; // radians from horizontal
const FLIPPER_ACTIVE_ANG = -0.45;
const flippers = {
  left:  { pivotX: WALL + 70, pivotY: H - 60, angle: FLIPPER_REST_ANG, target: FLIPPER_REST_ANG, side: -1 },
  right: { pivotX: PLUNGER_X - 70, pivotY: H - 60, angle: Math.PI - FLIPPER_REST_ANG, target: Math.PI - FLIPPER_REST_ANG, side: 1 }
};

// Plunger
const plunger = {
  y: H - 30,
  charge: 0,    // 0..1
  charging: false,
  released: false
};
const PLUNGER_CHARGE_RATE = 0.035;   // full charge in ~30 frames
const PLUNGER_MIN_VY = 22;           // even an instant tap clears the lane
const PLUNGER_MAX_BONUS = 12;        // full pull adds this much on top

// Ball
const ball = {
  x: PLUNGER_X + PLUNGER_W / 2,
  y: H - 50,
  vx: 0,
  vy: 0,
  r: 8,
  alive: false
};

const GRAVITY = 0.32;
const FRICTION = 0.995;
const BALL_MAX_V = 30;       // raised so plunger launches aren't clamped flat on frame 1
// Plunger lane geometry — divider only exists below LANE_TOP_Y so the ball
// can crest the top and arc back into the playfield.
const LANE_TOP_Y = 90;
const BUMPER_KICK = 1.6;     // additive impulse, not multiplicative — keeps bounces predictable
const SLING_KICK = 2.2;

// --- Input ---
const keys = { left: false, right: false, space: false };
document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft")  { keys.left = true;  e.preventDefault(); }
  if (e.code === "ArrowRight") { keys.right = true; e.preventDefault(); }
  if (e.code === "Space") {
    if (!ball.alive && game.balls > 0) plunger.charging = true;
    else { keys.space = true; nudge(); }
    e.preventDefault();
  }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft")  keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
  if (e.code === "Space") {
    if (plunger.charging) {
      plunger.charging = false;
      plunger.released = true;
    }
    keys.space = false;
  }
});

document.getElementById("launchBtn").addEventListener("click", launchBall);
document.getElementById("newGameBtn").addEventListener("click", newGame);
document.getElementById("endPlayAgain").addEventListener("click", () => {
  endOverlay.classList.add("hidden");
  newGame();
});
document.getElementById("endClose").addEventListener("click", () => endOverlay.classList.add("hidden"));
document.getElementById("newGameMenu").addEventListener("click", newGame);
document.getElementById("helpMenu").addEventListener("click", () => {
  alert("Left/right arrows = flippers. Space = launch ball (hold to charge). Hit bumpers and the V-I-R-A-L drop targets. You have 3 balls. Don't drain.");
});

function nudge() {
  if (!ball.alive) return;
  ball.vx += (Math.random() - 0.5) * 1.2;
  ball.vy -= 0.6;
}

function newGame() {
  game.score = 0;
  game.balls = 3;
  game.running = true;
  game.ballInPlay = false;
  endOverlay.classList.add("hidden");
  targets.forEach((t) => (t.hit = false));
  resetBallToPlunger();
  statusEl.textContent = "Press Space (hold) or Launch Ball";
  updateHud();
}

function launchBall() {
  if (game.balls <= 0 || ball.alive) return;
  resetBallToPlunger();
  ball.alive = true;
  // One-click launch — strong enough to comfortably clear the lane and hit play.
  ball.vy = -(PLUNGER_MIN_VY + 6 + Math.random() * 3);
  ball.vx = -(0.5 + Math.random() * 0.4);
  game.ballInPlay = true;
  statusEl.textContent = "Ball in play";
}

function resetBallToPlunger() {
  ball.x = PLUNGER_X + PLUNGER_W / 2;
  ball.y = H - 50;
  ball.vx = 0;
  ball.vy = 0;
  ball.alive = false;
}

function ballLost() {
  game.ballInPlay = false;
  ball.alive = false;
  game.balls -= 1;
  if (game.balls <= 0) {
    gameOver();
  } else {
    statusEl.textContent = `Ball drained — ${game.balls} left`;
    resetBallToPlunger();
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
    "Channel terminated.",
    "Try harder. The feed never sleeps.",
    "Almost trending."
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
  bestLcd.textContent = String(game.best);
}

function addScore(n) {
  game.score += n;
  updateHud();
}

// --- Update loop ---
function step() {
  // Plunger charge
  if (plunger.charging) plunger.charge = Math.min(1, plunger.charge + PLUNGER_CHARGE_RATE);
  if (plunger.released) {
    if (!ball.alive && game.balls > 0) {
      ball.alive = true;
      ball.vy = -(PLUNGER_MIN_VY + plunger.charge * PLUNGER_MAX_BONUS);
      ball.vx = -(0.5 + Math.random() * 0.4);
      game.ballInPlay = true;
      statusEl.textContent = "Ball in play";
    }
    plunger.charge = 0;
    plunger.released = false;
  }

  // Flipper interpolation
  flippers.left.target  = keys.left  ? FLIPPER_ACTIVE_ANG : FLIPPER_REST_ANG;
  flippers.right.target = keys.right ? Math.PI - FLIPPER_ACTIVE_ANG : Math.PI - FLIPPER_REST_ANG;
  flippers.left.angle  += (flippers.left.target  - flippers.left.angle)  * 0.35;
  flippers.right.angle += (flippers.right.target - flippers.right.angle) * 0.35;

  // Ball physics
  if (ball.alive) {
    ball.vy += GRAVITY;
    ball.vx *= FRICTION;
    ball.vy *= FRICTION;
    ball.vx = clamp(ball.vx, -BALL_MAX_V, BALL_MAX_V);
    ball.vy = clamp(ball.vy, -BALL_MAX_V, BALL_MAX_V);
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Outer walls
    if (ball.x < WALL + ball.r) { ball.x = WALL + ball.r; ball.vx = Math.abs(ball.vx) * 0.85; }
    if (ball.x > W - WALL - ball.r) { ball.x = W - WALL - ball.r; ball.vx = -Math.abs(ball.vx) * 0.85; }
    if (ball.y < WALL + ball.r + 20) { ball.y = WALL + ball.r + 20; ball.vy = Math.abs(ball.vy) * 0.85; }

    // Plunger-lane divider — only exists below LANE_TOP_Y, opens at the top
    // so the ball can crest into the playfield. Two-sided wall based on
    // which side of the divider the ball center currently sits on.
    if (ball.y > LANE_TOP_Y) {
      if (ball.x < PLUNGER_X) {
        // Playfield side — wall on the right
        if (ball.x + ball.r > PLUNGER_X) {
          ball.x = PLUNGER_X - ball.r;
          ball.vx = -Math.abs(ball.vx) * 0.85;
        }
      } else {
        // Lane side — wall on the left
        if (ball.x - ball.r < PLUNGER_X) {
          ball.x = PLUNGER_X + ball.r;
          ball.vx = Math.abs(ball.vx) * 0.85;
        }
      }
    } else {
      // Above the lane opening — gentle nudge leftward so the ball
      // reliably arcs into the playfield instead of falling straight back.
      if (ball.x > PLUNGER_X - 10 && ball.vy < 2) {
        ball.vx -= 0.18;
      }
    }

    // Lane guides — passive angled walls that send the ball into play.
    guides.forEach((g) => {
      const hit = pointToSegment(ball.x, ball.y, g.x1, g.y1, g.x2, g.y2);
      if (hit.dist < ball.r + 3) {
        const nx = ball.x - hit.px;
        const ny = ball.y - hit.py;
        const m = Math.hypot(nx, ny) || 1;
        const nnx = nx / m, nny = ny / m;
        ball.x = hit.px + nnx * (ball.r + 3);
        ball.y = hit.py + nny * (ball.r + 3);
        const dot = ball.vx * nnx + ball.vy * nny;
        ball.vx = (ball.vx - 2 * dot * nnx) * 0.9;
        ball.vy = (ball.vy - 2 * dot * nny) * 0.9;
      }
    });

    // Bumpers — reflect, then add a fixed outward impulse (predictable).
    bumpers.forEach((b) => {
      const dx = ball.x - b.x;
      const dy = ball.y - b.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < b.r + ball.r) {
        const nx = dx / d, ny = dy / d;
        ball.x = b.x + nx * (b.r + ball.r);
        ball.y = b.y + ny * (b.r + ball.r);
        const dot = ball.vx * nx + ball.vy * ny;
        ball.vx = (ball.vx - 2 * dot * nx) * 0.85 + nx * BUMPER_KICK;
        ball.vy = (ball.vy - 2 * dot * ny) * 0.85 + ny * BUMPER_KICK;
        b.glow = 12;
        addScore(b.points);
      } else if (b.glow > 0) b.glow--;
    });

    // Slingshots (line segments) — reflect, then fixed outward kick.
    slings.forEach((s) => {
      const hit = pointToSegment(ball.x, ball.y, s.x1, s.y1, s.x2, s.y2);
      if (hit.dist < ball.r + 4) {
        const nx = (ball.x - hit.px), ny = (ball.y - hit.py);
        const m = Math.hypot(nx, ny) || 1;
        const nnx = nx / m, nny = ny / m;
        ball.x = hit.px + nnx * (ball.r + 4);
        ball.y = hit.py + nny * (ball.r + 4);
        const dot = ball.vx * nnx + ball.vy * nny;
        ball.vx = (ball.vx - 2 * dot * nnx) * 0.85 + nnx * SLING_KICK;
        ball.vy = (ball.vy - 2 * dot * nny) * 0.85 + nny * SLING_KICK;
        s.glow = 10;
        addScore(s.points);
      } else if (s.glow > 0) s.glow--;
    });

    // Drop targets
    targets.forEach((t) => {
      if (t.hit) return;
      if (ball.x + ball.r > t.x && ball.x - ball.r < t.x + t.w &&
          ball.y + ball.r > t.y && ball.y - ball.r < t.y + t.h) {
        t.hit = true;
        addScore(200);
        ball.vy = Math.abs(ball.vy) + 1;
      }
    });
    // Bonus when all VIRAL letters dropped
    if (targets.every((t) => t.hit)) {
      addScore(2000);
      targets.forEach((t) => (t.hit = false));
      statusEl.textContent = "VIRAL! +2000 bonus";
    }

    // Flipper collisions
    handleFlipperCollision(flippers.left);
    handleFlipperCollision(flippers.right);

    // Drain
    if (ball.y > H + 20) ballLost();
  }
}

function handleFlipperCollision(f) {
  // Compute flipper segment endpoints
  const ex = f.pivotX + Math.cos(f.angle) * FLIPPER_LEN;
  const ey = f.pivotY + Math.sin(f.angle) * FLIPPER_LEN;
  const hit = pointToSegment(ball.x, ball.y, f.pivotX, f.pivotY, ex, ey);
  if (hit.dist < ball.r + 6) {
    const nx = (ball.x - hit.px);
    const ny = (ball.y - hit.py);
    const m = Math.hypot(nx, ny) || 1;
    const nnx = nx / m, nny = ny / m;
    ball.x = hit.px + nnx * (ball.r + 6);
    ball.y = hit.py + nny * (ball.r + 6);
    const dot = ball.vx * nnx + ball.vy * nny;
    ball.vx -= 2 * dot * nnx;
    ball.vy -= 2 * dot * nny;
    // Boost if flipper is rising (going from rest toward active)
    const active = (f.side === -1 && keys.left) || (f.side === 1 && keys.right);
    if (active) {
      ball.vy -= 6;
      ball.vx += f.side * -3; // push toward center
    }
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
  // Background
  ctx.fillStyle = "#001020";
  ctx.fillRect(0, 0, W, H);

  // Side walls
  ctx.fillStyle = "#2a3550";
  ctx.fillRect(0, 0, WALL, H);
  ctx.fillRect(W - WALL, 0, WALL, H);
  ctx.fillRect(0, 0, W, WALL + 12);
  // Plunger lane divider — opens at the top so the ball can enter the playfield
  ctx.fillRect(PLUNGER_X - 2, LANE_TOP_Y, 2, H - LANE_TOP_Y);
  // Curved kicker visual at the top of the lane
  ctx.strokeStyle = "#2a3550";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(PLUNGER_X, LANE_TOP_Y, 22, -Math.PI / 2, 0);
  ctx.stroke();

  // Drop targets (V I R A L)
  targets.forEach((t) => {
    ctx.fillStyle = t.hit ? "#222" : "#ffe066";
    ctx.fillRect(t.x, t.y, t.w, t.h);
    ctx.strokeStyle = "#000"; ctx.lineWidth = 1;
    ctx.strokeRect(t.x + 0.5, t.y + 0.5, t.w, t.h);
    if (!t.hit) {
      ctx.fillStyle = "#000";
      ctx.font = "bold 11px 'MS Sans Serif', Tahoma, sans-serif";
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
    ctx.font = "bold 12px 'MS Sans Serif', Tahoma";
    ctx.textAlign = "center";
    ctx.fillText("•", b.x, b.y + 4);
  });

  // Slingshots
  slings.forEach((s) => {
    ctx.strokeStyle = s.glow > 0 ? "#fff" : "#888";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
  });

  // Lane guides — chrome bar that sends launched balls into play
  guides.forEach((g) => {
    ctx.strokeStyle = "#aacbe6";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(g.x1, g.y1);
    ctx.lineTo(g.x2, g.y2);
    ctx.stroke();
    // highlight
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.x1, g.y1 - 1);
    ctx.lineTo(g.x2, g.y2 - 1);
    ctx.stroke();
  });

  // Flippers
  drawFlipper(flippers.left);
  drawFlipper(flippers.right);

  // Drain mouth indicators
  ctx.strokeStyle = "#552233"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(WALL, H - 80);
  ctx.lineTo(flippers.left.pivotX, flippers.left.pivotY);
  ctx.moveTo(PLUNGER_X, H - 80);
  ctx.lineTo(flippers.right.pivotX, flippers.right.pivotY);
  ctx.stroke();

  // Plunger
  ctx.fillStyle = "#444";
  ctx.fillRect(PLUNGER_X + 4, plunger.y - plunger.charge * 18, PLUNGER_W - 8, 18 + plunger.charge * 18);
  ctx.strokeStyle = "#777"; ctx.lineWidth = 1;
  ctx.strokeRect(PLUNGER_X + 4 + 0.5, plunger.y - plunger.charge * 18 + 0.5, PLUNGER_W - 8, 18 + plunger.charge * 18);

  // Ball
  if (ball.alive) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#888";
    ctx.stroke();
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (!game.running) {
    // Title overlay handled by end modal
  } else {
    // Ball waiting at plunger
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(PLUNGER_X + PLUNGER_W / 2, plunger.y - 10, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFlipper(f) {
  const ex = f.pivotX + Math.cos(f.angle) * FLIPPER_LEN;
  const ey = f.pivotY + Math.sin(f.angle) * FLIPPER_LEN;
  ctx.strokeStyle = "#ff3b8a";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(f.pivotX, f.pivotY);
  ctx.lineTo(ex, ey);
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

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Leaderboard side panel ---
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
