import type { NextRequest } from "next/server"
import { z } from "zod"

import { createClient, createServiceClient } from "@/lib/supabase/server"
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

async function getServicePublicMediaInfo(
  id: string,
  service: ReturnType<typeof createServiceClient>
) {
  const { data: media, error: mediaError } = await service
    .from("portfolio_media")
    .select("storage_path, mime_type, file_name, width, height, portfolio_id")
    .eq("id", id)
    .maybeSingle()

  if (mediaError || !media) return null

  const { data: portfolio, error: portfolioError } = await service
    .from("portfolios")
    .select("status, is_disabled, published_media_ids")
    .eq("id", media.portfolio_id)
    .maybeSingle()

  if (
    portfolioError ||
    !portfolio ||
    portfolio.status !== "published" ||
    portfolio.is_disabled ||
    !portfolio.published_media_ids.includes(id)
  ) {
    return null
  }

  return media
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
  let serviceClient: ReturnType<typeof createServiceClient> | null = null

  let publicInfo = await getPublicMediaInfo(id)
  if (!publicInfo && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    serviceClient = createServiceClient()
    publicInfo = await getServicePublicMediaInfo(id, serviceClient)
  }
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

    if (media) {
      storagePath = media.storage_path
      mimeType = media.mime_type
      fileName = media.file_name
    } else {
      // Administrators may inspect any portfolio's private draft media.
      const { data: profile } = await ownerClient
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle()

      if (profile?.role !== "admin") return notFound()

      const { data: adminMedia } = await ownerClient
        .from("portfolio_media")
        .select("storage_path, mime_type, file_name")
        .eq("id", id)
        .maybeSingle()

      if (!adminMedia) return notFound()
      storagePath = adminMedia.storage_path
      mimeType = adminMedia.mime_type
      fileName = adminMedia.file_name
    }
  }

  const client = ownerClient ?? createPublicClient()
  let { data: blob, error } = await client.storage
    .from("portfolio-media")
    .download(storagePath)

  if ((error || !blob) && isPublic && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    serviceClient ??= createServiceClient()
    const serviceResult = await serviceClient.storage
      .from("portfolio-media")
      .download(storagePath)
    blob = serviceResult.data
    error = serviceResult.error
  }

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
        ? "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
        : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
