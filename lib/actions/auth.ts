"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { resolveSafeNextPath, SITE_URL } from "@/lib/config"
import { TEMPLATE_IDS, type TemplateId } from "@/lib/portfolio/constants"
import { createClient } from "@/lib/supabase/server"

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

function friendlyAuthError(message: string | undefined) {
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
  return "Something went wrong. Please try again."
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
  revalidatePath("/", "layout")
  redirect(next ?? "/dashboard")
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
    return { status: "error", message: "Keep your name under 80 characters.", email }
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
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  })

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

  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) {
    return { status: "error", message: friendlyAuthError(updateError.message) }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard?password=updated")
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
