/** Every template id ever used. Legacy ids stay valid so old drafts keep parsing. */
export const TEMPLATE_IDS = [
  "studio",
  "atlas",
  "signal",
  "mono",
  "bloom",
] as const
export type TemplateId = (typeof TEMPLATE_IDS)[number]

/** Templates that are shown in the product UI. */
export const VISIBLE_TEMPLATE_IDS = ["studio"] as const
export type VisibleTemplateId = (typeof VISIBLE_TEMPLATE_IDS)[number]

export function isVisibleTemplate(id: TemplateId): id is VisibleTemplateId {
  return (VISIBLE_TEMPLATE_IDS as readonly string[]).includes(id)
}

export const SECTION_TYPES = [
  "hero",
  "about",
  "mission",
  "services",
  "events",
  "products",
  "gallery",
  "videos",
  "payment",
  "socials",
  "contact",
  "qr",
  "projects",
  "experience",
  "skills",
  "education",
  "certifications",
  "testimonials",
  "achievements",
  "resume",
] as const
export type SectionType = (typeof SECTION_TYPES)[number]

export const FONT_PAIRS = [
  "modern",
  "editorial",
  "classic",
  "technical",
] as const
export type FontPair = (typeof FONT_PAIRS)[number]

export const APPEARANCES = ["light", "dark"] as const
export type Appearance = (typeof APPEARANCES)[number]

export const CORNER_STYLES = ["sharp", "soft", "round"] as const
export type CornerStyle = (typeof CORNER_STYLES)[number]

export const BACKDROPS = ["clean", "grid", "glow"] as const
export type Backdrop = (typeof BACKDROPS)[number]

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  about: "About",
  mission: "Mission",
  services: "Services",
  events: "Events",
  products: "Products",
  gallery: "Gallery",
  videos: "Videos",
  payment: "Payments",
  socials: "Social links",
  contact: "Contact",
  qr: "QR codes",
  projects: "Projects",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
  certifications: "Certifications",
  testimonials: "Testimonials",
  achievements: "Achievements",
  resume: "Resume / CV",
}

export const SECTION_DESCRIPTIONS: Record<SectionType, string> = {
  hero: "The first thing visitors see. Introduce your business and set the tone.",
  about: "Your story, the people behind the business, and what you stand for.",
  mission: "The promise you make to every customer, in three short cards.",
  services: "What you offer, who you help, and how to start working together.",
  events: "Announcements, offers, seasonal updates, or upcoming events.",
  products: "Items or packages with photos, short descriptions, and prices.",
  gallery: "Photos of your work, your space, or your team.",
  videos: "YouTube videos embedded on your page.",
  payment: "Show a UPI ID or an uploaded payment QR code for easy checkout.",
  socials: "Instagram, Facebook, and other profiles visitors can follow.",
  contact: "Phone, WhatsApp, email, address, and a working enquiry form.",
  qr: "Shareable QR codes for your website, WhatsApp, and Instagram.",
  projects: "Case studies and selected work with links and images.",
  experience: "Roles, responsibilities, and career highlights.",
  skills: "Tools, disciplines, and areas of expertise.",
  education: "Degrees, programs, and academic background.",
  certifications: "Credentials and professional qualifications.",
  testimonials: "Kind words from clients, collaborators, or managers.",
  achievements: "Awards, speaking, publications, and milestones.",
  resume: "A downloadable CV and a concise career summary.",
}

export const NAV_SECTION_ORDER: SectionType[] = [
  "about",
  "mission",
  "services",
  "events",
  "products",
  "gallery",
  "videos",
  "testimonials",
  "projects",
  "experience",
  "skills",
  "education",
  "certifications",
  "achievements",
  "payment",
  "socials",
  "resume",
  "contact",
  "qr",
]

/** The default section set for a brand-new business portfolio. */
export const DEFAULT_SECTION_TYPES: SectionType[] = [
  "hero",
  "about",
  "mission",
  "services",
  "gallery",
  "contact",
  "qr",
]
