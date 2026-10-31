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

  it("renders the hero profile image from page details", () => {
    const content = createSampleContent()
    content.basics.avatarMediaId = "media-avatar"

    const html = renderToStaticMarkup(
      <PortfolioRenderer
        content={content}
        media={{
          "media-avatar": {
            width: 400,
            height: 400,
            mimeType: "image/jpeg",
            fileName: "portrait.jpg",
          },
        }}
      />
    )

    expect(html).toContain("pf-hero-avatar")
    expect(html).toContain("/media/media-avatar")
    expect(html).toContain("profile photo")
  })

  it("skips the hero profile image when the file is not an image", () => {
    const content = createSampleContent()
    content.basics.avatarMediaId = "media-file"

    const html = renderToStaticMarkup(
      <PortfolioRenderer
        content={content}
        media={{
          "media-file": {
            width: null,
            height: null,
            mimeType: "application/pdf",
            fileName: "profile.pdf",
          },
        }}
      />
    )

    expect(html).not.toContain("pf-hero-avatar")
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

  it("reads contact details from page details instead of legacy section fields", () => {
    const content = createSampleContent()
    content.basics.email = "studio@example.com"
    content.basics.phone = "+44 20 7946 0000"
    const contact = content.sections.find(
      (section) => section.type === "contact"
    )
    if (contact?.type !== "contact") {
      throw new Error("Sample content needs a contact section.")
    }
    contact.email = "legacy@example.com"
    contact.phone = "+1 000 000 0000"

    const html = renderToStaticMarkup(<PortfolioRenderer content={content} />)
    expect(html).toContain("studio@example.com")
    expect(html).not.toContain("legacy@example.com")
    expect(html).not.toContain("+1 000 000 0000")
  })

  it("shows the owner name and role in the hero subline", () => {
    const html = renderToStaticMarkup(
      <PortfolioRenderer content={createSampleContent()} />
    )
    expect(html).toContain(`class="pf-hero-meta"`)
    expect(html).toContain("Independent product designer")
  })

  it("escapes user-provided markup instead of rendering it", () => {
    const content = createSampleContent()
    content.basics.fullName = "<script>alert(1)</script>"
    content.basics.businessName = "<script>alert(1)</script>"
    content.basics.role = "<img src=x onerror=alert(1)>"
    content.basics.headline = "<img src=x onerror=alert(1)>"

    const html = renderToStaticMarkup(<PortfolioRenderer content={content} />)
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).not.toContain("<img src=x onerror=alert(1)>")
    expect(html).toContain("&lt;script&gt;")
  })
})
