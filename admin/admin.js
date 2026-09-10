import { decks } from './decks.js';
const grid = document.getElementById('decks');
function render() {
  const query = document.getElementById('search').value.toLowerCase().trim();
  const matches = decks.filter(deck => `${deck.title} ${deck.description || ''} ${deck.type}`.toLowerCase().includes(query));
  grid.replaceChildren(...matches.map(deck => {
    const card = document.createElement('a'); card.className = 'card'; card.href = deck.href; card.target = '_blank'; card.rel = 'noopener';
    const bar = document.createElement('span'); bar.className = 'bar'; bar.textContent = deck.type + ' ↗';
    const title = document.createElement('h2'); title.textContent = deck.title;
    const description = document.createElement('p'); description.textContent = deck.description || 'Original uploaded file';
    const open = document.createElement('span'); open.className = 'open'; open.textContent = deck.type === 'PowerPoint' ? 'DOWNLOAD FILE ↓' : 'OPEN ' + deck.type.toUpperCase() + ' ↗';
    card.append(bar,title,description,open); return card;
  }));
  document.getElementById('count').textContent = `${matches.length} of ${decks.length} files`;
  document.getElementById('empty').hidden = matches.length > 0;
}
document.getElementById('search').addEventListener('input',render); render();
document.getElementById('logout').addEventListener('click', async event => {
  event.target.disabled = true;
  try {
    const response = await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});
    if(!response.ok) throw new Error('Sign-out failed. Please try again.');
    location.replace('/access/');
  } catch(error) { document.getElementById('status').textContent = error.message; event.target.disabled = false; }
});
