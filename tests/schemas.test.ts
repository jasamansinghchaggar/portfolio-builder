import { describe, expect, it } from "vitest"

import { createSampleContent } from "@/lib/portfolio/sample"
import { portfolioContentSchema } from "@/lib/portfolio/schemas"
import { TEMPLATE_IDS } from "@/lib/portfolio/constants"

describe("portfolio content schema", () => {
  it("accepts the sample content for every template", () => {
    for (const templateId of TEMPLATE_IDS) {
      const parsed = portfolioContentSchema.safeParse(
        createSampleContent(templateId)
      )
      expect(parsed.success).toBe(true)
    }
  })

  it("rejects javascript: URLs", () => {
    const content = createSampleContent()
    const socials = content.sections.find((section) => section.type === "socials")
    if (socials?.type !== "socials" || !socials.items[0]) {
      throw new Error("Sample content needs a social profile.")
    }
    socials.items[0].url = "javascript:alert(1)"

    const parsed = portfolioContentSchema.safeParse(content)
    expect(parsed.success).toBe(false)
  })

  it("rejects non-numeric and non-10-digit phone values", () => {
    const content = createSampleContent()
    content.basics.phone = "not a phone number"
    expect(portfolioContentSchema.safeParse(content).success).toBe(false)

    content.basics.phone = "12345"
    expect(portfolioContentSchema.safeParse(content).success).toBe(false)
  })

  it("allows in-page anchors and mailto links", () => {
    const content = createSampleContent()
    const socials = content.sections.find((section) => section.type === "socials")
    if (socials?.type !== "socials" || !socials.items[1]) {
      throw new Error("Sample content needs two social profiles.")
    }
    socials.items[0].url = "#section-projects"
    socials.items[1].url = "mailto:hello@example.com"

    expect(portfolioContentSchema.safeParse(content).success).toBe(true)
  })

  it("rejects duplicate section types", () => {
    const content = createSampleContent()
    const first = content.sections[0]
    if (!first) throw new Error("Sample content needs a section.")
    content.sections[content.sections.length - 1] = {
      ...first,
      id: crypto.randomUUID(),
    }

    const parsed = portfolioContentSchema.safeParse(content)
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(
        parsed.error.issues.some(
          (issue) => issue.message === "Each section type can only appear once."
        )
      ).toBe(true)
    }
  })

  it("rejects duplicate section IDs", () => {
    const content = createSampleContent()
    const first = content.sections[0]
    const second = content.sections[1]
    if (!second) throw new Error("Sample content needs two sections.")
    content.sections[1] = {
      ...second,
      id: first.id,
    } as typeof second

    expect(portfolioContentSchema.safeParse(content).success).toBe(false)
  })

  it("rejects unknown section types and invalid palettes", () => {
    const content = createSampleContent()
    const parsed = portfolioContentSchema.safeParse({
      ...content,
      design: { ...content.design, accent: "blue" },
    })
    expect(parsed.success).toBe(false)

    const unknown = portfolioContentSchema.safeParse({
      ...content,
      sections: [{ ...content.sections[0], type: "team" }],
    })
    expect(unknown.success).toBe(false)
  })

  it("accepts mission promises with no title or description", () => {
    const content = createSampleContent()
    const mission = content.sections.find(
      (section) => section.type === "mission"
    )
    if (mission?.type !== "mission") {
      throw new Error("Sample content needs a mission section.")
    }
    mission.items = [{ id: crypto.randomUUID(), title: "", text: "" }]

    expect(portfolioContentSchema.safeParse(content).success).toBe(true)
  })

  it("defaults missing mission promise fields", () => {
    const content = createSampleContent()
    const parsed = portfolioContentSchema.safeParse({
      ...content,
      sections: content.sections.map((section) =>
        section.type === "mission"
          ? { ...section, items: [{ id: crypto.randomUUID() }] }
          : section
      ),
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      const mission = parsed.data.sections.find(
        (section) => section.type === "mission"
      )
      if (mission?.type !== "mission") {
        throw new Error("Parsed content needs a mission section.")
      }
      expect(mission.items[0]).toEqual({
        id: expect.any(String),
        title: "",
        text: "",
      })
    }
  })

  it("trims fields rather than persisting whitespace", () => {
    const content = createSampleContent()
    content.basics.fullName = "  Avery Quinn  "
    const parsed = portfolioContentSchema.parse(content)
    expect(parsed.basics.fullName).toBe("Avery Quinn")
  })
})
