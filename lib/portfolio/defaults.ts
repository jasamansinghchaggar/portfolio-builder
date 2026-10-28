import type { SectionType, TemplateId } from "./constants"
import {
  portfolioContentSchema,
  type Basics,
  type CertificationItem,
  type ContactLink,
  type EducationItem,
  type EventItem,
  type ExperienceItem,
  type GalleryItem,
  type MissionItem,
  type PortfolioContent,
  type ProductItem,
  type ProjectItem,
  type Section,
  type ServiceItem,
  type SkillGroup,
  type SocialItem,
  type TestimonialItem,
  type VideoItem,
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

export function createMissionItem(): MissionItem {
  return {
    id: newId(),
    title: "",
    text: "",
  }
}

export function createEventItem(): EventItem {
  return {
    id: newId(),
    title: "",
    theme: "",
    text: "",
    meta: [],
    list: [],
    quote: "",
  }
}

export function createProductItem(): ProductItem {
  return {
    id: newId(),
    title: "",
    description: "",
    price: "",
    imageMediaId: null,
    url: "",
  }
}

export function createGalleryItem(): GalleryItem {
  return {
    id: newId(),
    title: "",
    caption: "",
    imageMediaId: null,
  }
}

export function createVideoItem(): VideoItem {
  return {
    id: newId(),
    title: "",
    youtubeId: "",
  }
}

export function createSocialItem(): SocialItem {
  return {
    id: newId(),
    platform: "Instagram",
    url: "",
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
        tag: "",
        messageTitle: "",
        message: "",
      }
    case "mission":
      return {
        ...base,
        type: "mission",
        title: "Our mission",
        intro: "",
        items: [],
      }
    case "services":
      return {
        ...base,
        type: "services",
        title: "Services",
        intro: "",
        items: [],
        ctaText: "",
        ctaLabel: "Get in touch",
        ctaUrl: "",
      }
    case "events":
      return {
        ...base,
        type: "events",
        title: "Events & announcements",
        intro: "",
        items: [],
      }
    case "products":
      return {
        ...base,
        type: "products",
        title: "Products",
        intro: "",
        items: [],
      }
    case "gallery":
      return {
        ...base,
        type: "gallery",
        title: "Gallery",
        intro: "",
        items: [],
      }
    case "videos":
      return {
        ...base,
        type: "videos",
        title: "Videos",
        intro: "",
        items: [],
      }
    case "payment":
      return {
        ...base,
        type: "payment",
        title: "Payments",
        subtitle: "",
        heading: "",
        upiId: "",
        payeeName: "",
        qrMediaId: null,
      }
    case "socials":
      return {
        ...base,
        type: "socials",
        title: "Follow us",
        intro: "",
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
        subtitle: "",
        whatsapp: "",
        address: "",
        formTitle: "Send us a message",
        formNote: "",
      }
    case "qr":
      return {
        ...base,
        type: "qr",
        title: "Scan and connect",
        intro: "",
        websiteUrl: "",
        whatsappUrl: "",
        instagramUrl: "",
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
    businessName: fullName,
    ownerName: fullName,
    role: "",
    tagline: "",
    whatsapp: "",
    website: "",
    address: "",
    heroMediaId: null,
    logoMediaId: null,
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
  const businessName = name || "Your business"
  const hero = createSection("hero")
  const about = createSection("about")
  const mission = createSection("mission")
  const services = createSection("services")
  const gallery = createSection("gallery")
  const contact = createSection("contact")
  const qr = createSection("qr")

  if (hero.type === "hero") {
    hero.eyebrow = headline.trim()
    hero.headline = businessName
    hero.subheadline = ""
    hero.bio = ""
    hero.location = location.trim()
    hero.primaryCtaLabel = "Chat on WhatsApp"
    hero.secondaryCtaLabel = "Book an appointment"
    hero.secondaryCtaUrl = "#section-contact"
  }
  if (about.type === "about") {
    about.title = "About"
    about.tag = "Our story"
    about.body = ""
  }
  if (mission.type === "mission") {
    mission.title = "Our mission"
    mission.items = [createMissionItem(), createMissionItem(), createMissionItem()]
  }
  if (services.type === "services") {
    services.title = "How we can help"
    services.ctaText =
      "Tell us what you need. We will reply with a clear plan and next steps."
  }
  if (gallery.type === "gallery") {
    gallery.title = "Our work"
  }
  if (contact.type === "contact") {
    contact.title = "Get in touch"
    contact.subtitle = "We usually reply within one working day."
    contact.email = email.trim()
    contact.location = location.trim()
    contact.message = ""
  }
  if (qr.type === "qr") {
    qr.title = "Scan and connect"
    qr.intro = "Save our website, WhatsApp, and social links with a single scan."
  }

  return {
    version: 2,
    templateId: "studio",
    basics: {
      fullName: name,
      headline: headline.trim(),
      location: location.trim(),
      email: email.trim(),
      phone: "",
      avatarMediaId: null,
      businessName,
      ownerName: name,
      role: headline.trim() || (firstName ? `${firstName}'s business` : ""),
      tagline: "",
      whatsapp: "",
      website: "",
      address: "",
      heroMediaId: null,
      logoMediaId: null,
    },
    design: templateDesign(templateId),
    sections: [hero, about, mission, services, gallery, contact, qr],
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
  return (
    content.basics.businessName.trim() ||
    content.basics.fullName.trim() ||
    "Your business"
  )
}

export function templateDefaults(templateId: TemplateId) {
  return {
    design: templateDesign(templateId),
    template: getTemplate(templateId),
  }
}
