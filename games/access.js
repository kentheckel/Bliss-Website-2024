'use strict';
// A discoverable arcade Easter egg. Private site/deck access is handled separately on the server.
(() => {
  const key = 'asfc-arcade-unlocked-v1';
  const password = 'touchgrass';
  const paths = new Set(['hangman', 'minesweeper', 'pinball', 'viral-surfer'].flatMap(game => [`/games/${game}/`, `/games/${game}/index.html`]));
  window.ASFCArcade = {
    note: `ARCADE PASSWORD: ${password}\n\nFor the Games folder.\nApparently this was worth keeping.\n\nOpen Games and enter the password to play.`,
    isUnlocked() { try { return sessionStorage.getItem(key) === '1'; } catch { return false; } },
    unlock(value) {
      if (value.trim().toLowerCase() !== password) return 'That’s not it. Try the password in Trash.';
      try { sessionStorage.setItem(key, '1'); return null; } catch { return 'Allow site storage to unlock games in this tab.'; }
    },
    lock() { try { sessionStorage.removeItem(key); } catch {} },
    destination() { const path = new URLSearchParams(location.search).get('game'); return paths.has(path) ? path : null; },
    gateHTML() {
      return `<div class="arcade-lock"><div class="arcade-lock-icon" aria-hidden="true">▣</div><p class="arcade-eyebrow">C:\\GAMES / LOCKED</p><h2>The arcade is locked.</h2><p>Someone left the password in the Trash.</p><form data-arcade-unlock><label>Arcade password<input name="arcade-password" type="password" autocomplete="off" required maxlength="64"></label><button type="submit">Unlock games →</button><p class="arcade-error" role="status" aria-live="polite"></p></form><button type="button" class="arcade-hint" data-arcade-trash>Look in Trash ↗</button></div>`;
    }
  };
})();
