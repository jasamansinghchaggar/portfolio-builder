import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"

import { SITE_URL, resolveSafeNextPath } from "@/lib/config"
import { createClient } from "@/lib/supabase/server"

const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
])

function failure(request: NextRequest, reason: string) {
  const url = new URL("/login", SITE_URL)
  url.searchParams.set("auth_error", reason)
  url.searchParams.set("next", request.nextUrl.searchParams.get("next") ?? "")
  return NextResponse.redirect(url)
}

/**
 * Handles both auth link styles:
 * - `?code=` from the default Supabase email templates / OAuth (PKCE).
 * - `?token_hash=&type=` from custom email templates using `{{ .TokenHash }}`.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const code = params.get("code")
  const tokenHash = params.get("token_hash")
  const type = params.get("type")
  const next =
    resolveSafeNextPath(params.get("next")) ??
    resolveSafeNextPath(params.get("redirect_to")) ??
    "/dashboard"

  if (params.get("error") || params.get("error_code")) {
    return failure(request, "expired")
  }

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return failure(request, "expired")
    return NextResponse.redirect(new URL(next, SITE_URL))
  }

  if (tokenHash && type && OTP_TYPES.has(type as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    })
    if (error) return failure(request, "expired")
    return NextResponse.redirect(new URL(next, SITE_URL))
  }

  return failure(request, "missing")
}
