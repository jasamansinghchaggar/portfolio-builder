import type { ImgHTMLAttributes } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    sizes: _sizes,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    src: string | { src: string }
    fill?: boolean
    priority?: boolean
    sizes?: string
  }) => {
    void _fill
    void _priority
    void _sizes
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={typeof src === "string" ? src : src.src}
        alt={alt ?? ""}
        {...props}
      />
    )
  },
}))

import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer"
import { createSampleContent } from "@/lib/portfolio/sample"
import { TEMPLATE_IDS } from "@/lib/portfolio/constants"

describe("portfolio renderer", () => {
  it("renders every template through the Studio design", () => {
    for (const templateId of TEMPLATE_IDS) {
      const html = renderToStaticMarkup(
        <PortfolioRenderer content={createSampleContent(templateId)} />
      )

      expect(html).toContain(`data-template="studio"`)
      expect(html).toContain("Quinn Studio")
      expect(html).toContain("pf-site")
      expect(html).toContain(`class="pf-hero"`)
    }
  })

  it("omits hidden sections from public output", () => {
    const content = createSampleContent()
    const about = content.sections.find((section) => section.type === "about")
    if (!about) throw new Error("Sample content needs an about section.")
    about.visible = false

    const html = renderToStaticMarkup(<PortfolioRenderer content={content} />)
    expect(html).not.toContain(`id="section-about"`)
    expect(html).toContain(`class="pf-hero"`)
  })

  it("escapes user-provided markup instead of rendering it", () => {
    const content = createSampleContent()
    content.basics.fullName = "<script>alert(1)</script>"
    content.basics.businessName = "<script>alert(1)</script>"
    content.basics.role = "<img src=x onerror=alert(1)>"
    const hero = content.sections.find((section) => section.type === "hero")
    if (hero?.type !== "hero") throw new Error("Sample content needs a hero.")
    hero.headline = "<img src=x onerror=alert(1)>"

    const html = renderToStaticMarkup(<PortfolioRenderer content={content} />)
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).not.toContain("<img src=x onerror=alert(1)>")
    expect(html).toContain("&lt;script&gt;")
  })
})
