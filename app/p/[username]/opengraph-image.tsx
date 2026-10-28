import { ImageResponse } from "next/og"

import { getTemplate } from "@/lib/portfolio/templates"
import { getPublicPortfolio } from "@/lib/portfolio/queries"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const alt = "Portfolio preview"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const portfolio = await getPublicPortfolio(username)

  if (!portfolio) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#14110e",
            color: "#f3ecdf",
            fontSize: 56,
          }}
        >
          Portfolio not found
        </div>
      ),
      { ...size }
    )
  }

  const { content } = portfolio
  const template = getTemplate(content.templateId)
  const dark = content.design.appearance === "dark"
  const background = dark ? "#0b1113" : template.palette[0]
  const foreground = dark ? "#f3f6f5" : template.palette[1]
  const accent = content.design.accent
  const name = content.basics.fullName || `@${portfolio.username}`
  const hero = content.sections.find((section) => section.type === "hero")
  const headline =
    (hero && hero.type === "hero" ? hero.headline : content.basics.headline) ||
    content.basics.headline ||
    "Portfolio"

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 72px",
          background,
          color: foreground,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            opacity: 0.65,
          }}
        >
          <span>{template.name} folio</span>
          <span>/{portfolio.username}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              lineHeight: 1.3,
              color: accent,
              maxWidth: 950,
            }}
          >
            {headline.length > 110 ? `${headline.slice(0, 108)}…` : headline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            opacity: 0.65,
          }}
        >
          <span>
            {[content.basics.headline, content.basics.location]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <span>Made with Folio</span>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            height: 8,
            marginTop: 28,
            background: accent,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
