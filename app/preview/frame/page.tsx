import type { Metadata } from "next"

import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer"
import { getProfile, requirePortfolio } from "@/lib/auth"
import { coercePortfolioContent } from "@/lib/portfolio/defaults"
import { mediaMapFromRows } from "@/lib/portfolio/media"

export const metadata: Metadata = {
  title: "Portfolio preview",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PreviewFramePage() {
  const { supabase, userId, portfolio } = await requirePortfolio("/preview")
  const profile = await getProfile(userId)
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
