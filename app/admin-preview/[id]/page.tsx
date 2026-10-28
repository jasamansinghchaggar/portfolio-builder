import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { z } from "zod"

import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer"
import { requireAdmin } from "@/lib/auth"
import { coercePortfolioContent } from "@/lib/portfolio/defaults"
import { mediaMapFromRows } from "@/lib/portfolio/media"

export const metadata: Metadata = {
  title: "Portfolio preview",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"
export const revalidate = 0

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminPortfolioPreviewPage({ params }: PageProps) {
  const { id } = await params
  if (!z.uuid().safeParse(id).success) notFound()

  const { supabase } = await requireAdmin()

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, user_id, draft_content")
    .eq("id", id)
    .maybeSingle()
  if (!portfolio) notFound()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", portfolio.user_id)
    .maybeSingle()

  const content = coercePortfolioContent(portfolio.draft_content, {
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? "",
  })

  const { data: mediaRows } = await supabase
    .from("portfolio_media")
    .select("id, mime_type, file_name, width, height")
    .eq("portfolio_id", portfolio.id)

  return (
    <PortfolioRenderer
      content={content}
      media={mediaMapFromRows(mediaRows ?? [])}
      preview
    />
  )
}
