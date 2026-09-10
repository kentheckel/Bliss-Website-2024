import { randomBytes, scryptSync, createHmac, timingSafeEqual } from 'node:crypto';
export const COOKIE = 'asfc_access';
export const TTL = 7 * 86400;
export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function configured() {
  return /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(process.env.ASFC_ADMIN_PASSWORD_HASH || '') && (process.env.ASFC_SESSION_SECRET || '').length >= 32;
}
export function checkPassword(password) {
  if (!configured() || typeof password !== 'string' || password.length > 256) return false;
  const [salt, expected] = process.env.ASFC_ADMIN_PASSWORD_HASH.split(':');
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(expected, 'hex'));
}
function sign(payload) {
  return createHmac('sha256', process.env.ASFC_SESSION_SECRET).update(`${payload}:${process.env.ASFC_ADMIN_PASSWORD_HASH}`).digest('base64url');
}
export function createSession(now = Date.now()) {
  if (!configured()) throw new Error('Access is not configured');
  const payload = `${Math.floor(now / 1000) + TTL}.${randomBytes(18).toString('base64url')}`;
  return `${payload}.${sign(payload)}`;
}
export function hasSession(cookie = '', now = Date.now()) {
  if (!configured()) return false;
  const value = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1) || '';
  if (!/^\d{10}\.[A-Za-z0-9_-]{24}\.[A-Za-z0-9_-]{43}$/.test(value)) return false;
  const [expires, nonce, signature] = value.split('.');
  if (+expires <= Math.floor(now / 1000) || +expires > Math.floor(now / 1000) + TTL) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(sign(`${expires}.${nonce}`)));
}
export function sessionCookie(value, secure = true) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${value ? TTL : 0}${secure ? '; Secure' : ''}`;
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
  if (parts.some(p => p.startsWith('.') || p.includes('\\')) || ['server','scripts','tests','supabase','node_modules'].includes(parts[0]) || /\.(?:sql|md|json|ts)$/.test(path) && !path.startsWith('/data/')) return 'deny';
  if (['/access', '/access/', '/access/index.html', '/access/access.css', '/access/access.js', '/api/session', '/favicon.ico'].includes(path)) return 'allow';
  if (parts[0] === 'api') return 'deny';
  if (hasSession(cookie)) return 'allow';
  return process.env.ASFC_MAINTENANCE !== 'false' || (privateRoots.has(parts[0]) || (parts[0] === 'documents' && /\.(?:pdf|pptx|docx)$/.test(path))) ? 'login' : 'allow';
}
