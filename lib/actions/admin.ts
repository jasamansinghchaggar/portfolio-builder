"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getAuthUserId } from "@/lib/auth"
import { publicPortfolioUrl } from "@/lib/config"
import { parsePortfolioContent } from "@/lib/portfolio/defaults"
import { buildPublishSnapshot } from "@/lib/portfolio/publish"
import { formatZodIssues } from "@/lib/portfolio/schemas"
import {
  MEDIA_KINDS,
  prepareUpload,
  sanitizeFileName,
  toMediaItem,
} from "@/lib/portfolio/upload"
import type { EditorMedia } from "@/lib/portfolio/media"
import type { MediaKind, PortfolioStatus } from "@/lib/supabase/database.types"

import type { PublishResult, SaveResult } from "./state"

const uuid = z.uuid()

function errorMessage(message: string | undefined) {
  switch (message) {
    case "revision_conflict":
      return "This portfolio was saved somewhere else. Load the latest version first."
    case "portfolio_not_found":
      return "Portfolio not found."
    case "invalid_media":
      return "One of the selected files no longer belongs to this portfolio."
    case "not_admin":
      return "Admin access is required for this action."
    case "not_authenticated":
      return "Your session has expired. Sign in again."
    case "invalid_content":
      return "That content could not be saved."
    case "invalid_message":
      return "Banner message must be between 1 and 240 characters."
    case "invalid_link_label":
      return "Link label must be between 1 and 40 characters."
    case "banner_not_found":
      return "That banner no longer exists."
    default:
      return "Something went wrong. Please try again."
  }
}

type AdminContext = {
  supabase: Awaited<ReturnType<typeof getAuthUserId>>["supabase"]
  userId: string
}

/**
 * Verifies the caller is an administrator before touching another user's
 * portfolio. The database repeats this check inside every admin RPC.
 */
async function requireAdminAction(): Promise<
  { ok: true; context: AdminContext } | { ok: false; error: string }
> {
  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    return { ok: false, error: "Your session has expired. Sign in again." }
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  if (error || profile?.role !== "admin") {
    return { ok: false, error: "Admin access is required for this action." }
  }

  return { ok: true, context: { supabase, userId } }
}

async function loadTargetPortfolio(
  context: AdminContext,
  portfolioId: string
): Promise<{
  id: string
  username: string
  user_id: string
  status: PortfolioStatus
  revision: number
} | null> {
  const { data } = await context.supabase
    .from("portfolios")
    .select("id, username, user_id, status, revision")
    .eq("id", portfolioId)
    .maybeSingle()
  return data
}

function revalidatePortfolio(username: string, portfolioId: string) {
  revalidatePath("/admin")
  revalidatePath(`/admin/portfolios/${portfolioId}`)
  revalidatePath(`/p/${username}`)
  revalidatePath("/dashboard")
  revalidatePath("/editor")
  revalidatePath("/preview")
}

export async function adminLoadDraftAction(portfolioId: string): Promise<
  | {
      ok: true
      revision: number
      savedAt: string
      content: unknown
      username: string
    }
  | { ok: false; error: string }
> {
  if (!uuid.safeParse(portfolioId).success) {
    return { ok: false, error: "Invalid portfolio." }
  }

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const { data, error } = await guard.context.supabase
    .from("portfolios")
    .select("username, draft_content, revision, last_saved_at")
    .eq("id", portfolioId)
    .maybeSingle()

  if (error || !data) return { ok: false, error: "Portfolio not found." }

  return {
    ok: true,
    username: data.username,
    revision: data.revision,
    savedAt: data.last_saved_at,
    content: data.draft_content,
  }
}

