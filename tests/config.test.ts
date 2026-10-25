import { describe, expect, it } from "vitest"

import {
  normalizeUsername,
  portfolioPath,
  resolveSafeNextPath,
  usernameError,
} from "@/lib/config"

describe("username rules", () => {
  it("normalises and validates available usernames", () => {
    expect(normalizeUsername("  Avery-Morgan ")).toBe("avery-morgan")
    expect(usernameError("avery-morgan")).toBeNull()
    expect(usernameError("a12")).toBeNull()
  })

  it("rejects invalid formats", () => {
    expect(usernameError("")).toBe("Choose a username.")
    expect(usernameError("ab")).toBe("Use at least 3 characters.")
    expect(usernameError("a".repeat(31))).toBe("Use 30 characters or fewer.")
    expect(usernameError("-avery")).toContain("lowercase letters")
    expect(usernameError("avery-")).toContain("lowercase letters")
    expect(usernameError("avery--morgan")).toBe("Use single hyphens only.")
    expect(usernameError("Avery")).toBeNull()
    expect(usernameError("Avery ")).toBeNull()
  })

  it("rejects reserved names", () => {
    expect(usernameError("admin")).toBe("That username is reserved.")
    expect(usernameError("dashboard")).toBe("That username is reserved.")
    expect(usernameError("folio")).toBe("That username is reserved.")
  })

  it("builds an encoded path", () => {
    expect(portfolioPath("Avery-Morgan")).toBe("/p/avery-morgan")
  })
})

describe("safe redirect paths", () => {
  it("accepts app-relative paths", () => {
    expect(resolveSafeNextPath("/dashboard")).toBe("/dashboard")
    expect(resolveSafeNextPath("/editor?section=hero")).toBe(
      "/editor?section=hero"
    )
  })

  it("rejects external or protocol-relative redirects", () => {
    expect(resolveSafeNextPath("https://evil.example")).toBeNull()
    expect(resolveSafeNextPath("//evil.example")).toBeNull()
    expect(resolveSafeNextPath("dashboard")).toBeNull()
    expect(resolveSafeNextPath(null)).toBeNull()
  })
})
