import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { z } from "zod"

import { Editor } from "@/components/editor/editor"
import { requireAdmin } from "@/lib/auth"
import { publicPortfolioUrl } from "@/lib/config"
import { coercePortfolioContent } from "@/lib/portfolio/defaults"
import type { EditorMedia, MediaKind } from "@/lib/portfolio/media"

export const metadata: Metadata = {
  title: "Edit portfolio",
  robots: { index: false, follow: false },
}

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ section?: string | string[] }>
}

export default async function AdminPortfolioEditorPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const query = await searchParams
  if (!z.uuid().safeParse(id).success) notFound()

  const { supabase } = await requireAdmin()

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (!portfolio) notFound()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", portfolio.user_id)
    .maybeSingle()

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

  const content = coercePortfolioContent(portfolio.draft_content, {
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? "",
  })

  const sectionParam = Array.isArray(query.section)
    ? query.section[0]
    : query.section

  return (
    <Editor
      admin
      portfolioId={portfolio.id}
      username={portfolio.username}
      publicUrl={publicPortfolioUrl(portfolio.username)}
      status={portfolio.status}
      revision={portfolio.revision}
      savedAt={portfolio.last_saved_at}
      publishedAt={portfolio.published_at}
      content={content}
      media={media}
      initialSectionId={
        typeof sectionParam === "string" ? sectionParam : undefined
      }
    />
  )
}
