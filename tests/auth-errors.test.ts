import { describe, expect, it } from "vitest"

import {
  emailRetryAt,
  emailSendErrorMessage,
  friendlyAuthError,
  isEmailRateLimitError,
  isPerUserCooldown,
} from "@/lib/auth-errors"

describe("email rate limit detection", () => {
  it("detects the project-wide email quota", () => {
    expect(
      isEmailRateLimitError({
        code: "over_email_send_rate_limit",
        status: 429,
        message: "email rate limit exceeded",
      })
    ).toBe(true)
  })

  it("treats any 429 response as a rate limit", () => {
    expect(isEmailRateLimitError({ status: 429, message: "too many" })).toBe(
      true
    )
  })

  it("ignores missing and unrelated errors", () => {
    expect(isEmailRateLimitError(null)).toBe(false)
    expect(isEmailRateLimitError(undefined)).toBe(false)
    expect(
      isEmailRateLimitError({ code: "invalid_credentials", status: 400 })
    ).toBe(false)
  })
})

describe("per-user cooldown detection", () => {
  it("recognises the 60 second window message", () => {
    expect(
      isPerUserCooldown({
        status: 429,
        message:
          "For security purposes, you can only request this after 42 seconds.",
      })
    ).toBe(true)
  })

  it("does not treat the project quota as a cooldown", () => {
    expect(
      isPerUserCooldown({
        code: "over_email_send_rate_limit",
        status: 429,
        message: "email rate limit exceeded",
      })
    ).toBe(false)
  })
})

describe("email error messages", () => {
  it("tells the user to wait for the cooldown", () => {
    expect(
      emailSendErrorMessage({
        status: 429,
        message:
          "For security purposes, you can only request this after 42 seconds.",
      })
    ).toBe("Please wait a minute before requesting another email.")
  })

  it("reports a delivery outage otherwise", () => {
    expect(emailSendErrorMessage({ status: 500 })).toBe(
      "We can't send email right now. Please try again in a few minutes."
    )
  })
})

describe("friendly auth errors", () => {
  it("maps common Supabase messages", () => {
    expect(friendlyAuthError("Invalid login credentials")).toBe(
      "That email and password don't match an account."
    )
    expect(friendlyAuthError("Email not confirmed")).toContain(
      "Confirm your email"
    )
    expect(friendlyAuthError("User already registered")).toContain(
      "already exists"
    )
    expect(friendlyAuthError(undefined)).toBe(
      "Something went wrong. Please try again."
    )
  })
})

describe("retry timestamp", () => {
  it("returns a future epoch in seconds", () => {
    const before = Math.ceil(Date.now() / 1000)
    const retryAt = emailRetryAt(60)
    expect(retryAt).toBeGreaterThanOrEqual(before + 60)
    expect(retryAt).toBeLessThanOrEqual(before + 61)
  })
})
