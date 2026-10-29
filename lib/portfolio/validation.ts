import { z } from "zod"

import type { PortfolioContent } from "./schemas"
import { isHttpUrl } from "./schemas"
import { youtubeId } from "./sections"

/**
 * Field-level rules mirror the content schema so inline editor feedback and
 * server-side validation agree. Each returns a message or `undefined`.
 */
function firstIssue(schema: z.ZodType<string>, value: string) {
  const parsed = schema.safeParse(value)
  return parsed.success ? undefined : parsed.error.issues[0]?.message
}

function nameSchema(label: string) {
  return z
    .string()
    .trim()
    .min(1, `Enter ${label}.`)
    .max(120, `Keep ${label} under 120 characters.`)
    .refine(
      (value) => /[\p{L}\p{N}]/u.test(value),
      `Use at least one letter or number in ${label}.`
    )
}

const emailSchema = z
  .string()
  .trim()
  .max(254, "Keep the email under 254 characters.")
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Enter a valid email address."
  )

/**
 * Phone fields collect a bare 10-digit local number with no country code.
 * Spaces, dashes, and brackets are ignored; a leading `+` is rejected.
 */
const phoneSchema = z
  .string()
  .trim()
  .max(40, "Keep the number under 40 characters.")
  .refine(
    (value) =>
      value === "" ||
      (!value.includes("+") && value.replace(/\D/g, "").length === 10),
    "Enter a 10-digit number without the country code."
  )

const urlSchema = z
  .string()
  .trim()
  .max(2048, "Keep links under 2,048 characters.")
  .refine(isHttpUrl, "Enter a full http:// or https:// link.")

const upiSchema = z
  .string()
  .trim()
  .max(120, "Keep the UPI ID under 120 characters.")
  .refine(
    (value) => value === "" || /^[^\s@]+@[^\s@]+$/.test(value),
    "Enter a UPI ID like name@bank."
  )

export function validateBusinessName(value: string) {
  return firstIssue(nameSchema("your business name"), value)
}

export function validateOwnerName(value: string) {
  return firstIssue(nameSchema("the owner's name"), value)
}

export function validateEmail(value: string) {
  return firstIssue(emailSchema, value)
}

export function validatePhone(value: string) {
  return firstIssue(phoneSchema, value)
}

export function validateUrl(value: string) {
  return firstIssue(urlSchema, value)
}

export function validateUpiId(value: string) {
  return firstIssue(upiSchema, value)
}

export function validateYoutube(value: string) {
  if (!value.trim()) return undefined
  return youtubeId(value)
    ? undefined
    : "Paste a YouTube link or an 11-character video ID."
}

/** Keep phone inputs numeric and limited to a bare 10-digit number. */
export function sanitizePhoneInput(value: string) {
  let digits = value.replace(/\D/g, "")
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2)
  if (digits.length > 10 && digits.startsWith("0")) digits = digits.slice(1)
  return digits.slice(0, 10)
}

export function sanitizeEmailInput(value: string) {
  return value.replace(/\s/g, "")
}

export function sanitizeUpiInput(value: string) {
  return value.replace(/\s/g, "").toLowerCase()
}

export type ContentFieldIssue = {
  path: string
  message: string
}

/**
 * Format errors that should block autosave. Empty optional values pass;
 * required-but-empty names are left to publish so legacy drafts stay editable.
 */
export function contentFieldIssues(
  content: PortfolioContent
): ContentFieldIssue[] {
  const issues: ContentFieldIssue[] = []
  const check = (path: string, message: string | undefined) => {
    if (message) issues.push({ path, message })
  }

  const { basics } = content
  if (basics.businessName.trim()) {
    check("basics.businessName", validateBusinessName(basics.businessName))
  }
  if (basics.ownerName.trim()) {
    check("basics.ownerName", validateOwnerName(basics.ownerName))
  }
  check("basics.email", validateEmail(basics.email))
  check("basics.phone", validatePhone(basics.phone))
  check("basics.whatsapp", validatePhone(basics.whatsapp))

  for (const section of content.sections) {
    switch (section.type) {
      case "projects":
        section.items.forEach((item, index) => {
          check(`sections.projects.items.${index}.url`, validateUrl(item.url))
          check(
            `sections.projects.items.${index}.repoUrl`,
            validateUrl(item.repoUrl)
          )
        })
        break
      case "certifications":
        section.items.forEach((item, index) => {
          check(
            `sections.certifications.items.${index}.credentialUrl`,
            validateUrl(item.credentialUrl)
          )
        })
        break
      case "services":
        check("sections.services.ctaUrl", validateUrl(section.ctaUrl))
        break
      case "products":
        section.items.forEach((item, index) => {
          check(`sections.products.items.${index}.url`, validateUrl(item.url))
        })
        break
      case "socials":
        section.items.forEach((item, index) => {
          check(`sections.socials.items.${index}.url`, validateUrl(item.url))
        })
        break
      case "videos":
        section.items.forEach((item, index) => {
          check(
            `sections.videos.items.${index}.youtubeId`,
            validateYoutube(item.youtubeId)
          )
        })
        break
      case "payment":
        check("sections.payment.upiId", validateUpiId(section.upiId))
        break
    }
  }

  return issues
}
