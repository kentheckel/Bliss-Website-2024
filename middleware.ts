import { next } from '@vercel/edge';
import { accessDecision } from './server/access.js';
export const config = { runtime: 'nodejs', matcher: '/:path*' };
export default function middleware(request: Request) {
  const url = new URL(request.url);
  const decision = accessDecision(url.pathname, request.headers.get('cookie') || '');
  const headers = { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
  if (decision === 'deny') return new Response('Not found', { status: 404, headers });
  if (decision === 'login' || decision === 'spurs-login') {
    const login = new URL(decision === 'spurs-login' ? '/access/spurs.html' : '/access/', url);
    login.searchParams.set('next', url.pathname + url.search);
    return Response.redirect(login, 307);
  }
  return next({ headers });
}
