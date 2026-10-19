import { NextResponse, type NextRequest } from 'next/server';

const reserved = new Set(['www', 'app', 'admin', 'api', 'auth', 'dashboard']);

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? '';
  const base = process.env.NEXT_PUBLIC_SITE_DOMAIN;
  if (base && host.endsWith(`.${base}`)) {
    const subdomain = host.slice(0, -(base.length + 1));
    if (subdomain && !reserved.has(subdomain) && !request.nextUrl.pathname.startsWith('/p/')) {
      const url = request.nextUrl.clone();
      url.pathname = `/p/${subdomain}`;
      return NextResponse.rewrite(url);
    }
  }
  if (
    request.nextUrl.pathname.startsWith('/dashboard') &&
    !request.cookies.get('sb-access-token') &&
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    return NextResponse.redirect(
      new URL(`/auth?next=${encodeURIComponent(request.nextUrl.pathname)}`, request.url),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
