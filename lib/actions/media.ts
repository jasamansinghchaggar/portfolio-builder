"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getAuthUserId } from "@/lib/auth"
import type { EditorMedia } from "@/lib/portfolio/media"
import {
  MEDIA_KINDS,
  prepareUpload,
  sanitizeFileName,
  toMediaItem,
} from "@/lib/portfolio/upload"
import type { MediaKind } from "@/lib/supabase/database.types"

export type UploadResult =
  | { ok: true; media: EditorMedia }
  | { ok: false; error: string }

export async function uploadMediaAction(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file")
  const requestedKind = String(formData.get("kind") ?? "general")
  const kind: MediaKind = MEDIA_KINDS.has(requestedKind as MediaKind)
    ? (requestedKind as MediaKind)
    : "general"

  if (!(file instanceof File)) {
    return { ok: false, error: "Choose a file to upload." }
  }

  const prepared = await prepareUpload(file)
  if (!prepared.ok) return prepared

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

  const { output, contentType, extension, width, height } = prepared
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
