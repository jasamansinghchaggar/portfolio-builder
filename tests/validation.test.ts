import { describe, expect, it } from "vitest"

import {
  validateBusinessName,
  validateEmail,
  validateOwnerName,
  validatePhone,
  validateUpiId,
  validateUrl,
  validateYoutube,
} from "@/lib/portfolio/validation"

describe("editor field validation", () => {
  it("requires a name with at least one letter or number", () => {
    expect(validateBusinessName("Quinn Studio")).toBeUndefined()
    expect(validateBusinessName("Studio 54")).toBeUndefined()
    expect(validateBusinessName("   ")).toMatch(/Enter your business name/)
    expect(validateBusinessName("---")).toMatch(/at least one letter or number/)
    expect(validateOwnerName("")).toMatch(/Enter the owner's name/)
  })

  it("accepts only a bare 10-digit phone number", () => {
    expect(validatePhone("")).toBeUndefined()
    expect(validatePhone("98765 43210")).toBeUndefined()
    expect(validatePhone("98765-43210")).toBeUndefined()
    expect(validatePhone("+91 98765 43210")).toMatch(/without the country code/)
    expect(validatePhone("98765 4321")).toMatch(/without the country code/)
    expect(validatePhone("98765 432101")).toMatch(/without the country code/)
  })

  it("validates optional emails", () => {
    expect(validateEmail("")).toBeUndefined()
    expect(validateEmail("hello@example.com")).toBeUndefined()
    expect(validateEmail("not-an-email")).toMatch(/valid email/)
  })

  it("validates optional links and blocks script URLs", () => {
    expect(validateUrl("")).toBeUndefined()
    expect(validateUrl("https://example.com")).toBeUndefined()
    expect(validateUrl("#section-contact")).toBeUndefined()
    expect(validateUrl("mailto:hello@example.com")).toBeUndefined()
    expect(validateUrl("example.com")).toMatch(/full http/)
    expect(validateUrl("javascript:alert(1)")).toMatch(/full http/)
  })

  it("validates UPI IDs and YouTube links", () => {
    expect(validateUpiId("")).toBeUndefined()
    expect(validateUpiId("studio@okhdfcbank")).toBeUndefined()
    expect(validateUpiId("studio")).toMatch(/UPI ID/)

    expect(validateYoutube("")).toBeUndefined()
    expect(validateYoutube("dQw4w9WgXcQ")).toBeUndefined()
    expect(validateYoutube("https://youtu.be/dQw4w9WgXcQ")).toBeUndefined()
    expect(validateYoutube("https://example.com/video")).toMatch(/YouTube/)
  })
})
