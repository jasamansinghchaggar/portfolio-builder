import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const reserved = new Set(['www', 'app', 'admin', 'api', 'auth', 'dashboard']);

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? '';
  const base = process.env.NEXT_PUBLIC_SITE_DOMAIN;

  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet)
            response.cookies.set(name, value, options);
          for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
        },
      },
    });

    await supabase.auth.getClaims();
  }

  if (base && host.endsWith(`.${base}`)) {
    const subdomain = host.slice(0, -(base.length + 1));
    if (subdomain && !reserved.has(subdomain) && !request.nextUrl.pathname.startsWith('/p/')) {
      const url = request.nextUrl.clone();
      url.pathname = `/p/${subdomain}`;
      const rewriteResponse = NextResponse.rewrite(url, { request });
      for (const cookie of response.cookies.getAll()) rewriteResponse.cookies.set(cookie);
      for (const header of ['cache-control', 'expires', 'pragma']) {
        const value = response.headers.get(header);
        if (value) rewriteResponse.headers.set(header, value);
      }
      return rewriteResponse;
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
