// SHADOWBAN.exe — social-media themed hangman.

const { mountLeaderboard } = window.ASFCLeaderboard;

const WORDS = [
  { word: "ALGORITHM",     cat: "THE BLACK BOX" },
  { word: "SHADOWBAN",     cat: "FATE WORSE THAN A STRIKE" },
  { word: "MRBEAST",       cat: "CREATOR" },
  { word: "THUMBNAIL",     cat: "THE CLICK FACTORY" },
  { word: "DEMONETIZED",   cat: "FATE WORSE THAN A STRIKE" },
  { word: "SUBSCRIBE",     cat: "CALL TO ACTION" },
  { word: "CLICKBAIT",     cat: "THE CLICK FACTORY" },
  { word: "RETENTION",     cat: "THE METRIC" },
  { word: "WATCHTIME",     cat: "THE METRIC" },
  { word: "IMPRESSIONS",   cat: "THE METRIC" },
  { word: "ENGAGEMENT",    cat: "THE METRIC" },
  { word: "SHORTS",        cat: "FORMAT" },
  { word: "LIVESTREAM",    cat: "FORMAT" },
  { word: "TRENDING",      cat: "DISCOVERABILITY" },
  { word: "VIRAL",         cat: "DISCOVERABILITY" },
  { word: "COMMUNITY",     cat: "AUDIENCE" },
  { word: "INFLUENCER",    cat: "CREATOR" },
  { word: "CREATOR",       cat: "CREATOR" },
  { word: "MONETIZATION",  cat: "THE BAG" },
  { word: "SPONSORSHIP",   cat: "THE BAG" },
  { word: "COPYRIGHT",     cat: "LEGAL TROUBLE" },
  { word: "STRIKE",        cat: "LEGAL TROUBLE" },
  { word: "ANALYTICS",     cat: "TOOLS OF THE TRADE" },
  { word: "DASHBOARD",     cat: "TOOLS OF THE TRADE" },
  { word: "ANTISOCIAL",    cat: "VIBE" },
  { word: "DOPAMINE",      cat: "VIBE" },
  { word: "SCROLLING",     cat: "VIBE" },
  { word: "FEED",          cat: "PLATFORM" },
  { word: "REELS",         cat: "FORMAT" },
  { word: "TIKTOK",        cat: "PLATFORM" },
  { word: "YOUTUBE",       cat: "PLATFORM" }
];

const MAX_STRIKES = 6;

// 7 stages: index 0 = no strikes, index 6 = fully shadowbanned.
const STAGES = [
`
   ┌──────┐
   │      │
   │
   │
   │
   │
═══╧═══════`,
`
   ┌──────┐
   │      │
   │      O
   │
   │
   │
═══╧═══════`,
`
   ┌──────┐
   │      │
   │      O
   │      │
   │
   │
═══╧═══════`,
`
   ┌──────┐
   │      │
   │      O
   │     /│
   │
   │
═══╧═══════`,
`
   ┌──────┐
   │      │
   │      O
   │     /│\\
   │
   │
═══╧═══════`,
`
   ┌──────┐
   │      │
   │      O
   │     /│\\
   │     /
   │
═══╧═══════`,
`
   ┌──────┐
   │      │
   │     [X_X]
   │     /│\\
   │     / \\
   │   SHADOWBANNED
═══╧═══════`
];

// --- State ---
const state = {
  word: "",
  cat: "",
  revealed: new Set(),
  guessed: new Set(),
  strikes: 0,
  over: false,
  won: false,
  streak: 0,        // session win streak
  bestStreak: 0     // best streak this session
};

// --- DOM ---
const $ = (id) => document.getElementById(id);
const stageEl = $("stage");
const wordRowEl = $("wordRow");
const keyboardEl = $("keyboard");
const messageEl = $("message");
const strikeDotsEl = $("strikeDots");
const strikeCountEl = $("strikeCount");
const promptTagEl = $("promptTag");
const streakCountEl = $("streakCount");
const endLeaderboardEl = $("endLeaderboard");
const statusTextEl = $("statusText");
const endOverlay = $("endOverlay");
const endTitle = $("endTitle");
const endEmoji = $("endEmoji");
const endMessage = $("endMessage");
const endWord = $("endWord");
const howToOverlay = $("howToOverlay");

// --- Init ---
function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function newGame() {
  const pick = pickWord();
  state.word = pick.word;
  state.cat = pick.cat;
  state.revealed = new Set();
  state.guessed = new Set();
  state.strikes = 0;
  state.over = false;
  state.won = false;
  endOverlay.classList.add("hidden");
  promptTagEl.textContent = `CATEGORY: ${state.cat}`;
  messageEl.textContent = "Guess the term before your channel gets shadowbanned.";
  statusTextEl.textContent = "Ready";
  renderAll();
}

function renderAll() {
  renderStage();
  renderWord();
  renderKeyboard();
  renderStrikes();
  streakCountEl.textContent = String(state.streak);
}

function renderStage() {
  stageEl.textContent = STAGES[Math.min(state.strikes, STAGES.length - 1)];
}

