import { checkPassword, configured, createSession, hasSession, safeNext, sessionCookie } from '../server/access.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method === 'GET') return res.status(200).json({ authenticated: hasSession(req.headers.cookie), maintenance: process.env.ASFC_MAINTENANCE !== 'false' });
  if (req.method !== 'POST') { res.setHeader('Allow','GET, POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  const secure = req.headers['x-forwarded-proto'] !== 'http';
  const origin = `${secure ? 'https' : 'http'}://${req.headers.host}`;
  if (req.headers.origin !== origin) return res.status(403).json({ error: 'Please sign in from this website.' });
  if (!req.headers['content-type']?.startsWith('application/json')) return res.status(415).json({ error: 'JSON required' });
  if (Number(req.headers['content-length'] || 0) > 2048) return res.status(413).json({ error: 'Request too large' });
  const body = req.body;
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Invalid request' });
  if (body.action === 'logout') { res.setHeader('Set-Cookie',sessionCookie('',secure)); return res.status(200).json({ next: '/access/' }); }
  if (!configured()) return res.status(503).json({ error: 'Preview access is being set up. Please try again shortly.' });
  if (!checkPassword(body.password)) { await new Promise(resolve => setTimeout(resolve, 800)); return res.status(401).json({ error: 'That password did not match. Try again.' }); }
  res.setHeader('Set-Cookie', sessionCookie(createSession(),secure));
  return res.status(200).json({ next: safeNext(body.next) });
}
