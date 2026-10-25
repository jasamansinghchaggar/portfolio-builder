import type { NextRequest } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { createPublicClient } from "@/lib/supabase/public"
import { getPublicMediaInfo } from "@/lib/portfolio/queries"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const uuidSchema = z.uuid()

function notFound() {
  return new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  })
}

function safeFileName(name: string) {
  const ascii = name.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "file"
  return ascii
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!uuidSchema.safeParse(id).success) return notFound()

  const download = request.nextUrl.searchParams.get("download") === "1"

  let storagePath: string | null = null
  let mimeType = "application/octet-stream"
  let fileName = "file"
  let isPublic = false

  const publicInfo = await getPublicMediaInfo(id)
  if (publicInfo) {
    storagePath = publicInfo.storage_path
    mimeType = publicInfo.mime_type
    fileName = publicInfo.file_name
    isPublic = true
  }

  let ownerClient: Awaited<ReturnType<typeof createClient>> | null = null

  if (!storagePath) {
    ownerClient = await createClient()
    const { data: claims } = await ownerClient.auth.getClaims()
    const userId =
      typeof claims?.claims?.sub === "string" ? claims.claims.sub : null
    if (!userId) return notFound()

    const { data: media } = await ownerClient
      .from("portfolio_media")
      .select("storage_path, mime_type, file_name")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle()

    if (!media) return notFound()
    storagePath = media.storage_path
    mimeType = media.mime_type
    fileName = media.file_name
  }

  const client = ownerClient ?? createPublicClient()
  const { data: blob, error } = await client.storage
    .from("portfolio-media")
    .download(storagePath)

  if (error || !blob) return notFound()

  const forceDownload = download || mimeType === "application/pdf"
  const asciiName = safeFileName(fileName)
  const disposition = `${forceDownload ? "attachment" : "inline"}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`

  return new Response(blob.stream(), {
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(blob.size),
      "Content-Disposition": disposition,
      "Cache-Control": isPublic
        ? "public, max-age=60, s-maxage=60"
        : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
