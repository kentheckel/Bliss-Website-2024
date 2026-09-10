(() => {
  const params = new URLSearchParams(location.search);
  const next = params.get('next') || '/';
  if (params.has('next')) document.getElementById('signin').open = true;
  document.getElementById('login').addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.target.querySelector('button');
    const message = document.getElementById('message');
    button.disabled = true; message.textContent = 'Signing in…';
    try {
      const response = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: document.getElementById('password').value, next }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
      location.assign(result.next);
    } catch (error) { message.textContent = error.message || 'Connection failed. Please try again.'; }
    finally { button.disabled = false; }
  });
})();
