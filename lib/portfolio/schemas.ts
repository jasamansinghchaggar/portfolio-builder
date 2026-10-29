import { z } from "zod"

import {
  APPEARANCES,
  BACKDROPS,
  CORNER_STYLES,
  FONT_PAIRS,
  SECTION_TYPES,
  TEMPLATE_IDS,
} from "./constants"

export function isHttpUrl(value: string) {
  if (value === "") return true
  if (/^#[\w-]+$/.test(value)) return true
  try {
    const url = new URL(value)
    return (
      url.protocol === "http:" ||
      url.protocol === "https:" ||
      url.protocol === "mailto:" ||
      url.protocol === "tel:"
    )
  } catch {
    return false
  }
}

const optionalUrl = z
  .string()
  .trim()
  .max(2048, "Keep links under 2,048 characters.")
  .refine(isHttpUrl, "Enter a full http:// or https:// link.")

const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Enter a valid email address."
  )

const phone = z
  .string()
  .trim()
  .max(40, "Keep the number under 40 characters.")
  .refine(
    (value) =>
      value === "" ||
      (!value.includes("+") && value.replace(/\D/g, "").length === 10),
    "Enter a 10-digit number without the country code."
  )

const mediaId = z.uuid().nullable()

const shortText = z.string().trim().max(120)
const mediumText = z.string().trim().max(600)
const longText = z.string().trim().max(5000)

const stringList = (maxItems: number, maxLength: number) =>
  z.array(z.string().trim().max(maxLength)).max(maxItems)

const sectionBase = {
  id: z.uuid(),
  visible: z.boolean(),
}

const heroSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("hero"),
  /**
   * The hero reads its copy from `basics` (page details). Only a legacy image
   * override remains so old drafts keep their background image.
   */
  imageMediaId: mediaId,
})

const aboutSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("about"),
  title: z.string().trim().max(80),
  body: longText,
  highlights: stringList(12, 160).default([]),
  /** Business-template additions. */
  tag: z.string().trim().max(80).default(""),
  messageTitle: z.string().trim().max(120).default(""),
  message: mediumText.default(""),
})

const missionItemSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(120),
  text: z.string().trim().max(600),
})

const missionSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("mission"),
  title: z.string().trim().max(80),
  intro: z.string().trim().max(400),
  items: z.array(missionItemSchema).max(12),
})

const projectItemSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(120),
  description: z.string().trim().max(1200),
  tags: stringList(12, 40),
  url: optionalUrl,
  repoUrl: optionalUrl,
  imageMediaId: mediaId,
  featured: z.boolean(),
  year: z.string().trim().max(20),
})

const projectsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("projects"),
  title: z.string().trim().max(80),
  intro: z.string().trim().max(400),
  items: z.array(projectItemSchema).max(50),
})

const experienceItemSchema = z.object({
  id: z.uuid(),
  role: z.string().trim().max(120),
  company: z.string().trim().max(120),
  location: z.string().trim().max(120),
  startDate: z.string().trim().max(40),
  endDate: z.string().trim().max(40),
  current: z.boolean(),
  description: z.string().trim().max(1200),
  highlights: stringList(12, 300),
})

const experienceSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("experience"),
  title: z.string().trim().max(80),
  items: z.array(experienceItemSchema).max(50),
})

const skillGroupSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().max(80),
  items: stringList(50, 60),
})

const skillsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("skills"),
  title: z.string().trim().max(80),
  intro: z.string().trim().max(400),
  groups: z.array(skillGroupSchema).max(20),
})

const educationItemSchema = z.object({
  id: z.uuid(),
  degree: z.string().trim().max(120),
  institution: z.string().trim().max(120),
  location: z.string().trim().max(120),
  startDate: z.string().trim().max(40),
  endDate: z.string().trim().max(40),
  description: z.string().trim().max(1200),
})

const educationSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("education"),
  title: z.string().trim().max(80),
  items: z.array(educationItemSchema).max(50),
})

const certificationItemSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().max(140),
  issuer: z.string().trim().max(120),
  issueDate: z.string().trim().max(40),
  credentialUrl: optionalUrl,
})

const certificationsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("certifications"),
  title: z.string().trim().max(80),
  items: z.array(certificationItemSchema).max(50),
})

const serviceItemSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(120),
  description: z.string().trim().max(1000),
})

const servicesSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("services"),
  title: z.string().trim().max(80),
  intro: z.string().trim().max(400),
  items: z.array(serviceItemSchema).max(50),
  /** Business-template additions: the call-to-action panel below the cards. */
  ctaText: mediumText.default(""),
  ctaLabel: z.string().trim().max(40).default("Get in touch"),
  ctaUrl: optionalUrl.default(""),
})

const eventItemSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(140),
  theme: z.string().trim().max(160),
  text: z.string().trim().max(1000),
  meta: stringList(8, 60),
  list: stringList(12, 200),
  quote: z.string().trim().max(400),
})

const eventsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("events"),
  title: z.string().trim().max(80),
  intro: z.string().trim().max(400),
  items: z.array(eventItemSchema).max(30),
})

const productItemSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(140),
  description: z.string().trim().max(1000),
  price: z.string().trim().max(60),
  imageMediaId: mediaId,
  url: optionalUrl,
})

const productsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("products"),
  title: z.string().trim().max(80),
  intro: z.string().trim().max(400),
  items: z.array(productItemSchema).max(50),
})

const galleryItemSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(140),
  caption: z.string().trim().max(300),
  imageMediaId: mediaId,
})

const gallerySectionSchema = z.object({
  ...sectionBase,
  type: z.literal("gallery"),
  title: z.string().trim().max(80),
  intro: z.string().trim().max(400),
  items: z.array(galleryItemSchema).max(60),
})

const videoItemSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(140),
  youtubeId: z.string().trim().max(200),
})

const videosSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("videos"),
  title: z.string().trim().max(80),
  intro: z.string().trim().max(400),
  items: z.array(videoItemSchema).max(24),
})

const paymentSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("payment"),
  title: z.string().trim().max(80),
  subtitle: z.string().trim().max(240),
  heading: z.string().trim().max(120),
  upiId: z.string().trim().max(120),
  payeeName: z.string().trim().max(120),
  qrMediaId: mediaId,
})

const socialItemSchema = z.object({
  id: z.uuid(),
  platform: z.string().trim().max(40),
  url: optionalUrl,
})

const socialsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("socials"),
  title: z.string().trim().max(80),
  intro: z.string().trim().max(400),
  items: z.array(socialItemSchema).max(20),
})

const testimonialItemSchema = z.object({
  id: z.uuid(),
  quote: z.string().trim().max(700),
  name: z.string().trim().max(120),
  role: z.string().trim().max(120),
  company: z.string().trim().max(120),
  avatarMediaId: mediaId,
})

const testimonialsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("testimonials"),
  title: z.string().trim().max(80),
  items: z.array(testimonialItemSchema).max(50),
})

const achievementItemSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(140),
  issuer: z.string().trim().max(120),
  date: z.string().trim().max(40),
  description: z.string().trim().max(1000),
})

const achievementsSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("achievements"),
  title: z.string().trim().max(80),
  items: z.array(achievementItemSchema).max(50),
})

const contactLinkSchema = z.object({
  id: z.uuid(),
  label: z.string().trim().max(60),
  url: optionalUrl,
})

const contactSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("contact"),
  title: z.string().trim().max(80),
  message: z.string().trim().max(1200),
  email: optionalEmail,
  phone,
  location: z.string().trim().max(120),
  links: z.array(contactLinkSchema).max(20),
  /** Business-template additions. */
  subtitle: z.string().trim().max(240).default(""),
  whatsapp: z.string().trim().max(40).default(""),
  address: z.string().trim().max(240).default(""),
  formTitle: z.string().trim().max(80).default("Send us a message"),
  formNote: z.string().trim().max(240).default(""),
})

const qrSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("qr"),
  title: z.string().trim().max(80),
  intro: z.string().trim().max(400),
  /** Optional legacy overrides; otherwise links come from contact details. */
  whatsappUrl: optionalUrl,
  instagramUrl: optionalUrl,
})

const resumeSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("resume"),
  title: z.string().trim().max(80),
  summary: z.string().trim().max(1200),
  fileMediaId: mediaId,
  highlights: stringList(12, 300),
})

