import { describe, expect, it } from "vitest"

import { createSampleContent } from "@/lib/portfolio/sample"
import {
  phoneHref,
  sectionHasSubstance,
  sectionLabel,
  whatsappHref,
} from "@/lib/portfolio/sections"

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

describe("mission sections", () => {
  it("treats promises as optional when the intro is present", () => {
    const content = createSampleContent()
    const mission = content.sections.find(
      (section) => section.type === "mission"
    )
    if (mission?.type !== "mission") {
      throw new Error("Sample content needs a mission section.")
    }

    mission.items = []
    mission.intro = "Our mission in one line."
    expect(sectionHasSubstance(mission)).toBe(true)

    mission.intro = ""
    expect(sectionHasSubstance(mission)).toBe(false)
  })
})

describe("location sections", () => {
  it("labels the section and stays hidden until a place or pin is set", () => {
    const content = createSampleContent()
    const location = content.sections.find(
      (section) => section.type === "location"
    )
    if (location?.type !== "location") {
      throw new Error("Sample content needs a location section.")
    }

    expect(sectionLabel(location)).toBe("Find the studio")
    expect(sectionHasSubstance(location)).toBe(true)

    location.query = ""
    location.latitude = null
    location.longitude = null
    expect(sectionHasSubstance(location)).toBe(false)
  })
})
