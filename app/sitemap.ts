import type { MetadataRoute } from "next"

import { SITE_URL, publicPortfolioUrl } from "@/lib/config"
import { TEMPLATE_IDS } from "@/lib/portfolio/constants"
import { getPublishedPortfolios } from "@/lib/portfolio/queries"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const portfolios = await getPublishedPortfolios()
  const now = new Date()

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...TEMPLATE_IDS.map((id) => ({
      url: `${SITE_URL}/template-preview/${id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...portfolios.map((portfolio) => ({
      url: publicPortfolioUrl(portfolio.username),
      lastModified: new Date(portfolio.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]
}
