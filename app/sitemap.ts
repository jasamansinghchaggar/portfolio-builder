import type { MetadataRoute } from "next"

import { SITE_URL, publicPortfolioUrl } from "@/lib/config"
import { getPublishedPortfolios } from "@/lib/portfolio/queries"
import { TEMPLATES } from "@/lib/portfolio/templates"

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
    ...TEMPLATES.map((template) => ({
      url: `${SITE_URL}/template-preview/${template.id}`,
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
