import type { PortfolioContent, Section } from "./schemas"
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

  if (!content.basics.fullName.trim()) {
    issues.push({
      message: "Add your name before publishing.",
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

  if (visible.some((section) => section.type === "hero")) {
    // Hero is optional but if present should introduce the person.
    const hero = visible.find((section) => section.type === "hero")
    if (hero && hero.type === "hero") {
      if (!hero.headline.trim() && !hero.bio.trim()) {
        issues.push({
          message: "Add a headline or short bio to your hero.",
          path: "sections.hero.headline",
          sectionId: hero.id,
          sectionLabel: "Hero",
        })
      }
      issues.push(...ctaIssues(hero))
    }
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
        if (!section.body.trim()) {
          issue("Write a few lines for your About section.", "body")
        }
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
            issue(`Certification ${index + 1} needs a name.`, `items.${index}.name`)
          }
        })
        break
      }
      case "services": {
        if (!section.items.length) {
          issue("Add a service, or hide this section.", "items")
          break
        }
        section.items.forEach((item, index) => {
          if (!item.title.trim()) {
            issue(`Service ${index + 1} needs a title.`, `items.${index}.title`)
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
      case "contact": {
        const completeLinks = section.links.filter(
          (link) => link.label.trim() && link.url.trim()
        )
        section.links.forEach((link, index) => {
          if (!link.label.trim() || !link.url.trim()) {
            issue(
              `Contact link ${index + 1} needs a label and a full URL.`,
              `links.${index}.url`
            )
          }
        })
        if (!section.email.trim() && !completeLinks.length) {
          issue(
            "Add an email address or at least one contact link.",
            "email"
          )
        }
        break
      }
      case "resume": {
        if (!section.summary.trim() && !section.fileMediaId) {
          issue("Add a CV summary or upload a file, or hide this section.", "summary")
        }
        break
      }
    }
  }

  return issues
}

function ctaIssues(section: Extract<Section, { type: "hero" }>) {
  const issues: PublishIssue[] = []
  const pairs = [
    {
      label: section.primaryCtaLabel,
      url: section.primaryCtaUrl,
      name: "primary",
    },
    {
      label: section.secondaryCtaLabel,
      url: section.secondaryCtaUrl,
      name: "secondary",
    },
  ]
  for (const pair of pairs) {
    if (pair.label.trim() && !pair.url.trim()) {
      issues.push({
        message: `The ${pair.name} button needs a destination URL.`,
        path: "sections.hero.primaryCtaUrl",
        sectionId: section.id,
        sectionLabel: "Hero",
      })
    }
    if (!pair.label.trim() && pair.url.trim()) {
      issues.push({
        message: `The ${pair.name} button needs a label.`,
        path: "sections.hero.primaryCtaLabel",
        sectionId: section.id,
        sectionLabel: "Hero",
      })
    }
  }
  return issues
}

/** Builds the immutable published snapshot. Hidden sections stay draft-only. */
export function buildPublishedContent(content: PortfolioContent): PortfolioContent {
  return {
    ...content,
    sections: content.sections.filter((section) => section.visible),
  }
}

export function collectPublishedMediaIds(content: PortfolioContent): string[] {
  const ids = new Set<string>()
  if (content.basics.avatarMediaId) ids.add(content.basics.avatarMediaId)

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

export function publishChecklist(content: PortfolioContent): PublishChecklistItem[] {
  const visible = visibleSections(content.sections)
  const hasProjects = visible.some(
    (section) => section.type === "projects" && section.items.some((item) => item.title.trim())
  )
  const hasAbout = visible.some(
    (section) => section.type === "about" && section.body.trim().length > 0
  )
  const hasContact = visible.some(
    (section) =>
      section.type === "contact" &&
      Boolean(section.email.trim() || section.links.some((link) => link.url))
  )
  const hasHero = visible.some(
    (section) =>
      section.type === "hero" &&
      Boolean(section.headline.trim() || section.bio.trim())
  )

  return [
    {
      label: "Add your name",
      hint: "Shown in the header, page title, and browser tab.",
      done: Boolean(content.basics.fullName.trim()),
    },
    {
      label: "Introduce yourself",
      hint: "A headline and short bio make the first screen feel complete.",
      done: hasHero,
    },
    {
      label: "Tell your story",
      hint: "An About section gives visitors context before the work.",
      done: hasAbout,
    },
    {
      label: "Show your work",
      hint: "Add at least one project with a title.",
      done: hasProjects,
    },
    {
      label: "Give people a way to reach you",
      hint: "Add an email or a contact link.",
      done: hasContact,
    },
  ]
}

export function checklistProgress(items: PublishChecklistItem[]) {
  if (!items.length) return 0
  return Math.round((items.filter((item) => item.done).length / items.length) * 100)
}

export function publishIssueSummary(issues: PublishIssue[]) {
  if (!issues.length) return ""
  if (issues.length === 1) return issues[0].message
  return `${issues[0].message} (+${issues.length - 1} more)`
}
