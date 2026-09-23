import { next } from '@vercel/edge';
import { accessDecision } from './server/access.js';
export const config = { runtime: 'nodejs', matcher: '/:path*' };
export default function middleware(request: Request) {
  const url = new URL(request.url);
  const decision = accessDecision(url.pathname, request.headers.get('cookie') || '');
  // Deck media is heavy and rarely changes: let the browser keep it for a day, then reuse while revalidating.
  const cache = url.pathname.startsWith('/deck/assets/') ? 'private, max-age=86400, stale-while-revalidate=604800' : 'private, no-store';
  const headers = { 'Cache-Control': cache, 'Vary': 'Cookie', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
  if (decision === 'deny') return new Response('Not found', { status: 404, headers });
  if (decision === 'login' || decision === 'spurs-login') {
    const login = new URL(decision === 'spurs-login' ? '/access/spurs.html' : '/access/', url);
    login.searchParams.set('next', url.pathname + url.search);
    return Response.redirect(login, 307);
  }
  return next({ headers });
}
