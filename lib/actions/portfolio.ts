"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import {
  normalizeUsername,
  publicPortfolioUrl,
  usernameError,
} from "@/lib/config"
import {
  createDefaultContent,
  parsePortfolioContent,
} from "@/lib/portfolio/defaults"
import { buildPublishSnapshot } from "@/lib/portfolio/publish"
import { formatZodIssues } from "@/lib/portfolio/schemas"
import { TEMPLATE_IDS, type TemplateId } from "@/lib/portfolio/constants"
import { DEFAULT_TEMPLATE_ID } from "@/lib/portfolio/templates"
import { getAuthUserId } from "@/lib/auth"

import type { ActionState, PublishResult, SaveResult } from "./state"

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function errorMessage(message: string | undefined) {
  switch (message) {
    case "revision_conflict":
      return "This portfolio was saved somewhere else. Reload before saving again."
    case "portfolio_not_found":
      return "Portfolio not found."
    case "invalid_media":
      return "One of the selected files no longer belongs to this portfolio."
    case "username_unavailable":
      return "That username is already taken."
    case "username_taken":
      return "That username is already taken. Try another."
    case "invalid_username":
      return "That username isn't allowed. Use 3–30 lowercase letters, numbers, or single hyphens."
    case "not_authenticated":
      return "Your session has expired. Sign in again."
    default:
      return "Something went wrong. Please try again."
  }
}

async function loadOwnedPortfolio(
  portfolioId: string,
  userId: string
): Promise<{ username: string; revision: number } | null> {
  const { supabase } = await getAuthUserId()
  const { data } = await supabase
    .from("portfolios")
    .select("username, revision")
    .eq("id", portfolioId)
    .eq("user_id", userId)
    .maybeSingle()
  return data
}

export async function checkUsernameAction(
  username: string
): Promise<{ available: boolean; message: string | null }> {
  const value = normalizeUsername(username)
  const validation = usernameError(value)
  if (validation) return { available: false, message: validation }

  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    return { available: false, message: "Your session has expired." }
  }

  const { data, error } = await supabase.rpc("username_available", {
    p_username: value,
  })
  if (error) {
    return {
      available: false,
      message: "Couldn't check that username. Try again.",
    }
  }

  return {
    available: Boolean(data),
    message: data ? null : "That username is already taken. Try another.",
  }
}

export async function createPortfolioAction(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const fullName = text(formData, "fullName")
  const username = normalizeUsername(text(formData, "username"))
  const headline = text(formData, "headline")
  const requestedTemplate = text(formData, "templateId")
  const templateId = TEMPLATE_IDS.includes(requestedTemplate as TemplateId)
    ? (requestedTemplate as TemplateId)
    : DEFAULT_TEMPLATE_ID

  if (fullName.length < 2) {
    return { status: "error", message: "Enter your full name." }
  }
  if (headline.length > 160) {
    return { status: "error", message: "Keep your headline under 160 characters." }
  }
  const validation = usernameError(username)
  if (validation) return { status: "error", message: validation }

  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    return {
      status: "error",
      message: "Your session has expired. Sign in again to continue.",
    }
  }

  const { data: existing } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()
  if (existing) redirect("/dashboard")

  const { data: available, error: availabilityError } = await supabase.rpc(
    "username_available",
    { p_username: username }
  )
  if (availabilityError) {
    return {
      status: "error",
      message: "Couldn't check that username. Please try again.",
    }
  }
  if (!available) {
    return {
      status: "error",
      message: "That username is already taken. Try another.",
    }
  }

  const { data: claims } = await supabase.auth.getClaims()
  const email =
    typeof claims?.claims?.email === "string" ? claims.claims.email : ""

  const content = createDefaultContent({
    fullName,
    headline,
    email,
    templateId,
  })

  const { error } = await supabase.rpc("create_portfolio", {
    p_username: username,
    p_content: content,
  })

  if (error) {
    return { status: "error", message: errorMessage(error.message) }
  }

  await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", userId)

  revalidatePath("/dashboard")
  redirect("/editor?welcome=1")
}

export async function saveDraftAction(input: {
  portfolioId: string
  revision: number
  content: unknown
}): Promise<SaveResult> {
  if (
    !z.uuid().safeParse(input.portfolioId).success ||
    !Number.isInteger(input.revision) ||
    input.revision < 0
  ) {
    return { ok: false, error: "Invalid save request." }
  }

  const parsed = parsePortfolioContent(input.content)
  if (!parsed.success) {
    return {
      ok: false,
      error: `Some content is invalid and wasn't saved. ${formatZodIssues(parsed.error)[0]}`,
    }
  }

  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    return { ok: false, error: "Your session has expired. Sign in again." }
  }

  const { data, error } = await supabase.rpc("save_portfolio_draft", {
    p_portfolio_id: input.portfolioId,
    p_content: parsed.data,
    p_revision: input.revision,
  })

  if (error || !data?.length) {
    return {
      ok: false,
      error: errorMessage(error?.message),
      conflict: error?.message === "revision_conflict",
    }
  }

  revalidatePath("/dashboard")
  return {
    ok: true,
    revision: data[0].revision,
    savedAt: data[0].saved_at,
  }
}

/**
 * Resolves a revision conflict by adopting the latest revision while keeping
 * the editor's current content. A second writer between read and write is
 * still rejected, so this can't silently clobber a concurrent save.
 */
