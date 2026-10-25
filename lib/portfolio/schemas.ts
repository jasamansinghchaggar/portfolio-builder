import { z } from "zod"

import {
  APPEARANCES,
  BACKDROPS,
  CORNER_STYLES,
  FONT_PAIRS,
  SECTION_TYPES,
  TEMPLATE_IDS,
} from "./constants"

function isHttpUrl(value: string) {
  if (value === "") return true
  if (/^#[\w-]+$/.test(value)) return true
  try {
    const url = new URL(value)
    return (
      url.protocol === "http:" ||
      url.protocol === "https:" ||
      url.protocol === "mailto:"
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
  eyebrow: z.string().trim().max(80),
  headline: z.string().trim().max(180),
  subheadline: z.string().trim().max(240),
  bio: mediumText,
  location: shortText,
  availability: z.string().trim().max(80),
  primaryCtaLabel: z.string().trim().max(40),
  primaryCtaUrl: optionalUrl,
  secondaryCtaLabel: z.string().trim().max(40),
  secondaryCtaUrl: optionalUrl,
  imageMediaId: mediaId,
})

const aboutSectionSchema = z.object({
  ...sectionBase,
  type: z.literal("about"),
  title: z.string().trim().max(80),
  body: longText,
  highlights: stringList(12, 160),
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
  phone: z.string().trim().max(40),
  location: z.string().trim().max(120),
  links: z.array(contactLinkSchema).max(20),
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
  projectsSectionSchema,
  experienceSectionSchema,
  skillsSectionSchema,
  educationSectionSchema,
  certificationsSectionSchema,
  servicesSectionSchema,
  testimonialsSectionSchema,
  achievementsSectionSchema,
  contactSectionSchema,
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
  phone: z.string().trim().max(40),
  avatarMediaId: mediaId,
})

export const portfolioContentSchema = z
  .object({
    version: z.literal(1),
    templateId: z.enum(TEMPLATE_IDS),
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
