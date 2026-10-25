import type { NextFetchEvent, NextRequest } from 'next/server';
import { handleMobileApiRequest, isSharedBackendApiPath } from '@/lib/mobile-bridge';

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  // NextAuth's own routes must run untouched: if a web session already exists, the bridge's
  // stranded-sign-in redirect would hijack /api/auth/csrf and the Google callback, which
  // breaks mobile Google sign-in. Our redirect callback already returns to the mobile callback.
  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) return;
  if (isSharedBackendApiPath(pathname)) {
    return handleMobileApiRequest(req, event);
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
