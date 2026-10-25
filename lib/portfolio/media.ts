export type MediaMeta = {
  width: number | null
  height: number | null
  mimeType: string
  fileName: string
}

export type MediaKind =
  | "avatar"
  | "project"
  | "resume"
  | "general"

export type EditorMedia = {
  id: string
  kind: MediaKind
  mimeType: string
  fileName: string
  sizeBytes: number
  width: number | null
  height: number | null
  createdAt: string
}

export type MediaMap = Record<string, MediaMeta>

export function isImageMime(mimeType: string) {
  return /^image\/(jpeg|png|webp|gif|avif)$/i.test(mimeType)
}

export function isPdfMime(mimeType: string) {
  return mimeType === "application/pdf"
}

export function mediaHref(id: string) {
  return `/media/${id}`
}

export function mediaDownloadHref(id: string) {
  return `/media/${id}?download=1`
}

export function parseMediaMap(value: unknown): MediaMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const result: MediaMap = {}
  for (const [id, entry] of Object.entries(value)) {
    if (!entry || typeof entry !== "object") continue
    const record = entry as Record<string, unknown>
    if (typeof record.mimeType !== "string") continue
    result[id] = {
      width: typeof record.width === "number" ? record.width : null,
      height: typeof record.height === "number" ? record.height : null,
      mimeType: record.mimeType,
      fileName:
        typeof record.fileName === "string" ? record.fileName : "portfolio-file",
    }
  }
  return result
}

export function mediaDimensions(
  meta: MediaMeta | undefined,
  fallback = { width: 1200, height: 800 }
) {
  return {
    width: meta?.width && meta.width > 0 ? meta.width : fallback.width,
    height: meta?.height && meta.height > 0 ? meta.height : fallback.height,
  }
}

export type MediaRowLike = {
  id: string
  mime_type: string
  file_name: string
  width: number | null
  height: number | null
}

export function mediaMapFromRows(rows: MediaRowLike[]): MediaMap {
  return Object.fromEntries(
    rows.map((row) => [
      row.id,
      {
        width: row.width,
        height: row.height,
        mimeType: row.mime_type,
        fileName: row.file_name,
      },
    ])
  )
}

export function mediaMapFromEditor(media: EditorMedia[]): MediaMap {
  return Object.fromEntries(
    media.map((item) => [
      item.id,
      {
        width: item.width,
        height: item.height,
        mimeType: item.mimeType,
        fileName: item.fileName,
      },
    ])
  )
}
