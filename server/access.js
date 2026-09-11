import { randomBytes, scryptSync, createHmac, timingSafeEqual } from 'node:crypto';
export const COOKIE = 'asfc_access';
export const TTL = 7 * 86400;
const scopes = {
  admin: { cookie: COOKIE, key: 'ASFC_ADMIN_PASSWORD_HASH' },
  spurs: { cookie: 'asfc_spurs_access', key: 'ASFC_SPURS_PASSWORD_HASH' }
};
function passwordHash(scope) { return process.env[scopes[scope]?.key] || ''; }

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function configured(scope = 'admin') {
  return /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash(scope)) && (process.env.ASFC_SESSION_SECRET || '').length >= 32;
}
export function checkPassword(password, scope = 'admin') {
  if (!configured(scope) || typeof password !== 'string' || password.length > 256) return false;
  const [salt, expected] = passwordHash(scope).split(':');
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(expected, 'hex'));
}
function sign(payload, scope) {
  return createHmac('sha256', process.env.ASFC_SESSION_SECRET).update(`${payload}:${passwordHash(scope)}`).digest('base64url');
}
export function createSession(now = Date.now(), scope = 'admin') {
  if (!configured(scope)) throw new Error('Access is not configured');
  const payload = `${Math.floor(now / 1000) + TTL}.${randomBytes(18).toString('base64url')}`;
  return `${payload}.${sign(payload, scope)}`;
}
export function hasSession(cookie = '', now = Date.now(), scope = 'admin') {
  if (!configured(scope)) return false;
  const name = scopes[scope].cookie;
  const value = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='))?.slice(name.length + 1) || '';
  if (!/^\d{10}\.[A-Za-z0-9_-]{24}\.[A-Za-z0-9_-]{43}$/.test(value)) return false;
  const [expires, nonce, signature] = value.split('.');
  if (+expires <= Math.floor(now / 1000) || +expires > Math.floor(now / 1000) + TTL) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(sign(`${expires}.${nonce}`, scope)));
}
export function sessionCookie(value, secure = true, scope = 'admin') {
  return `${scopes[scope].cookie}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${value ? TTL : 0}${secure ? '; Secure' : ''}`;
}
export function safeNext(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return '/';
  try { const url = new URL(value, 'https://asfc.invalid'); return url.origin === 'https://asfc.invalid' && !url.pathname.startsWith('/access') ? url.pathname + url.search + url.hash : '/'; } catch { return '/'; }
}
const privateRoots = new Set(['admin', 'lewishamilton', 'lukadoncic', 'lukaslovenia', 'parisvsslovenia', 'aspensnowmass', 'clubamerica', 'pitch']);
export function accessDecision(pathname, cookie = '') {
  let path;
  try { path = decodeURIComponent(pathname).toLowerCase(); } catch { return 'deny'; }
  const parts = path.split('/').filter(Boolean);
  if (parts.some(p => p.startsWith('.') || p.includes('\\')) || ['server','scripts','tests','supabase','node_modules'].includes(parts[0]) || (/\.(?:sql|md|ts)$/.test(path) || /^\/(?:package(?:-lock)?|vercel)\.json$/.test(path))) return 'deny';
  if (['/access', '/access/', '/access/index.html', '/access/access.css', '/access/access.js', '/api/session', '/favicon.ico', '/access/spurs.html', '/access/spurs.js', '/js/contact-link.js'].includes(path)) return 'allow';
  if (parts[0] === 'api') return 'deny';
  if (hasSession(cookie)) return 'allow';
  if (process.env.ASFC_MAINTENANCE !== 'false') return 'login';
  if (parts[0] === 'spurs' && !hasSession(cookie, Date.now(), 'spurs')) return 'spurs-login';
  return privateRoots.has(parts[0]) || (parts[0] === 'documents' && /\.(?:pdf|pptx|docx)$/.test(path)) ? 'login' : 'allow';
}