export const sectionSchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  aboutSectionSchema,
  missionSectionSchema,
  servicesSectionSchema,
  eventsSectionSchema,
  productsSectionSchema,
  gallerySectionSchema,
  videosSectionSchema,
  paymentSectionSchema,
  socialsSectionSchema,
  contactSectionSchema,
  qrSectionSchema,
  projectsSectionSchema,
  experienceSectionSchema,
  skillsSectionSchema,
  educationSectionSchema,
  certificationsSectionSchema,
  testimonialsSectionSchema,
  achievementsSectionSchema,
  resumeSectionSchema,
])

export const designSchema = z.object({
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Choose a six-digit hex colour.")
    .transform((value) => value.toLowerCase()),
  fontPair: z.enum(FONT_PAIRS),
  appearance: z.enum(APPEARANCES),
  corners: z.enum(CORNER_STYLES),
  backdrop: z.enum(BACKDROPS),
})

export const basicsSchema = z.object({
  fullName: z.string().trim().max(80),
  headline: z.string().trim().max(160),
  location: shortText,
  email: optionalEmail,
  phone,
  avatarMediaId: mediaId,
  /** Business-template additions. */
  businessName: z.string().trim().max(120).default(""),
  ownerName: z.string().trim().max(120).default(""),
  role: z.string().trim().max(160).default(""),
  tagline: z.string().trim().max(240).default(""),
  whatsapp: phone.default(""),
  address: z.string().trim().max(240).default(""),
  heroMediaId: mediaId.default(null),
  logoMediaId: mediaId.default(null),
})

/**
 * Content is versioned, but version 1 drafts are upgraded transparently:
 * missing fields receive defaults and the template id is rewritten to Studio.
 */
export const portfolioContentSchema = z
  .object({
    version: z
      .union([z.literal(1), z.literal(2)])
      .transform(() => 2 as const),
    templateId: z.enum(TEMPLATE_IDS).transform(() => "studio" as const),
    basics: basicsSchema,
    design: designSchema,
    sections: z.array(sectionSchema).max(SECTION_TYPES.length),
  })
  .superRefine((value, ctx) => {
    const ids = new Set<string>()
    const types = new Set<string>()

    value.sections.forEach((section, index) => {
      if (ids.has(section.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["sections", index, "id"],
          message: "Section IDs must be unique.",
        })
      }
      ids.add(section.id)

      if (types.has(section.type)) {
        ctx.addIssue({
          code: "custom",
          path: ["sections", index, "type"],
          message: "Each section type can only appear once.",
        })
      }
      types.add(section.type)
    })
  })

export type PortfolioContent = z.infer<typeof portfolioContentSchema>
export type Basics = z.infer<typeof basicsSchema>
export type DesignSettings = z.infer<typeof designSchema>
export type Section = z.infer<typeof sectionSchema>
export type SectionOfType<T extends Section["type"]> = Extract<
  Section,
  { type: T }
>
export type ProjectItem = z.infer<typeof projectItemSchema>
export type ExperienceItem = z.infer<typeof experienceItemSchema>
export type SkillGroup = z.infer<typeof skillGroupSchema>
export type EducationItem = z.infer<typeof educationItemSchema>
export type CertificationItem = z.infer<typeof certificationItemSchema>
export type ServiceItem = z.infer<typeof serviceItemSchema>
export type TestimonialItem = z.infer<typeof testimonialItemSchema>
export type AchievementItem = z.infer<typeof achievementItemSchema>
export type ContactLink = z.infer<typeof contactLinkSchema>
export type MissionItem = z.infer<typeof missionItemSchema>
export type EventItem = z.infer<typeof eventItemSchema>
export type ProductItem = z.infer<typeof productItemSchema>
export type GalleryItem = z.infer<typeof galleryItemSchema>
export type VideoItem = z.infer<typeof videoItemSchema>
export type SocialItem = z.infer<typeof socialItemSchema>

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path.length
      ? issue.path
          .map((part) =>
            typeof part === "number" ? `#${part + 1}` : String(part)
          )
          .join(" › ")
      : "Portfolio"
    return `${path}: ${issue.message}`
  })
}
