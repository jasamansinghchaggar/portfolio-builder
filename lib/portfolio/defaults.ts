import type { SectionType, TemplateId } from "./constants"
import {
  portfolioContentSchema,
  type Basics,
  type CertificationItem,
  type ContactLink,
  type EducationItem,
  type ExperienceItem,
  type PortfolioContent,
  type ProjectItem,
  type Section,
  type ServiceItem,
  type SkillGroup,
  type TestimonialItem,
  type AchievementItem,
} from "./schemas"
import { getTemplate, templateDesign, DEFAULT_TEMPLATE_ID } from "./templates"

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  throw new Error("A secure random source is required to create content IDs.")
}

export function createProjectItem(): ProjectItem {
  return {
    id: newId(),
    title: "",
    description: "",
    tags: [],
    url: "",
    repoUrl: "",
    imageMediaId: null,
    featured: false,
    year: "",
  }
}

export function createExperienceItem(): ExperienceItem {
  return {
    id: newId(),
    role: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    highlights: [],
  }
}

export function createEducationItem(): EducationItem {
  return {
    id: newId(),
    degree: "",
    institution: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  }
}

export function createCertificationItem(): CertificationItem {
  return {
    id: newId(),
    name: "",
    issuer: "",
    issueDate: "",
    credentialUrl: "",
  }
}

export function createServiceItem(): ServiceItem {
  return {
    id: newId(),
    title: "",
    description: "",
  }
}

export function createTestimonialItem(): TestimonialItem {
  return {
    id: newId(),
    quote: "",
    name: "",
    role: "",
    company: "",
    avatarMediaId: null,
  }
}

export function createAchievementItem(): AchievementItem {
  return {
    id: newId(),
    title: "",
    issuer: "",
    date: "",
    description: "",
  }
}

export function createContactLink(): ContactLink {
  return {
    id: newId(),
    label: "",
    url: "",
  }
}

export function createSkillGroup(): SkillGroup {
  return {
    id: newId(),
    name: "",
    items: [],
  }
}

export function createSection(type: SectionType): Section {
  const base = { id: newId(), visible: true }

  switch (type) {
    case "hero":
      return {
        ...base,
        type: "hero",
        eyebrow: "",
        headline: "",
        subheadline: "",
        bio: "",
        location: "",
        availability: "",
        primaryCtaLabel: "",
        primaryCtaUrl: "",
        secondaryCtaLabel: "",
        secondaryCtaUrl: "",
        imageMediaId: null,
      }
    case "about":
      return {
        ...base,
        type: "about",
        title: "About",
        body: "",
        highlights: [],
      }
    case "projects":
      return {
        ...base,
        type: "projects",
        title: "Selected work",
        intro: "",
        items: [],
      }
    case "experience":
      return {
        ...base,
        type: "experience",
        title: "Experience",
        items: [],
      }
    case "skills":
      return {
        ...base,
        type: "skills",
        title: "Skills",
        intro: "",
        groups: [],
      }
    case "education":
      return {
        ...base,
        type: "education",
        title: "Education",
        items: [],
      }
    case "certifications":
      return {
        ...base,
        type: "certifications",
        title: "Certifications",
        items: [],
      }
    case "services":
      return {
        ...base,
        type: "services",
        title: "Services",
        intro: "",
        items: [],
      }
    case "testimonials":
      return {
        ...base,
        type: "testimonials",
        title: "Kind words",
        items: [],
      }
    case "achievements":
      return {
        ...base,
        type: "achievements",
        title: "Achievements",
        items: [],
      }
    case "contact":
      return {
        ...base,
        type: "contact",
        title: "Let's work together",
        message: "",
        email: "",
        phone: "",
        location: "",
        links: [],
      }
    case "resume":
      return {
        ...base,
        type: "resume",
        title: "Resume",
        summary: "",
        fileMediaId: null,
        highlights: [],
      }
  }
}

export function emptyBasics(fullName = ""): Basics {
  return {
    fullName,
    headline: "",
    location: "",
    email: "",
    phone: "",
    avatarMediaId: null,
  }
}

export type DefaultContentInput = {
  fullName: string
  headline?: string
  email?: string
  location?: string
  templateId?: TemplateId
}

export function createDefaultContent({
  fullName,
  headline = "",
  email = "",
  location = "",
  templateId = DEFAULT_TEMPLATE_ID,
}: DefaultContentInput): PortfolioContent {
  const name = fullName.trim()
  const firstName = name.split(/\s+/)[0] || name
  const hero = createSection("hero")
  const about = createSection("about")
  const projects = createSection("projects")
  const experience = createSection("experience")
  const skills = createSection("skills")
  const contact = createSection("contact")

  if (hero.type === "hero") {
    hero.headline = headline.trim() || `Hi, I'm ${firstName}.`
    hero.location = location.trim()
  }
  if (about.type === "about") {
    about.body = ""
  }
  if (projects.type === "projects") {
    projects.items = [createProjectItem()]
  }
  if (experience.type === "experience") {
    experience.items = [createExperienceItem()]
  }
  if (skills.type === "skills") {
    skills.groups = [createSkillGroup()]
  }
  if (contact.type === "contact") {
    contact.email = email.trim()
    contact.location = location.trim()
  }

  return {
    version: 1,
    templateId,
    basics: {
      fullName: name,
      headline: headline.trim(),
      location: location.trim(),
      email: email.trim(),
      phone: "",
      avatarMediaId: null,
    },
    design: templateDesign(templateId),
    sections: [hero, about, projects, experience, skills, contact],
  }
}

export function cloneContent(content: PortfolioContent): PortfolioContent {
  return structuredClone(content)
}

export function parsePortfolioContent(value: unknown) {
  return portfolioContentSchema.safeParse(value)
}

export function coercePortfolioContent(
  value: unknown,
  fallback: DefaultContentInput
): PortfolioContent {
  const parsed = portfolioContentSchema.safeParse(value)
  if (parsed.success) return parsed.data
  return createDefaultContent(fallback)
}

export function displayName(content: PortfolioContent) {
  return content.basics.fullName.trim() || "Your name"
}

export function templateDefaults(templateId: TemplateId) {
  return {
    design: templateDesign(templateId),
    template: getTemplate(templateId),
  }
}
