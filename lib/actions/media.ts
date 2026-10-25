"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import sharp from "sharp"

import { getAuthUserId } from "@/lib/auth"
import { MAX_UPLOAD_BYTES } from "@/lib/config"
import type { EditorMedia } from "@/lib/portfolio/media"
import type { MediaKind } from "@/lib/supabase/database.types"

const MEDIA_KINDS = new Set<MediaKind>(["avatar", "project", "resume", "general"])
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const ALLOWED_TYPES = new Set([...ALLOWED_IMAGE_TYPES, "application/pdf"])

export type UploadResult =
  | { ok: true; media: EditorMedia }
  | { ok: false; error: string }

function sanitizeFileName(value: string) {
  const name = value
    .replace(/[\u0000-\u001f\u007f/\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120)
  return name || "upload"
}

function toMediaItem(row: {
  id: string
  kind: MediaKind
  mime_type: string
  file_name: string
  size_bytes: number
  width: number | null
  height: number | null
  created_at: string
}): EditorMedia {
  return {
    id: row.id,
    kind: row.kind,
    mimeType: row.mime_type,
    fileName: row.file_name,
    sizeBytes: row.size_bytes,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
  }
}

export async function uploadMediaAction(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file")
  const requestedKind = String(formData.get("kind") ?? "general")
  const kind: MediaKind = MEDIA_KINDS.has(requestedKind as MediaKind)
    ? (requestedKind as MediaKind)
    : "general"

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Files must be 5 MB or smaller." }
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Use a JPG, PNG, WebP image, or a PDF.",
    }
  }

  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    return { ok: false, error: "Your session has expired. Sign in again." }
  }

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()
  if (!portfolio) {
    return { ok: false, error: "Create your portfolio before uploading files." }
  }

  const input = Buffer.from(await file.arrayBuffer())
  let output: Buffer
  let contentType: string
  let extension: string
  let width: number | null = null
  let height: number | null = null

  try {
    if (file.type === "application/pdf") {
      if (input.subarray(0, 5).toString("ascii") !== "%PDF-") {
        return { ok: false, error: "That file doesn't look like a valid PDF." }
      }
      output = input
      contentType = "application/pdf"
      extension = "pdf"
    } else {
      const probe = sharp(input, { failOn: "error" })
      const metadata = await probe.metadata()
      if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
        return { ok: false, error: "That image format isn't supported." }
      }

      const result = await sharp(input, { failOn: "error" })
        .rotate()
        .resize({
          width: 2000,
          height: 2000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82, effort: 4 })
        .toBuffer({ resolveWithObject: true })

      output = result.data
      contentType = "image/webp"
      extension = "webp"
      width = result.info.width
      height = result.info.height
    }
  } catch {
    return { ok: false, error: "We couldn't read that file. Try another copy." }
  }

  if (output.byteLength > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: "The processed file is still over 5 MB. Try a smaller image.",
    }
  }

  const storagePath = `${userId}/${portfolio.id}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await supabase.storage
    .from("portfolio-media")
    .upload(storagePath, output, { contentType, upsert: false })

  if (uploadError) {
    return { ok: false, error: "Upload failed. Please try again." }
  }

  const { data: row, error: insertError } = await supabase
    .from("portfolio_media")
    .insert({
      user_id: userId,
      portfolio_id: portfolio.id,
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
    await supabase.storage.from("portfolio-media").remove([storagePath])
    return { ok: false, error: "Couldn't save the file record. Please try again." }
  }

  revalidatePath("/editor")
  return { ok: true, media: toMediaItem(row) }
}

export async function deleteMediaAction(
  mediaId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!z.uuid().safeParse(mediaId).success) {
    return { ok: false, error: "Invalid file." }
  }

  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    return { ok: false, error: "Your session has expired. Sign in again." }
  }

  const { data: media } = await supabase
    .from("portfolio_media")
    .select("id, portfolio_id, storage_path, user_id")
    .eq("id", mediaId)
    .eq("user_id", userId)
    .maybeSingle()

  if (!media) return { ok: false, error: "File not found." }

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("draft_content, published_content, published_media_ids")
    .eq("id", media.portfolio_id)
    .eq("user_id", userId)
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
          "This file is still used in your portfolio. Remove it from the content and save, then delete it.",
      }
    }
  }

  const { error: deleteError } = await supabase
    .from("portfolio_media")
    .delete()
    .eq("id", mediaId)
    .eq("user_id", userId)

  if (deleteError) {
    return { ok: false, error: "Couldn't delete that file. Try again." }
  }

  await supabase.storage.from("portfolio-media").remove([media.storage_path])
  revalidatePath("/editor")
  return { ok: true }
}
