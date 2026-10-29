import type { PortfolioContent } from "./schemas"
import { sectionHasSubstance, sectionLabel, visibleSections } from "./sections"

export type PublishIssue = {
  message: string
  path: string
  sectionId?: string
  sectionLabel?: string
}

export type PublishChecklistItem = {
  label: string
  hint: string
  done: boolean
}

export type PublishSnapshot = {
  published: PortfolioContent
  mediaIds: string[]
}

export function validateForPublish(content: PortfolioContent): PublishIssue[] {
  const issues: PublishIssue[] = []

  if (!content.basics.fullName.trim() && !content.basics.businessName.trim()) {
    issues.push({
      message: "Add your business name before publishing.",
      path: "basics.fullName",
    })
  }

  const visible = visibleSections(content.sections)
  if (!visible.length) {
    issues.push({
      message: "Keep at least one section visible before publishing.",
      path: "sections",
    })
  }

  if (!visible.some(sectionHasSubstance)) {
    issues.push({
      message: "Add some content to at least one visible section.",
      path: "sections",
    })
  }

  for (const section of visible) {
    const issue = (
      message: string,
      field: string,
      extra?: Partial<PublishIssue>
    ) => {
      issues.push({
        message,
        path: `sections.${section.type}.${field}`,
        sectionId: section.id,
        sectionLabel: sectionLabel(section),
        ...extra,
      })
    }

    switch (section.type) {
      case "hero":
        break
      case "about":
        // An empty About section is hidden from the public page, so it does not
        // need to block publishing.
        break
      case "mission":
        section.items.forEach((item, index) => {
          if ((item.text.trim() || item.title.trim()) && !item.title.trim()) {
            issue(`Mission card ${index + 1} needs a title.`, `items.${index}.title`)
          }
        })
        break
      case "services": {
        section.items.forEach((item, index) => {
          if (
            (item.title.trim() || item.description.trim()) &&
            !item.title.trim()
          ) {
            issue(`Service ${index + 1} needs a title.`, `items.${index}.title`)
          }
        })
        break
      }
      case "events": {
        section.items.forEach((item, index) => {
          if (
            (item.theme.trim() || item.text.trim() || item.title.trim()) &&
            !item.title.trim()
          ) {
            issue(`Event ${index + 1} needs a title.`, `items.${index}.title`)
          }
        })
        break
      }
      case "products": {
        section.items.forEach((item, index) => {
          if (
            (item.description.trim() ||
              item.price.trim() ||
              item.imageMediaId) &&
            !item.title.trim()
          ) {
            issue(`Product ${index + 1} needs a name.`, `items.${index}.title`)
          }
        })
        break
      }
      case "gallery": {
        section.items.forEach((item, index) => {
          if (
            (item.caption.trim() || item.imageMediaId) &&
            !item.title.trim()
          ) {
            issue(
              `Gallery item ${index + 1} needs a title or caption.`,
              `items.${index}.title`
            )
          }
        })
        break
      }
      case "videos": {
        section.items.forEach((item, index) => {
          if (
            (item.title.trim() || item.youtubeId.trim()) &&
            !item.youtubeId.trim()
          ) {
            issue(
              `Video ${index + 1} needs a YouTube link or ID.`,
              `items.${index}.youtubeId`
            )
          }
        })
        break
      }
      case "payment":
        break
      case "socials": {
        section.items.forEach((item, index) => {
          if (
            (item.platform.trim() || item.url.trim()) &&
            !item.url.trim()
          ) {
            issue(
              `Social link ${index + 1} needs a full URL.`,
              `items.${index}.url`
            )
          }
        })
        break
      }
      case "contact": {
        // Contact details are entered once in page details; legacy contact
        // links still count for old drafts that have no socials section.
        const hasSocials = visible.some(
          (item) =>
            item.type === "socials" &&
            item.items.some((profile) => profile.url.trim())
        )
        if (
          !content.basics.email.trim() &&
          !content.basics.phone.trim() &&
          !content.basics.whatsapp.trim() &&
          !content.basics.address.trim() &&
          !hasSocials &&
          !section.links.some((link) => link.url.trim())
        ) {
          issue(
            "Add an email, phone number, WhatsApp number, or social profile so visitors can reach you.",
            "email"
          )
        }
        break
      }
      case "qr":
        break
      case "projects": {
        if (!section.items.length) {
          issue("Add at least one project, or hide this section.", "items")
          break
        }
        section.items.forEach((item, index) => {
          if (!item.title.trim()) {
            issue(
              `Project ${index + 1} needs a title.`,
              `items.${index}.title`
            )
          }
        })
        break
      }
      case "experience": {
        if (!section.items.length) {
          issue("Add at least one role, or hide this section.", "items")
          break
        }
        section.items.forEach((item, index) => {
          if (!item.role.trim() || !item.company.trim()) {
            issue(
              `Role ${index + 1} needs both a role and a company.`,
              `items.${index}.role`
            )
          }
        })
        break
      }
      case "skills": {
        if (!section.groups.length) {
          issue("Add at least one skill group, or hide this section.", "groups")
          break
        }
        section.groups.forEach((group, index) => {
          if (!group.name.trim() || !group.items.length) {
            issue(
              `Skill group ${index + 1} needs a name and at least one skill.`,
              `groups.${index}.name`
            )
          }
        })
        break
      }
      case "education": {
        if (!section.items.length) {
          issue("Add an education entry, or hide this section.", "items")
          break
        }
        section.items.forEach((item, index) => {
          if (!item.degree.trim() || !item.institution.trim()) {
            issue(
              `Education entry ${index + 1} needs a qualification and institution.`,
              `items.${index}.degree`
            )
          }
        })
        break
      }
      case "certifications": {
        if (!section.items.length) {
          issue("Add a certification, or hide this section.", "items")
          break
        }
        section.items.forEach((item, index) => {
          if (!item.name.trim()) {
            issue(
              `Certification ${index + 1} needs a name.`,
              `items.${index}.name`
            )
          }
        })
        break
      }
      case "testimonials": {
        if (!section.items.length) {
          issue("Add a testimonial, or hide this section.", "items")
          break
        }
        section.items.forEach((item, index) => {
          if (!item.quote.trim() || !item.name.trim()) {
            issue(
              `Testimonial ${index + 1} needs a quote and an author.`,
              `items.${index}.quote`
            )
          }
        })
        break
      }
      case "achievements": {
        if (!section.items.length) {
          issue("Add an achievement, or hide this section.", "items")
          break
        }
        section.items.forEach((item, index) => {
          if (!item.title.trim()) {
            issue(
              `Achievement ${index + 1} needs a title.`,
              `items.${index}.title`
            )
          }
        })
        break
      }
      case "resume": {
        if (!section.summary.trim() && !section.fileMediaId) {
          issue(
            "Add a CV summary or upload a file, or hide this section.",
            "summary"
          )
        }
        break
      }
    }
  }

  return issues
}

