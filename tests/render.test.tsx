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
import { portfolioContentSchema } from "@/lib/portfolio/schemas"

describe("portfolio renderer", () => {
  it("renders named QR links instead of automatic destinations", () => {
    const content = createSampleContent()
    const qr = content.sections.find((section) => section.type === "qr")
    if (qr?.type !== "qr") throw new Error("Sample needs a QR section.")
    qr.links = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        label: "Book a visit",
        url: "https://example.com/book",
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        label: "Our shop",
        url: "https://example.com/shop",
      },
    ]

    const html = renderToStaticMarkup(
      <PortfolioRenderer content={content} username="example" />
    )
    expect(html).toContain("Book a visit")
    expect(html).toContain("Our shop")
    expect(html).not.toContain("Portfolio link")
    expect(html).not.toContain("WhatsApp chat")
    expect(html).not.toContain("Instagram profile")
  })

  it("preserves automatic QR codes for older saved content", () => {
    const content = createSampleContent()
    const qr = content.sections.find((section) => section.type === "qr")
    if (qr?.type !== "qr") throw new Error("Sample needs a QR section.")
    delete qr.links
    const parsed = portfolioContentSchema.parse(content)

    const html = renderToStaticMarkup(
      <PortfolioRenderer content={parsed} username="example" />
    )
    expect(html).toContain("Portfolio link")
    expect(html).toContain("WhatsApp chat")
    expect(html).toContain("Instagram profile")
  })

  it("hides QR sharing until a new portfolio has a complete link", () => {
    const content = createSampleContent()
    const qr = content.sections.find((section) => section.type === "qr")
    if (qr?.type !== "qr") throw new Error("Sample needs a QR section.")
    qr.links = [
      { id: "11111111-1111-4111-8111-111111111111", label: "", url: "" },
    ]

    const html = renderToStaticMarkup(<PortfolioRenderer content={content} />)
    expect(html).not.toContain("pf-qr-tabs")
  })

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
            focalX: 0.2,
            focalY: 0.8,
          },
        }}
      />
    )

    expect(html).toContain("pf-hero-avatar")
    expect(html).toContain("/media/media-avatar")
    expect(html).toContain("profile photo")
    expect(html).toMatch(/object-position:\s*20(?:\.00)?%\s+80(?:\.00)?%/)
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
            focalX: 0.5,
            focalY: 0.5,
          },
        }}
      />
    )

    expect(html).not.toContain("pf-hero-avatar")
  })

  it("applies per-usage crops to payment QR images", () => {
    const content = createSampleContent()
    const payment = content.sections.find(
      (section) => section.type === "payment"
    )
    if (payment?.type !== "payment") {
      throw new Error("Sample content needs a payment section.")
    }
    payment.qrMediaId = "media-qr"
    content.mediaCrops = {
      [`qr.${payment.id}`]: { x: 0.1, y: 0.9 },
    }

    const html = renderToStaticMarkup(
      <PortfolioRenderer
        content={content}
        media={{
          "media-qr": {
            width: 400,
            height: 400,
            mimeType: "image/png",
            fileName: "qr.png",
            focalX: 0.5,
            focalY: 0.5,
          },
        }}
      />
    )

    expect(html).toMatch(/object-position:\s*10(?:\.00)?%\s+90(?:\.00)?%/)
  })

  it("renders a mission intro without any promise cards", () => {
    const content = createSampleContent()
    const mission = content.sections.find(
      (section) => section.type === "mission"
    )
    if (mission?.type !== "mission") {
      throw new Error("Sample content needs a mission section.")
    }
    mission.items = []
    mission.intro = "A single sentence mission."

    const html = renderToStaticMarkup(<PortfolioRenderer content={content} />)
    expect(html).toContain("A single sentence mission.")
    expect(html).not.toContain("pf-cards-three")
  })

  it("skips empty promise cards and renders partial promises", () => {
    const content = createSampleContent()
    const mission = content.sections.find(
      (section) => section.type === "mission"
    )
    if (mission?.type !== "mission") {
      throw new Error("Sample content needs a mission section.")
    }
    mission.items = [
      { id: crypto.randomUUID(), title: "", text: "" },
      { id: crypto.randomUUID(), title: "Only a title", text: "" },
      { id: crypto.randomUUID(), title: "", text: "Only a description" },
    ]
    content.sections = content.sections.filter(
      (section) => section.type === "hero" || section.type === "mission"
    )

    const html = renderToStaticMarkup(<PortfolioRenderer content={content} />)
    expect(html).toContain("Only a title")
    expect(html).toContain("Only a description")
    expect(html.match(/class="pf-card"/g)?.length).toBe(2)
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

  it("renders the location map with directions and map links", () => {
    const html = renderToStaticMarkup(
      <PortfolioRenderer content={createSampleContent()} />
    )

    expect(html).toContain(`id="section-location"`)
    expect(html).toContain(`class="pf-map"`)
    expect(html).toContain("https://www.google.com/maps?")
    expect(html).toContain("output=embed")
    expect(html).toContain("Get directions")
    expect(html).toContain("Open in Google Maps")
    expect(html).toContain("82 Dean Street, Brooklyn, NY")
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
