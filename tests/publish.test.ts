import { describe, expect, it } from "vitest"

import { createSampleContent } from "@/lib/portfolio/sample"
import {
  buildPublishedContent,
  buildPublishSnapshot,
  checklistProgress,
  collectPublishedMediaIds,
  publishChecklist,
  validateForPublish,
} from "@/lib/portfolio/publish"

describe("publish snapshot", () => {
  it("keeps hidden sections out of the published snapshot", () => {
    const content = createSampleContent()
    const about = content.sections.find((section) => section.type === "about")
    if (!about) throw new Error("Sample content needs an about section.")
    about.visible = false

    const published = buildPublishedContent(content)

    expect(published.sections.some((section) => section.type === "about")).toBe(
      false
    )
    // The draft is untouched.
    expect(content.sections.some((section) => section.type === "about")).toBe(
      true
    )
  })

  it("only collects media referenced by visible sections", () => {
    const content = createSampleContent()
    const avatarId = "11111111-1111-4111-8111-111111111111"
    const hiddenImageId = "22222222-2222-4222-8222-222222222222"
    const visibleImageId = "33333333-3333-4333-8333-333333333333"

    content.basics.avatarMediaId = avatarId
    const hero = content.sections.find((section) => section.type === "hero")
    const projects = content.sections.find(
      (section) => section.type === "projects"
    )
    if (hero?.type !== "hero" || projects?.type !== "projects") {
      throw new Error("Sample content needs a hero and projects section.")
    }
    hero.imageMediaId = visibleImageId
    projects.visible = false
    if (!projects.items[0]) throw new Error("Sample projects need an item.")
    projects.items[0].imageMediaId = hiddenImageId

    const ids = collectPublishedMediaIds(buildPublishedContent(content))
    expect(ids).toContain(avatarId)
    expect(ids).toContain(visibleImageId)
    expect(ids).not.toContain(hiddenImageId)
  })

  it("does not mutate the draft when building a snapshot", () => {
    const content = createSampleContent()
    const before = structuredClone(content)
    buildPublishSnapshot(content)
    expect(content).toEqual(before)
  })
})

describe("publish validation", () => {
  it("asks for both a name and URL on partially filled QR links", () => {
    const content = createSampleContent()
    const qr = content.sections.find((section) => section.type === "qr")
    if (qr?.type !== "qr") throw new Error("Sample needs a QR section.")
    qr.links = [
      { id: "11111111-1111-4111-8111-111111111111", label: "Booking", url: "" },
    ]
    expect(
      validateForPublish(content).some((issue) =>
        issue.message.includes("needs both a name and a link")
      )
    ).toBe(true)
  })

  it("requires a name and some visible substance", () => {
    const content = createSampleContent()
    content.basics.fullName = ""
    content.basics.businessName = ""
    content.sections = content.sections.map((section) => ({
      ...section,
      visible: false,
    }))

    const issues = validateForPublish(content)
    expect(issues.some((issue) => issue.path === "basics.fullName")).toBe(true)
    expect(
      issues.some((issue) => issue.message.includes("at least one section"))
    ).toBe(true)
  })

  it("flags empty contact details", () => {
    const content = createSampleContent()
    content.basics.email = ""
    content.basics.phone = ""
    content.basics.whatsapp = ""
    content.basics.address = ""
    const socials = content.sections.find(
      (section) => section.type === "socials"
    )
    if (socials?.type !== "socials") {
      throw new Error("Sample content needs a socials section.")
    }
    socials.items = []
    const contact = content.sections.find(
      (section) => section.type === "contact"
    )
    if (contact?.type !== "contact") {
      throw new Error("Sample content needs a contact section.")
    }
    contact.links = []

    const issues = validateForPublish(content)
    expect(
      issues.some((issue) =>
        issue.message.includes("so visitors can reach you")
      )
    ).toBe(true)
  })

  it("accepts the sample content", () => {
    expect(validateForPublish(createSampleContent())).toEqual([])
  })

  it("does not block publishing a mission with only an intro", () => {
    const content = createSampleContent()
    const mission = content.sections.find(
      (section) => section.type === "mission"
    )
    if (mission?.type !== "mission") {
      throw new Error("Sample content needs a mission section.")
    }
    mission.items = []
    mission.intro = "Our mission in one line."

    expect(validateForPublish(content)).toEqual([])
  })

  it("allows a promise with only a description", () => {
    const content = createSampleContent()
    const mission = content.sections.find(
      (section) => section.type === "mission"
    )
    if (mission?.type !== "mission") {
      throw new Error("Sample content needs a mission section.")
    }
    mission.items = [
      {
        id: crypto.randomUUID(),
        title: "",
        text: "We listen before we recommend anything.",
      },
    ]

    expect(validateForPublish(content)).toEqual([])
  })

  it("nudges an owner who named a location but never picked a pin", () => {
    const content = createSampleContent()
    const location = content.sections.find(
      (section) => section.type === "location"
    )
    if (location?.type !== "location") {
      throw new Error("Sample content needs a location section.")
    }
    location.query = ""
    location.latitude = null
    location.longitude = null

    const issues = validateForPublish(content)
    expect(
      issues.some((issue) => issue.message.includes("Choose a location"))
    ).toBe(true)

    // An entirely empty map section is hidden, so it must not block publishing.
    location.label = ""
    location.intro = ""
    const after = validateForPublish(content)
    expect(
      after.some((issue) => issue.message.includes("Choose a location"))
    ).toBe(false)
  })
})

describe("publish checklist", () => {
  it("reports progress and completes for filled content", () => {
    const checklist = publishChecklist(createSampleContent())
    expect(checklistProgress(checklist)).toBe(100)
    expect(checklistProgress([])).toBe(0)
  })
})