export async function overwriteDraftAction(input: {
  portfolioId: string
  content: unknown
}): Promise<SaveResult> {
  if (!z.uuid().safeParse(input.portfolioId).success) {
    return { ok: false, error: "Invalid save request." }
  }

  const parsed = parsePortfolioContent(input.content)
  if (!parsed.success) {
    return {
      ok: false,
      error: `Some content is invalid and wasn't saved. ${formatZodIssues(parsed.error)[0]}`,
    }
  }

  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    return { ok: false, error: "Your session has expired. Sign in again." }
  }

  const owned = await loadOwnedPortfolio(input.portfolioId, userId)
  if (!owned) return { ok: false, error: "Portfolio not found." }

  const { data, error } = await supabase.rpc("save_portfolio_draft", {
    p_portfolio_id: input.portfolioId,
    p_content: parsed.data,
    p_revision: owned.revision,
  })

  if (error || !data?.length) {
    return {
      ok: false,
      conflict: error?.message === "revision_conflict",
      error:
        error?.message === "revision_conflict"
          ? "It changed again while you were saving. Reload the latest version."
          : errorMessage(error?.message),
    }
  }

  revalidatePath("/dashboard")
  return {
    ok: true,
    revision: data[0].revision,
    savedAt: data[0].saved_at,
  }
}

export async function loadDraftAction(portfolioId: string): Promise<
  | { ok: true; revision: number; savedAt: string; content: unknown }
  | { ok: false; error: string }
> {
  if (!z.uuid().safeParse(portfolioId).success) {
    return { ok: false, error: "Invalid portfolio." }
  }

  const { supabase, userId } = await getAuthUserId()
  if (!userId) return { ok: false, error: "Your session has expired." }

  const { data, error } = await supabase
    .from("portfolios")
    .select("draft_content, revision, last_saved_at")
    .eq("id", portfolioId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) return { ok: false, error: "Portfolio not found." }

  return {
    ok: true,
    revision: data.revision,
    savedAt: data.last_saved_at,
    content: data.draft_content,
  }
}

export async function publishPortfolioAction(input: {
  portfolioId: string
  revision: number
  content: unknown
}): Promise<PublishResult> {
  if (
    !z.uuid().safeParse(input.portfolioId).success ||
    !Number.isInteger(input.revision)
  ) {
    return { ok: false, error: "Invalid publish request." }
  }

  const parsed = parsePortfolioContent(input.content)
  if (!parsed.success) {
    return {
      ok: false,
      error: `Some content couldn't be validated. ${formatZodIssues(parsed.error)[0]}`,
    }
  }

  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    return { ok: false, error: "Your session has expired. Sign in again." }
  }

  const owned = await loadOwnedPortfolio(input.portfolioId, userId)
  if (!owned) return { ok: false, error: "Portfolio not found." }

  const { issues, snapshot } = buildPublishSnapshot(parsed.data)
  if (issues.length) {
    return { ok: false, issues }
  }

  const { data, error } = await supabase.rpc("publish_portfolio", {
    p_portfolio_id: input.portfolioId,
    p_content: parsed.data,
    p_published_content: snapshot.published,
    p_media_ids: snapshot.mediaIds,
    p_revision: input.revision,
  })

  if (error || !data?.length) {
    return {
      ok: false,
      error:
        error?.message === "revision_conflict"
          ? "Your latest changes hadn't finished saving. Save, then publish again."
          : errorMessage(error?.message),
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/editor")
  revalidatePath("/template-preview", "layout")

  return {
    ok: true,
    revision: data[0].revision,
    publishedAt: data[0].published_at,
    url: publicPortfolioUrl(owned.username),
  }
}

export async function unpublishPortfolioAction(input: {
  portfolioId: string
  revision: number
}): Promise<
  { ok: true; revision: number } | { ok: false; error: string }
> {
  if (
    !z.uuid().safeParse(input.portfolioId).success ||
    !Number.isInteger(input.revision)
  ) {
    return { ok: false, error: "Invalid unpublish request." }
  }

  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    return { ok: false, error: "Your session has expired. Sign in again." }
  }

  const { data, error } = await supabase.rpc("unpublish_portfolio", {
    p_portfolio_id: input.portfolioId,
    p_revision: input.revision,
  })

  if (error || !data?.length) {
    return {
      ok: false,
      error:
        error?.message === "revision_conflict"
          ? "This portfolio changed somewhere else. Refresh and try again."
          : errorMessage(error?.message),
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/editor")
  revalidatePath("/preview")
  return { ok: true, revision: data[0].revision }
}

export async function updateProfileAction(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const fullName = text(formData, "fullName")
  if (fullName.length < 2) {
    return { status: "error", message: "Enter your full name." }
  }
  if (fullName.length > 120) {
    return { status: "error", message: "Keep your name under 120 characters." }
  }

  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    return { status: "error", message: "Your session has expired." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", userId)

  if (error) {
    return { status: "error", message: "Couldn't save your profile." }
  }

  revalidatePath("/settings")
  revalidatePath("/dashboard")
  return { status: "success", message: "Profile updated." }
}

export async function changeUsernameAction(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const portfolioId = text(formData, "portfolioId")
  const username = normalizeUsername(text(formData, "username"))

  if (!z.uuid().safeParse(portfolioId).success) {
    return { status: "error", message: "Invalid portfolio." }
  }
  const validation = usernameError(username)
  if (validation) return { status: "error", message: validation }

  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    return { status: "error", message: "Your session has expired." }
  }

  const { data, error } = await supabase.rpc("change_portfolio_username", {
    p_portfolio_id: portfolioId,
    p_username: username,
  })

  if (error) {
    return { status: "error", message: errorMessage(error.message) }
  }

  revalidatePath("/settings")
  revalidatePath("/dashboard")
  revalidatePath("/editor")

  return {
    status: "success",
    message: `Your portfolio now lives at ${publicPortfolioUrl(data)}.`,
  }
}
