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
  it("requires a name and some visible substance", () => {
    const content = createSampleContent()
    content.basics.fullName = ""
    content.sections = content.sections.map((section) => ({
      ...section,
      visible: false,
    }))

    const issues = validateForPublish(content)
    expect(issues.some((issue) => issue.path === "basics.fullName")).toBe(true)
    expect(issues.some((issue) => issue.message.includes("at least one section"))).toBe(
      true
    )
  })

  it("flags empty contact details", () => {
    const content = createSampleContent()
    const contact = content.sections.find(
      (section) => section.type === "contact"
    )
    if (contact?.type !== "contact") {
      throw new Error("Sample content needs a contact section.")
    }
    contact.email = ""
    contact.links = []

    const issues = validateForPublish(content)
    expect(
      issues.some((issue) => issue.message.includes("email address or at least one contact link"))
    ).toBe(true)
  })

  it("accepts the sample content", () => {
    expect(validateForPublish(createSampleContent())).toEqual([])
  })
})

describe("publish checklist", () => {
  it("reports progress and completes for filled content", () => {
    const checklist = publishChecklist(createSampleContent())
    expect(checklistProgress(checklist)).toBe(100)
    expect(checklistProgress([])).toBe(0)
  })
})
