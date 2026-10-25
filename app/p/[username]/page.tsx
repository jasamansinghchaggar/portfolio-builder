import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer"
import { APP_NAME, SITE_URL, portfolioPath, publicPortfolioUrl } from "@/lib/config"
import { getPublicPortfolio } from "@/lib/portfolio/queries"

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
  const name = content.basics.fullName || `@${portfolio.username}`
  const hero = content.sections.find((section) => section.type === "hero")
  const description =
    (hero && hero.type === "hero"
      ? hero.subheadline || hero.bio || content.basics.headline
      : content.basics.headline) ||
    `${name}'s portfolio on ${APP_NAME}.`
  const canonical = publicPortfolioUrl(portfolio.username)
  const ogImage = `${SITE_URL}${portfolioPath(portfolio.username)}/opengraph-image`

  return {
    title: name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title: `${name} — ${content.basics.headline || "Portfolio"}`,
      description,
      url: canonical,
      siteName: APP_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${name}'s portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — ${content.basics.headline || "Portfolio"}`,
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
    <PortfolioRenderer
      content={portfolio.content}
      media={portfolio.media}
    />
  )
}
