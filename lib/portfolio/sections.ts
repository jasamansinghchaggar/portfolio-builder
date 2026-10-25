import type { Section, SectionType } from "./types"

export function sectionAnchor(type: SectionType) {
  return `section-${type}`
}

export function visibleSections(sections: Section[]) {
  return sections.filter((section) => section.visible)
}

export function sectionLabel(section: Section) {
  switch (section.type) {
    case "hero":
      return "Hero"
    case "about":
      return section.title || "About"
    case "projects":
      return section.title || "Projects"
    case "experience":
      return section.title || "Experience"
    case "skills":
      return section.title || "Skills"
    case "education":
      return section.title || "Education"
    case "certifications":
      return section.title || "Certifications"
    case "services":
      return section.title || "Services"
    case "testimonials":
      return section.title || "Testimonials"
    case "achievements":
      return section.title || "Achievements"
    case "contact":
      return section.title || "Contact"
    case "resume":
      return section.title || "Resume"
  }
}

export function sectionHasSubstance(section: Section): boolean {
  switch (section.type) {
    case "hero":
      return Boolean(
        section.headline || section.subheadline || section.bio || section.eyebrow
      )
    case "about":
      return Boolean(section.body)
    case "projects":
      return section.items.some((item) => item.title)
    case "experience":
      return section.items.some((item) => item.role || item.company)
    case "skills":
      return section.groups.some((group) => group.name || group.items.length)
    case "education":
      return section.items.some((item) => item.degree || item.institution)
    case "certifications":
      return section.items.some((item) => item.name)
    case "services":
      return section.items.some((item) => item.title)
    case "testimonials":
      return section.items.some((item) => item.quote)
    case "achievements":
      return section.items.some((item) => item.title)
    case "contact":
      return Boolean(
        section.email || section.message || section.links.length || section.phone
      )
    case "resume":
      return Boolean(section.summary || section.fileMediaId)
  }
}

export function navigationSections(sections: Section[]) {
  return visibleSections(sections).filter(
    (section) => section.type !== "hero" && sectionHasSubstance(section)
  )
}

/** Sections shown in the public page, in the author's order. */
export function renderedSections(sections: Section[]) {
  return visibleSections(sections).filter(
    (section) => section.type === "hero" || sectionHasSubstance(section)
  )
}

export function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
  if (!parts.length) return "•"
  return parts.map((part) => part[0]?.toUpperCase()).join("")
}

export function splitParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

export function formatDateRange(
  start: string,
  end: string,
  current?: boolean
): string {
  const from = start.trim()
  const to = current ? "Present" : end.trim()
  if (from && to) return `${from} — ${to}`
  return from || to
}

export function phoneHref(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, "")
  return cleaned ? `tel:${cleaned}` : null
}
