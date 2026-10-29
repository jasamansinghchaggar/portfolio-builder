import { describe, expect, it } from "vitest"

import { createSampleContent } from "@/lib/portfolio/sample"
import { phoneHref, whatsappHref } from "@/lib/portfolio/sections"

describe("phone links", () => {
  it("adds the default country code to a bare 10-digit number", () => {
    expect(phoneHref("98765 43210")).toBe("tel:+919876543210")

    const content = createSampleContent()
    content.basics.whatsapp = "98765 43210"
    expect(whatsappHref(content)).toBe("https://wa.me/919876543210")
  })

  it("keeps numbers that already include a country code", () => {
    expect(phoneHref("+91 98765 43210")).toBe("tel:+919876543210")
    expect(phoneHref("+1 555 014 2200")).toBe("tel:+15550142200")
  })
})