function renderWord() {
  wordRowEl.innerHTML = "";
  for (const ch of state.word) {
    if (ch === " " || ch === "-") {
      const sp = document.createElement("span");
      sp.className = "letter-box space";
      wordRowEl.appendChild(sp);
      continue;
    }
    const box = document.createElement("span");
    box.className = "letter-box";
    if (state.revealed.has(ch)) {
      box.textContent = ch;
      box.classList.add("revealed");
    } else if (state.over && !state.won) {
      box.textContent = ch;
      box.classList.add("miss-reveal");
    } else {
      box.textContent = "";
    }
    wordRowEl.appendChild(box);
  }
}

function renderKeyboard() {
  keyboardEl.innerHTML = "";
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    const btn = document.createElement("button");
    btn.className = "key";
    btn.textContent = letter;
    btn.dataset.letter = letter;
    if (state.guessed.has(letter)) {
      btn.disabled = true;
      btn.classList.add(state.word.includes(letter) ? "hit" : "miss");
    }
    if (state.over) btn.disabled = true;
    btn.addEventListener("click", () => guess(letter));
    keyboardEl.appendChild(btn);
  }
}

function renderStrikes() {
  strikeDotsEl.innerHTML = "";
  for (let i = 0; i < MAX_STRIKES; i++) {
    const dot = document.createElement("span");
    dot.className = "strike-dot" + (i < state.strikes ? " lit" : "");
    strikeDotsEl.appendChild(dot);
  }
  strikeCountEl.textContent = `${state.strikes} / ${MAX_STRIKES}`;
}

function guess(letter) {
  if (state.over || state.guessed.has(letter)) return;
  state.guessed.add(letter);
  if (state.word.includes(letter)) {
    state.revealed.add(letter);
    statusTextEl.textContent = `Hit — ${letter}`;
    messageEl.textContent = randomFrom(HIT_LINES);
    checkWin();
  } else {
    state.strikes++;
    statusTextEl.textContent = `Miss — ${letter}`;
    messageEl.textContent = randomFrom(MISS_LINES).replace("{L}", letter);
    if (state.strikes >= MAX_STRIKES) lose();
  }
  renderAll();
}

function checkWin() {
  const allRevealed = [...state.word].every(
    (ch) => ch === " " || ch === "-" || state.revealed.has(ch)
  );
  if (allRevealed) win();
}

function win() {
  state.over = true;
  state.won = true;
  state.streak += 1;
  if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  showEnd(true);
}

function lose() {
  state.over = true;
  state.won = false;
  showEnd(false);
  state.streak = 0;
}

function showEnd(won) {
  endWord.textContent = state.word;
  if (won) {
    endTitle.textContent = "Algorithm bypassed";
    endEmoji.textContent = "📈";
    endMessage.textContent = randomFrom(WIN_LINES) + ` (Streak: ${state.streak})`;
    statusTextEl.textContent = "You went viral";
  } else {
    endTitle.textContent = "Shadowbanned";
    endEmoji.textContent = "🚫";
    endMessage.textContent = randomFrom(LOSE_LINES);
    statusTextEl.textContent = "Channel terminated";
  }
  renderEndLeaderboard(won);
  endOverlay.classList.remove("hidden");
}

function renderEndLeaderboard(justWon) {
  // Show submit form only when the run is over (lost), with the best streak earned.
  const finalScore = state.bestStreak;
  const pending = (!justWon && finalScore > 0)
    ? { score: finalScore, meta: {} }
    : null;
  mountLeaderboard(endLeaderboardEl, {
    game: "hangman",
    order: "desc",
    scoreLabel: "Streak",
    formatScore: (s) => `${s} word${s === 1 ? "" : "s"}`,
    limit: 10,
    pendingScore: pending
  });
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const HIT_LINES = [
  "Algo likes it. Keep going.",
  "That's a hit. Retention rising.",
  "Engagement spiking.",
  "Audience locked in."
];
const MISS_LINES = [
  "No '{L}' in the trending tab.",
  "'{L}' got buried by the algo.",
  "Whiff. '{L}' isn't here.",
  "Community Strike issued for '{L}'."
];
const WIN_LINES = [
  "You cracked the algorithm.",
  "Trending page secured.",
  "100k subs in a week, no notes.",
  "MrBeast is reviewing your tape."
];
const LOSE_LINES = [
  "Your channel is now invisible to non-subscribers.",
  "Reach down 96%. Welcome to the void.",
  "The algo is no longer your friend.",
  "Try posting on Threads. Just kidding."
];

// --- Event wiring ---
document.addEventListener("keydown", (e) => {
  if (!endOverlay.classList.contains("hidden") || !howToOverlay.classList.contains("hidden")) {
    if (e.key === "Escape") {
      endOverlay.classList.add("hidden");
      howToOverlay.classList.add("hidden");
    }
    if (e.key === "Enter" && !endOverlay.classList.contains("hidden")) {
      newGame();
    }
    return;
  }
  const k = e.key.toUpperCase();
  if (k.length === 1 && k >= "A" && k <= "Z") guess(k);
});

$("newGameBtn").addEventListener("click", newGame);
$("newGameMenu").addEventListener("click", newGame);
$("endPlayAgain").addEventListener("click", newGame);
$("endClose").addEventListener("click", () => endOverlay.classList.add("hidden"));

$("howToPlayMenu").addEventListener("click", () => howToOverlay.classList.remove("hidden"));
$("howToClose").addEventListener("click", () => howToOverlay.classList.add("hidden"));
$("howToOk").addEventListener("click", () => howToOverlay.classList.add("hidden"));

newGame();