export async function adminSaveDraftAction(input: {
  portfolioId: string
  revision: number
  content: unknown
}): Promise<SaveResult> {
  if (
    !uuid.safeParse(input.portfolioId).success ||
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

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const target = await loadTargetPortfolio(guard.context, input.portfolioId)
  if (!target) return { ok: false, error: "Portfolio not found." }

  const { data, error } = await guard.context.supabase.rpc(
    "admin_save_portfolio_draft",
    {
      p_portfolio_id: input.portfolioId,
      p_content: parsed.data,
      p_revision: input.revision,
    }
  )

  if (error || !data?.length) {
    return {
      ok: false,
      error: errorMessage(error?.message),
      conflict: error?.message === "revision_conflict",
    }
  }

  revalidatePortfolio(target.username, input.portfolioId)
  return {
    ok: true,
    revision: data[0].revision,
    savedAt: data[0].saved_at,
  }
}

export async function adminOverwriteDraftAction(input: {
  portfolioId: string
  content: unknown
}): Promise<SaveResult> {
  if (!uuid.safeParse(input.portfolioId).success) {
    return { ok: false, error: "Invalid save request." }
  }

  const parsed = parsePortfolioContent(input.content)
  if (!parsed.success) {
    return {
      ok: false,
      error: `Some content is invalid and wasn't saved. ${formatZodIssues(parsed.error)[0]}`,
    }
  }

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const target = await loadTargetPortfolio(guard.context, input.portfolioId)
  if (!target) return { ok: false, error: "Portfolio not found." }

  const { data, error } = await guard.context.supabase.rpc(
    "admin_save_portfolio_draft",
    {
      p_portfolio_id: input.portfolioId,
      p_content: parsed.data,
      p_revision: target.revision,
    }
  )

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

  revalidatePortfolio(target.username, input.portfolioId)
  return {
    ok: true,
    revision: data[0].revision,
    savedAt: data[0].saved_at,
  }
}

export async function adminPublishAction(input: {
  portfolioId: string
  revision: number
  content: unknown
}): Promise<PublishResult> {
  if (
    !uuid.safeParse(input.portfolioId).success ||
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

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const target = await loadTargetPortfolio(guard.context, input.portfolioId)
  if (!target) return { ok: false, error: "Portfolio not found." }

  const { issues, snapshot } = buildPublishSnapshot(parsed.data)
  if (issues.length) {
    return { ok: false, issues }
  }

  const { data, error } = await guard.context.supabase.rpc(
    "admin_publish_portfolio",
    {
      p_portfolio_id: input.portfolioId,
      p_content: parsed.data,
      p_published_content: snapshot.published,
      p_media_ids: snapshot.mediaIds,
      p_revision: input.revision,
    }
  )

  if (error || !data?.length) {
    return {
      ok: false,
      error:
        error?.message === "revision_conflict"
          ? "The latest changes hadn't finished saving. Save, then publish again."
          : errorMessage(error?.message),
    }
  }

  revalidatePortfolio(target.username, input.portfolioId)
  return {
    ok: true,
    revision: data[0].revision,
    publishedAt: data[0].published_at,
    url: publicPortfolioUrl(target.username),
  }
}

export async function adminUnpublishAction(input: {
  portfolioId: string
  revision: number
}): Promise<{ ok: true; revision: number } | { ok: false; error: string }> {
  if (
    !uuid.safeParse(input.portfolioId).success ||
    !Number.isInteger(input.revision)
  ) {
    return { ok: false, error: "Invalid unpublish request." }
  }

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const target = await loadTargetPortfolio(guard.context, input.portfolioId)
  if (!target) return { ok: false, error: "Portfolio not found." }

  const { data, error } = await guard.context.supabase.rpc(
    "admin_unpublish_portfolio",
    {
      p_portfolio_id: input.portfolioId,
      p_revision: input.revision,
    }
  )

  if (error || !data?.length) {
    return {
      ok: false,
      error:
        error?.message === "revision_conflict"
          ? "This portfolio changed somewhere else. Refresh and try again."
          : errorMessage(error?.message),
    }
  }

  revalidatePortfolio(target.username, input.portfolioId)
  return { ok: true, revision: data[0].revision }
}

export async function adminSetPortfolioEnabledAction(input: {
  portfolioId: string
  enabled: boolean
}): Promise<{ ok: true; disabled: boolean } | { ok: false; error: string }> {
  if (
    !uuid.safeParse(input.portfolioId).success ||
    typeof input.enabled !== "boolean"
  ) {
    return { ok: false, error: "Invalid visibility setting." }
  }

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const target = await loadTargetPortfolio(guard.context, input.portfolioId)
  if (!target) return { ok: false, error: "Portfolio not found." }

  const { data, error } = await guard.context.supabase.rpc(
    "admin_set_portfolio_enabled",
    {
      p_portfolio_id: input.portfolioId,
      p_enabled: input.enabled,
    }
  )

  if (error || !data?.length) {
    return { ok: false, error: errorMessage(error?.message) }
  }

  revalidatePortfolio(target.username, input.portfolioId)
  return { ok: true, disabled: data[0].is_disabled }
}

export async function adminSetPortfolioPromoBarAction(input: {
  portfolioId: string
  enabled: boolean
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (
    !uuid.safeParse(input.portfolioId).success ||
    typeof input.enabled !== "boolean"
  ) {
    return { ok: false, error: "Invalid banner setting." }
  }

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const target = await loadTargetPortfolio(guard.context, input.portfolioId)
  if (!target) return { ok: false, error: "Portfolio not found." }

  const { error } = await guard.context.supabase.rpc(
    "admin_set_portfolio_promo_bar",
    {
      p_portfolio_id: input.portfolioId,
      p_enabled: input.enabled,
    }
  )

  if (error) {
    return { ok: false, error: errorMessage(error.message) }
  }

  revalidatePortfolio(target.username, input.portfolioId)
  return { ok: true }
}

export type AdminUploadResult =
  | { ok: true; media: EditorMedia }
  | { ok: false; error: string }

export async function adminUploadMediaAction(
  portfolioId: string,
  formData: FormData
): Promise<AdminUploadResult> {
  if (!uuid.safeParse(portfolioId).success) {
    return { ok: false, error: "Invalid portfolio." }
  }

  const file = formData.get("file")
  const requestedKind = String(formData.get("kind") ?? "general")
  const kind: MediaKind = MEDIA_KINDS.has(requestedKind as MediaKind)
    ? (requestedKind as MediaKind)
    : "general"

  if (!(file instanceof File)) {
    return { ok: false, error: "Choose a file to upload." }
  }

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const target = await loadTargetPortfolio(guard.context, portfolioId)
  if (!target) return { ok: false, error: "Portfolio not found." }

  const prepared = await prepareUpload(file)
  if (!prepared.ok) return prepared

  const { output, contentType, extension, width, height } = prepared
  const storagePath = `${target.user_id}/${target.id}/${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await guard.context.supabase.storage
    .from("portfolio-media")
    .upload(storagePath, output, { contentType, upsert: false })

  if (uploadError) {
    return { ok: false, error: "Upload failed. Please try again." }
  }

  const { data: row, error: insertError } = await guard.context.supabase
    .from("portfolio_media")
    .insert({
      user_id: target.user_id,
      portfolio_id: target.id,
      kind,
      storage_path: storagePath,
      file_name: sanitizeFileName(file.name),
      mime_type: contentType,
      size_bytes: output.byteLength,
      width,
      height,
    })
    .select(
      "id, kind, mime_type, file_name, size_bytes, width, height, created_at"
    )
    .single()

  if (insertError || !row) {
    await guard.context.supabase.storage
      .from("portfolio-media")
      .remove([storagePath])
    return {
      ok: false,
      error: "Couldn't save the file record. Please try again.",
    }
  }

  revalidatePortfolio(target.username, target.id)
  return { ok: true, media: toMediaItem(row) }
}

export async function adminDeleteMediaAction(
  mediaId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!uuid.safeParse(mediaId).success) {
    return { ok: false, error: "Invalid file." }
  }

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const { data: media } = await guard.context.supabase
    .from("portfolio_media")
    .select("id, portfolio_id, storage_path")
    .eq("id", mediaId)
    .maybeSingle()

  if (!media) return { ok: false, error: "File not found." }

  const { data: portfolio } = await guard.context.supabase
    .from("portfolios")
    .select("username, draft_content, published_content, published_media_ids")
    .eq("id", media.portfolio_id)
    .maybeSingle()

  if (portfolio) {
    const inDraft = JSON.stringify(portfolio.draft_content).includes(mediaId)
    const inPublished = portfolio.published_content
      ? JSON.stringify(portfolio.published_content).includes(mediaId)
      : false
    const inPublishedMedia = portfolio.published_media_ids.includes(mediaId)
    if (inDraft || inPublished || inPublishedMedia) {
      return {
        ok: false,
        error:
          "This file is still used in the portfolio. Remove it from the content, save, then delete it.",
      }
    }
  }

  const { error: deleteError } = await guard.context.supabase
    .from("portfolio_media")
    .delete()
    .eq("id", mediaId)

  if (deleteError) {
    return { ok: false, error: "Couldn't delete that file. Try again." }
  }

  await guard.context.supabase.storage
    .from("portfolio-media")
    .remove([media.storage_path])

  if (portfolio) {
    revalidatePortfolio(portfolio.username, media.portfolio_id)
  }
  return { ok: true }
}

export async function adminMarkMessageReadAction(input: {
  messageId: string
  read: boolean
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!uuid.safeParse(input.messageId).success) {
    return { ok: false, error: "Invalid message." }
  }

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const { error } = await guard.context.supabase.rpc(
    "admin_mark_message_read",
    {
      p_message_id: input.messageId,
      p_read: input.read,
    }
  )

  if (error) {
    return { ok: false, error: errorMessage(error.message) }
  }

  revalidatePath("/messages")
  return { ok: true }
}
export type AdminPromoBanner = {
  id: string
  message: string
  linkUrl: string | null
  linkLabel: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export async function adminListPromoBannersAction(): Promise<
  { ok: true; banners: AdminPromoBanner[] } | { ok: false; error: string }
> {
  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const { data, error } = await guard.context.supabase.rpc(
    "admin_list_promo_banners"
  )
  if (error) return { ok: false, error: errorMessage(error.message) }

  return {
    ok: true,
    banners: (data ?? []).map((row) => ({
      id: row.id,
      message: row.message,
      linkUrl: row.link_url,
      linkLabel: row.link_label,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  }
}

export async function adminCreatePromoBannerAction(input: {
  message: string
  linkUrl?: string
  linkLabel?: string
  isActive?: boolean
  sortOrder?: number
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (typeof input.message !== "string") {
    return { ok: false, error: "Invalid banner message." }
  }

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const { data, error } = await guard.context.supabase.rpc(
    "admin_create_promo_banner",
    {
      p_message: input.message,
      p_link_url: input.linkUrl ?? null,
      p_link_label: input.linkLabel ?? null,
      p_is_active: input.isActive ?? true,
      p_sort_order: input.sortOrder ?? 0,
    }
  )

  if (error || !data) {
    return { ok: false, error: errorMessage(error?.message) }
  }

  revalidatePath("/", "layout")
  return { ok: true, id: data as unknown as string }
}

export async function adminUpdatePromoBannerAction(input: {
  id: string
  message?: string
  linkUrl?: string | null
  linkLabel?: string
  isActive?: boolean
  sortOrder?: number
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!uuid.safeParse(input.id).success) {
    return { ok: false, error: "Invalid banner." }
  }

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const { error } = await guard.context.supabase.rpc("admin_update_promo_banner", {
    p_id: input.id,
    p_message: input.message ?? null,
    p_link_url: input.linkUrl ?? null,
    p_link_label: input.linkLabel ?? null,
    p_is_active: input.isActive ?? null,
    p_sort_order: input.sortOrder ?? null,
  })

  if (error) {
    return { ok: false, error: errorMessage(error.message) }
  }

  revalidatePath("/", "layout")
  return { ok: true }
}

export async function adminDeletePromoBannerAction(input: {
  id: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!uuid.safeParse(input.id).success) {
    return { ok: false, error: "Invalid banner." }
  }

  const guard = await requireAdminAction()
  if (!guard.ok) return guard

  const { error } = await guard.context.supabase.rpc("admin_delete_promo_banner", {
    p_id: input.id,
  })

  if (error) {
    return { ok: false, error: errorMessage(error.message) }
  }

  revalidatePath("/", "layout")
  return { ok: true }
}