/** Builds the immutable published snapshot. Hidden sections stay draft-only. */
export function buildPublishedContent(content: PortfolioContent): PortfolioContent {
  return {
    ...content,
    templateId: "studio",
    sections: content.sections.filter((section) => section.visible),
  }
}

export function collectPublishedMediaIds(content: PortfolioContent): string[] {
  const ids = new Set<string>()
  if (content.basics.avatarMediaId) ids.add(content.basics.avatarMediaId)
  if (content.basics.heroMediaId) ids.add(content.basics.heroMediaId)
  if (content.basics.logoMediaId) ids.add(content.basics.logoMediaId)

  for (const section of content.sections) {
    if (!section.visible) continue
    switch (section.type) {
      case "hero":
        if (section.imageMediaId) ids.add(section.imageMediaId)
        break
      case "projects":
        section.items.forEach((item) => {
          if (item.imageMediaId) ids.add(item.imageMediaId)
        })
        break
      case "products":
        section.items.forEach((item) => {
          if (item.imageMediaId) ids.add(item.imageMediaId)
        })
        break
      case "gallery":
        section.items.forEach((item) => {
          if (item.imageMediaId) ids.add(item.imageMediaId)
        })
        break
      case "payment":
        if (section.qrMediaId) ids.add(section.qrMediaId)
        break
      case "testimonials":
        section.items.forEach((item) => {
          if (item.avatarMediaId) ids.add(item.avatarMediaId)
        })
        break
      case "resume":
        if (section.fileMediaId) ids.add(section.fileMediaId)
        break
      default:
        break
    }
  }

  return [...ids]
}

export function buildPublishSnapshot(
  content: PortfolioContent
): { issues: PublishIssue[]; snapshot: PublishSnapshot } {
  const issues = validateForPublish(content)
  const published = buildPublishedContent(content)
  return {
    issues,
    snapshot: {
      published,
      mediaIds: collectPublishedMediaIds(published),
    },
  }
}

export function publishChecklist(
  content: PortfolioContent
): PublishChecklistItem[] {
  const visible = visibleSections(content.sections)
  const hasAbout = visible.some(
    (section) =>
      section.type === "about" &&
      Boolean(section.body.trim() || section.message.trim())
  )
  const hasOffer = visible.some(
    (section) =>
      (section.type === "services" &&
        section.items.some((item) => item.title.trim())) ||
      (section.type === "products" &&
        section.items.some((item) => item.title.trim())) ||
      (section.type === "projects" &&
        section.items.some((item) => item.title.trim()))
  )
  const hasContact =
    Boolean(
      content.basics.email.trim() ||
        content.basics.phone.trim() ||
        content.basics.whatsapp.trim() ||
        content.basics.address.trim()
    ) ||
    visible.some(
      (section) =>
        section.type === "socials" &&
        section.items.some((item) => item.url.trim())
    )
  const hasHero = Boolean(
    content.basics.headline.trim() ||
      content.basics.role.trim() ||
      content.basics.tagline.trim()
  )

  return [
    {
      label: "Add your business name",
      hint: "Shown in the header, page title, and browser tab.",
      done: Boolean(
        content.basics.businessName.trim() ||
          content.basics.fullName.trim()
      ),
    },
    {
      label: "Introduce your business",
      hint: "A headline and short introduction make the first screen feel complete.",
      done: hasHero,
    },
    {
      label: "Tell your story",
      hint: "An About section gives visitors context before they get in touch.",
      done: hasAbout,
    },
    {
      label: "Show what you offer",
      hint: "Add a service, product, or project with a title.",
      done: hasOffer,
    },
    {
      label: "Give people a way to reach you",
      hint: "Add an email or phone number in Page details.",
      done: hasContact,
    },
  ]
}

export function checklistProgress(items: PublishChecklistItem[]) {
  if (!items.length) return 0
  return Math.round(
    (items.filter((item) => item.done).length / items.length) * 100
  )
}

export function publishIssueSummary(issues: PublishIssue[]) {
  if (!issues.length) return ""
  if (issues.length === 1) return issues[0].message
  return `${issues[0].message} (+${issues.length - 1} more)`
}
