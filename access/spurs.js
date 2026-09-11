(() => {
  const next = new URLSearchParams(location.search).get('next') || '/Spurs/ASFC%20Spurs%20Season%20Story%20Deck%20v5%20-%20Presentation%20Mode.html';
  document.getElementById('login').addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.target.querySelector('button');
    const message = document.getElementById('message');
    button.disabled = true; message.textContent = 'Opening…';
    try {
      const response = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scope: 'spurs', password: document.getElementById('password').value, next }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to open this deck.');
      location.assign(result.next);
    } catch (error) { message.textContent = error.message || 'Connection failed. Please try again.'; }
    finally { button.disabled = false; }
  });
})();
