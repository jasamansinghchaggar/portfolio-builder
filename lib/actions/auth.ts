"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import {
  emailRetryAt,
  emailSendErrorMessage,
  friendlyAuthError,
  isEmailRateLimitError,
} from "@/lib/auth-errors"
import { resolveSafeNextPath, SITE_URL } from "@/lib/config"
import { TEMPLATE_IDS, type TemplateId } from "@/lib/portfolio/constants"
import { createClient, createServiceClient } from "@/lib/supabase/server"

import type { AuthFormState } from "./state"

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function validateEmail(value: string) {
  if (!value) return "Enter your email address."
  if (value.length > 254 || !z.email().safeParse(value).success) {
    return "Enter a valid email address."
  }
  return null
}

function validatePassword(value: string) {
  if (!value) return "Enter a password."
  if (value.length < 8) return "Use at least 8 characters."
  if (value.length > 72) return "Use 72 characters or fewer."
  return null
}

export async function loginAction(
  _previous: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = text(formData, "email").toLowerCase()
  const password = String(formData.get("password") ?? "")

  const emailError = validateEmail(email)
  if (emailError) return { status: "error", message: emailError, email }
  if (!password) {
    return { status: "error", message: "Enter your password.", email }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { status: "error", message: friendlyAuthError(error.message), email }
  }

  const next = resolveSafeNextPath(text(formData, "next"))
  const { data: claimsData } = await supabase.auth.getClaims()
  const signedInUserId =
    typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null
  let isAdmin = false
  let mustChangePassword = false
  if (signedInUserId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, must_change_password")
      .eq("id", signedInUserId)
      .maybeSingle()
    isAdmin = profile?.role === "admin"
    mustChangePassword = profile?.must_change_password === true
  }
  revalidatePath("/", "layout")
  if (mustChangePassword) redirect("/reset-password")
  redirect(next ?? (isAdmin ? "/admin" : "/dashboard"))
}

export async function registerAction(
  _previous: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const fullName = text(formData, "fullName")
  const email = text(formData, "email").toLowerCase()
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirmPassword") ?? "")
  const templateId = text(formData, "template")

  if (fullName.length < 2) {
    return { status: "error", message: "Enter your full name.", email }
  }
  if (fullName.length > 80) {
    return {
      status: "error",
      message: "Keep your name under 80 characters.",
      email,
    }
  }
  const emailError = validateEmail(email)
  if (emailError) return { status: "error", message: emailError, email }
  const passwordError = validatePassword(password)
  if (passwordError) return { status: "error", message: passwordError, email }
  if (password !== confirm) {
    return { status: "error", message: "Passwords don't match.", email }
  }

  const supabase = await createClient()
  const params = new URLSearchParams({ next: "/onboarding" })
  if (TEMPLATE_IDS.includes(templateId as TemplateId)) {
    params.set("template", templateId)
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${SITE_URL}/auth/callback?${params.toString()}`,
    },
  })

  if (error) {
    if (isEmailRateLimitError(error)) {
      return {
        status: "error",
        email,
        message:
          "We couldn't send the verification email because email delivery is temporarily limited. Please try again in a few minutes.",
        retryAt: emailRetryAt(),
      }
    }
    return { status: "error", message: friendlyAuthError(error.message), email }
  }

  // Email confirmation disabled: a session is returned immediately.
  if (data.session) {
    revalidatePath("/", "layout")
    redirect(
      TEMPLATE_IDS.includes(templateId as TemplateId)
        ? `/onboarding?template=${templateId}`
        : "/onboarding"
    )
  }

  return {
    status: "success",
    email,
    message:
      "Check your inbox for a verification link. Open it to finish creating your account.",
  }
}

export async function forgotPasswordAction(
  _previous: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = text(formData, "email").toLowerCase()
  const emailError = validateEmail(email)
  if (emailError) return { status: "error", message: emailError, email }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  })

  if (isEmailRateLimitError(error)) {
    return {
      status: "error",
      email,
      message: emailSendErrorMessage(error),
      retryAt: emailRetryAt(),
    }
  }

  if (error) {
    // Account existence is not revealed by Supabase here, so any error is an
    // infrastructure failure (SMTP, provider outage) and should be surfaced.
    console.error("[auth] resetPasswordForEmail failed", {
      code: error.code,
      status: error.status,
    })
    return {
      status: "error",
      email,
      message:
        "We couldn't send the reset email just now. Please try again in a few minutes.",
      retryAt: emailRetryAt(),
    }
  }

  // Always report success so the form cannot be used to enumerate accounts.
  return {
    status: "success",
    email,
    message:
      "If an account exists for that address, a reset link is on its way. It expires after one hour.",
  }
}

export async function updatePasswordAction(
  _previous: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirmPassword") ?? "")

  const passwordError = validatePassword(password)
  if (passwordError) return { status: "error", message: passwordError }
  if (password !== confirm) {
    return { status: "error", message: "Passwords don't match." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) {
    return {
      status: "error",
      message: "Your reset link has expired. Request a new one.",
    }
  }

  const userId = data.claims.sub

  // Fetch role + clear the forced-change flag BEFORE updating the password,
  // because updateUser can invalidate the session cookies.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  const { error: clearError } = await supabase
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", userId)

  if (clearError) {
    // Fall back to the service-role client if the user-scoped update fails.
    try {
      const service = createServiceClient()
      await service
        .from("profiles")
        .update({ must_change_password: false } as never)
        .eq("id", userId)
    } catch {
      // ignore; best effort
    }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) {
    return { status: "error", message: friendlyAuthError(updateError.message) }
  }

  revalidatePath("/", "layout")
  redirect(
    profile?.role === "admin"
      ? "/admin?password=updated"
      : "/dashboard?password=updated"
  )
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
