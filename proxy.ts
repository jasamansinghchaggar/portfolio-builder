import { NextResponse, type NextRequest } from "next/server"

import { isSubdomainHost, SITE_URL } from "@/lib/config"
import { copySessionCookies, updateSession } from "@/lib/supabase/proxy"

const APP_ROUTE_PREFIXES = [
  "/dashboard",
  "/editor",
  "/settings",
  "/admin",
  "/admin-preview",
  "/onboarding",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/preview",
]

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? ""
  const subdomain = isSubdomainHost(host)
  const pathname = request.nextUrl.pathname

  if (subdomain) {
    if (
      APP_ROUTE_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
      )
    ) {
      const url = new URL(`${pathname}${request.nextUrl.search}`, SITE_URL)
      return NextResponse.redirect(url)
    }

    if (pathname === "/") {
      const url = request.nextUrl.clone()
      url.pathname = `/p/${subdomain}`
      const response = await updateSession(request)
      return copySessionCookies(response, NextResponse.rewrite(url))
    }
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
}
