export const TEMPLATE_IDS = ["atlas", "signal", "mono", "bloom"] as const
export type TemplateId = (typeof TEMPLATE_IDS)[number]

export const SECTION_TYPES = [
  "hero",
  "about",
  "projects",
  "experience",
  "skills",
  "education",
  "certifications",
  "services",
  "testimonials",
  "achievements",
  "contact",
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
  projects: "Projects",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
  certifications: "Certifications",
  services: "Services",
  testimonials: "Testimonials",
  achievements: "Achievements",
  contact: "Contact",
  resume: "Resume / CV",
}

export const SECTION_DESCRIPTIONS: Record<SectionType, string> = {
  hero: "The first thing visitors see. Introduce yourself and set the tone.",
  about: "A short story about who you are and what you care about.",
  projects: "Selected work with links, images, and outcomes.",
  experience: "Roles, responsibilities, and career highlights.",
  skills: "Tools, disciplines, and areas of expertise.",
  education: "Degrees, programs, and academic background.",
  certifications: "Credentials and professional qualifications.",
  services: "What you offer and who you help.",
  testimonials: "Kind words from clients, collaborators, or managers.",
  achievements: "Awards, speaking, publications, and milestones.",
  contact: "An invitation to get in touch, with your preferred links.",
  resume: "A downloadable CV and a concise career summary.",
}

export const NAV_SECTION_ORDER: SectionType[] = [
  "about",
  "projects",
  "experience",
  "skills",
  "education",
  "certifications",
  "services",
  "testimonials",
  "achievements",
  "resume",
  "contact",
]
