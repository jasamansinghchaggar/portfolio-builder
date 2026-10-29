import type { PortfolioContent, Section } from "./schemas"
import type { SectionType } from "./types"

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
    case "mission":
      return section.title || "Mission"
    case "services":
      return section.title || "Services"
    case "events":
      return section.title || "Events"
    case "products":
      return section.title || "Products"
    case "gallery":
      return section.title || "Gallery"
    case "videos":
      return section.title || "Videos"
    case "payment":
      return section.title || "Payments"
    case "socials":
      return section.title || "Social links"
    case "contact":
      return section.title || "Contact"
    case "qr":
      return section.title || "QR codes"
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
    case "testimonials":
      return section.title || "Testimonials"
    case "achievements":
      return section.title || "Achievements"
    case "resume":
      return section.title || "Resume"
  }
}

export function sectionHasSubstance(section: Section): boolean {
  switch (section.type) {
    case "hero":
      // The hero always renders the business identity from page details.
      return true
    case "about":
      return Boolean(section.body || section.message || section.highlights.length)
    case "mission":
      return section.items.some((item) => item.title || item.text)
    case "services":
      return section.items.some((item) => item.title) || Boolean(section.ctaText)
    case "events":
      return section.items.some((item) => item.title || item.text)
    case "products":
      return section.items.some((item) => item.title || item.imageMediaId)
    case "gallery":
      return section.items.some((item) => item.imageMediaId || item.title)
    case "videos":
      return section.items.some((item) => item.youtubeId)
    case "payment":
      return Boolean(section.upiId || section.qrMediaId)
    case "socials":
      return section.items.some((item) => item.url)
    case "contact":
      // Always renders the contact card and enquiry form.
      return true
    case "qr":
      // Always renders the portfolio link QR; other codes are optional.
      return true
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
    case "testimonials":
      return section.items.some((item) => item.quote)
    case "achievements":
      return section.items.some((item) => item.title)
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

export function contactSection(content: PortfolioContent) {
  const section = content.sections.find((item) => item.type === "contact")
  return section?.type === "contact" ? section : null
}

export function businessName(content: PortfolioContent) {
  return (
    content.basics.businessName.trim() ||
    content.basics.fullName.trim() ||
    "Your business"
  )
}

export function ownerName(content: PortfolioContent) {
  return (
    content.basics.ownerName.trim() ||
    content.basics.fullName.trim() ||
    businessName(content)
  )
}

export function contactPhone(content: PortfolioContent) {
  const contact = contactSection(content)
  return (
    content.basics.phone.trim() ||
    content.basics.whatsapp.trim() ||
    contact?.phone.trim() ||
    ""
  )
}

export function contactEmail(content: PortfolioContent) {
  const contact = contactSection(content)
  return content.basics.email.trim() || contact?.email.trim() || ""
}

export function contactAddress(content: PortfolioContent) {
  const contact = contactSection(content)
  return content.basics.address.trim() || contact?.address.trim() || ""
}

/**
 * Phone fields ask for a bare 10-digit local number. Links still need a
 * country code, so add the default one when none was supplied.
 */
const DEFAULT_DIAL_CODE = "91"

function withDialCode(digits: string) {
  if (digits.length !== 10) return digits
  return `${DEFAULT_DIAL_CODE}${digits}`
}

export function whatsappNumber(content: PortfolioContent) {
  const contact = contactSection(content)
  const raw =
    content.basics.whatsapp.trim() ||
    content.basics.phone.trim() ||
    contact?.whatsapp.trim() ||
    contact?.phone.trim() ||
    ""
  return withDialCode(raw.replace(/[^\d]/g, ""))
}

export function whatsappHref(content: PortfolioContent, message?: string) {
  const number = whatsappNumber(content)
  if (!number) return null
  const text = message?.trim()
  return text
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${number}`
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
  if (!cleaned) return null
  const digits = cleaned.replace(/\D/g, "")
  const normalized = cleaned.startsWith("+") ? digits : withDialCode(digits)
  return `tel:+${normalized}`
}

/** Accepts a bare YouTube id or any common YouTube URL. */
export function youtubeId(value: string): string | null {
  const input = value.trim()
  if (!input) return null
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input
  const match =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(
      input
    )
  return match?.[1] ?? null
}

export function socialIconKey(platform: string) {
  const key = platform.trim().toLowerCase()
  if (key.includes("instagram")) return "instagram"
  if (key.includes("facebook")) return "facebook"
  if (key.includes("whatsapp")) return "whatsapp"
  if (key.includes("linkedin")) return "linkedin"
  if (key.includes("youtube")) return "youtube"
  if (key.includes("x") || key.includes("twitter")) return "twitter"
  return "globe"
}
