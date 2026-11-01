type AuthErrorLike = {
  message?: string
  code?: string
  status?: number
}

const EMAIL_RATE_LIMIT_CODE = "over_email_send_rate_limit"

/**
 * True when Supabase Auth refused to send an email because a rate limit was
 * hit. This covers both the project-wide sending quota and the per-user
 * cooldown (both come back as HTTP 429).
 */
export function isEmailRateLimitError(
  error: AuthErrorLike | null | undefined
): boolean {
  if (!error) return false
  if (error.code === EMAIL_RATE_LIMIT_CODE) return true
  return error.status === 429
}

/**
 * Distinguishes the 60-second per-user cooldown from the project-wide email
 * quota. The cooldown is expected and the user only needs to wait briefly.
 */
export function isPerUserCooldown(
  error: AuthErrorLike | null | undefined
): boolean {
  if (!error) return false
  const message = error.message?.toLowerCase() ?? ""
  return (
    message.includes("security purposes") ||
    message.includes("once every") ||
    message.includes("only request this after") ||
    /\bafter \d+ seconds?\b/.test(message)
  )
}

export function emailSendErrorMessage(
  error: AuthErrorLike | null | undefined
): string {
  if (isPerUserCooldown(error)) {
    return "Please wait a minute before requesting another email."
  }
  return "We can't send email right now. Please try again in a few minutes."
}

/**
 * Epoch seconds after which the client may retry an email request. Kept in
 * seconds so the client can compare against `Math.floor(Date.now() / 1000)`.
 */
export function emailRetryAt(seconds = 60): number {
  return Math.ceil(Date.now() / 1000) + seconds
}

export function friendlyAuthError(message: string | undefined) {
  const value = message?.toLowerCase() ?? ""
  if (value.includes("invalid login credentials")) {
    return "That email and password don't match an account."
  }
  if (value.includes("email not confirmed")) {
    return "Confirm your email address before signing in. Check your inbox for the verification link."
  }
  if (value.includes("user already registered")) {
    return "An account with that email already exists. Try signing in instead."
  }
  if (value.includes("rate limit") || value.includes("too many")) {
    return "Too many attempts. Wait a minute and try again."
  }
  if (value.includes("password should be")) {
    return "Choose a stronger password with at least 8 characters."
  }
  if (value.includes("same password")) {
    return "Choose a password you haven't used before."
  }
  if (
    value.includes("error sending") ||
    value.includes("failed to send") ||
    value.includes("smtp")
  ) {
    return "We couldn't send the email just now. Please try again in a few minutes."
  }
  return "Something went wrong. Please try again."
}
