import type { Metadata } from "next"

import { Editor } from "@/components/editor/editor"
import { getProfile, requirePortfolio } from "@/lib/auth"
import { publicPortfolioUrl } from "@/lib/config"
import { coercePortfolioContent } from "@/lib/portfolio/defaults"
import type { EditorMedia, MediaKind } from "@/lib/portfolio/media"

export const metadata: Metadata = {
  title: "Editor",
}

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{
    section?: string | string[]
    welcome?: string | string[]
  }>
}) {
  const params = await searchParams
  const sectionParam = Array.isArray(params.section)
    ? params.section[0]
    : params.section
  const initialSectionId =
    typeof sectionParam === "string" ? sectionParam : undefined
  const welcome =
    params.welcome === "1" ||
    params.welcome === "true" ||
    (Array.isArray(params.welcome) && params.welcome.includes("1"))

  const { supabase, userId, portfolio } = await requirePortfolio("/editor")

  const { data: mediaRows } = await supabase
    .from("portfolio_media")
    .select(
      "id, kind, mime_type, file_name, size_bytes, width, height, created_at"
    )
    .eq("portfolio_id", portfolio.id)
    .order("created_at", { ascending: false })

  const media: EditorMedia[] = (mediaRows ?? []).map((row) => ({
    id: row.id,
    kind: row.kind as MediaKind,
    mimeType: row.mime_type,
    fileName: row.file_name,
    sizeBytes: row.size_bytes,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
  }))

  const profile = await getProfile(userId)
  const content = coercePortfolioContent(portfolio.draft_content, {
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? "",
  })

  return (
    <Editor
      portfolioId={portfolio.id}
      username={portfolio.username}
      publicUrl={publicPortfolioUrl(portfolio.username)}
      status={portfolio.status}
      revision={portfolio.revision}
      savedAt={portfolio.last_saved_at}
      publishedAt={portfolio.published_at}
      content={content}
      media={media}
      initialSectionId={initialSectionId}
      welcome={welcome}
    />
  )
}
