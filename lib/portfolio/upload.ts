import sharp from "sharp"

import { MAX_UPLOAD_BYTES } from "@/lib/config"
import type { EditorMedia } from "@/lib/portfolio/media"
import type { MediaKind } from "@/lib/supabase/database.types"

export const MEDIA_KINDS = new Set<MediaKind>([
  "avatar",
  "project",
  "resume",
  "general",
])

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const ALLOWED_TYPES = new Set([...ALLOWED_IMAGE_TYPES, "application/pdf"])

export function sanitizeFileName(value: string) {
  const name = value
    .replace(/[\u0000-\u001f\u007f/\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120)
  return name || "upload"
}

export function toMediaItem(row: {
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

export type PreparedUpload =
  | {
      ok: true
      output: Buffer
      contentType: string
      extension: string
      width: number | null
      height: number | null
    }
  | { ok: false; error: string }

/**
 * Validates and normalises an uploaded file. Shared by owner and admin media
 * actions so both paths enforce the same size, type, and re-encoding rules.
 */
export async function prepareUpload(file: File): Promise<PreparedUpload> {
  if (file.size === 0) {
    return { ok: false, error: "Choose a file to upload." }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Files must be 5 MB or smaller." }
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Use a JPG, PNG, WebP image, or a PDF." }
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
      if (
        !metadata.format ||
        !["jpeg", "png", "webp"].includes(metadata.format)
      ) {
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

  return { ok: true, output, contentType, extension, width, height }
}
