import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer"
import { PromoBar } from "@/components/portfolio/promo-bar"
import { APP_NAME, SITE_URL, portfolioPath, publicPortfolioUrl } from "@/lib/config"
import { getPublicPortfolio } from "@/lib/portfolio/queries"
import { businessName } from "@/lib/portfolio/sections"

export const dynamic = "force-dynamic"
export const revalidate = 0

type PageProps = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params
  const portfolio = await getPublicPortfolio(username)
  if (!portfolio) {
    return { title: "Portfolio not found", robots: { index: false, follow: false } }
  }

  const { content } = portfolio
  const name = businessName(content) || `@${portfolio.username}`
  const summary =
    content.basics.tagline ||
    content.basics.headline ||
    content.basics.role ||
    `${name} on ${APP_NAME}`
  const hero = content.sections.find((section) => section.type === "hero")
  const description =
    (hero?.type === "hero" ? hero.subheadline || hero.bio : "") || summary
  const canonical = publicPortfolioUrl(portfolio.username)
  const ogImage = `${SITE_URL}${portfolioPath(portfolio.username)}/opengraph-image`

  return {
    title: name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title: `${name} — ${content.basics.role || content.basics.headline || "Business"}`,
      description,
      url: canonical,
      siteName: APP_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — ${content.basics.role || content.basics.headline || "Business"}`,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  }
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { username } = await params
  const portfolio = await getPublicPortfolio(username)
  if (!portfolio) notFound()

  return (
    <div className="pf-public">
      <PromoBar />
      <PortfolioRenderer
        content={portfolio.content}
        media={portfolio.media}
        username={portfolio.username}
      />
    </div>
  )
}
