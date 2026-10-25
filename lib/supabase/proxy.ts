import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "./database.types"

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/editor",
  "/settings",
  "/admin",
  "/onboarding",
  "/preview",
]

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

function copySessionCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie))
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = from.headers.get(header)
    if (value) to.headers.set(header, value)
  }
  return to
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const hasAuthCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-"))

  let supabaseResponse = NextResponse.next({ request })

  if (!hasAuthCookie) {
    if (isProtectedPath(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.search = ""
      url.searchParams.set("next", `${pathname}${request.nextUrl.search}`)
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
        Object.entries(headers ?? {}).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value)
        )
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = Boolean(data?.claims?.sub)

  if (!isAuthenticated && isProtectedPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.search = ""
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`)
    return copySessionCookies(supabaseResponse, NextResponse.redirect(loginUrl))
  }

  return supabaseResponse
}

export { copySessionCookies }
