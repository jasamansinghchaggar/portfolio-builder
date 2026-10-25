export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Folio"
export const APP_DESCRIPTION =
  "Build a polished portfolio in minutes. Choose a template, add your story, and publish to your own corner of the web."

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
).replace(/\/+$/, "")

export const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "")
  .replace(/^https?:\/\//, "")
  .replace(/\/.*$/, "")
  .toLowerCase()

export type PortfolioUrlMode = "path" | "subdomain"

export const PORTFOLIO_URL_MODE: PortfolioUrlMode =
  process.env.NEXT_PUBLIC_PORTFOLIO_URL_MODE === "subdomain" && ROOT_DOMAIN
    ? "subdomain"
    : "path"

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const RESERVED_USERNAMES = new Set([
  "www",
  "app",
  "admin",
  "api",
  "dashboard",
  "login",
  "logout",
  "signup",
  "register",
  "auth",
  "onboarding",
  "settings",
  "editor",
  "preview",
  "media",
  "support",
  "help",
  "docs",
  "blog",
  "mail",
  "email",
  "ftp",
  "cdn",
  "assets",
  "static",
  "status",
  "health",
  "terms",
  "privacy",
  "about",
  "contact",
  "careers",
  "pricing",
  "templates",
  "template",
  "portfolio",
  "portfolios",
  "folio",
  "root",
  "system",
  "null",
  "undefined",
  "test",
  "staging",
  "dev",
  "production",
  "pro",
  "sitemap",
  "robots",
  "favicon",
  "apple-touch-icon",
  "manifest",
  "opengraph-image",
  "twitter-image",
  "_next",
  "www2",
])

export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

export function usernameError(value: string): string | null {
  const username = normalizeUsername(value)
  if (!username) return "Choose a username."
  if (username.length < 3) return "Use at least 3 characters."
  if (username.length > 30) return "Use 30 characters or fewer."
  if (!USERNAME_PATTERN.test(username)) {
    return "Use lowercase letters, numbers, and single hyphens. Start and end with a letter or number."
  }
  if (username.includes("--")) return "Use single hyphens only."
  if (RESERVED_USERNAMES.has(username)) return "That username is reserved."
  return null
}

export function portfolioPath(username: string) {
  return `/p/${encodeURIComponent(normalizeUsername(username))}`
}

export function publicPortfolioUrl(username: string) {
  const clean = normalizeUsername(username)
  if (PORTFOLIO_URL_MODE === "subdomain" && ROOT_DOMAIN) {
    try {
      const url = new URL(SITE_URL)
      url.hostname = `${clean}.${ROOT_DOMAIN}`
      return url.toString().replace(/\/+$/, "")
    } catch {
      return `https://${clean}.${ROOT_DOMAIN}`
    }
  }
  return `${SITE_URL}${portfolioPath(clean)}`
}

export function portfolioUrlModeLabel() {
  return PORTFOLIO_URL_MODE === "subdomain"
    ? `Subdomain of ${ROOT_DOMAIN}`
    : "Path on the main domain"
}

export function resolveSafeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null
  }
  return value
}

export function isSubdomainHost(host: string) {
  if (!ROOT_DOMAIN) return null
  const hostname = host.split(":")[0]?.toLowerCase()
  if (!hostname) return null
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return null
  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) return null
  const subdomain = hostname.slice(0, -(ROOT_DOMAIN.length + 1))
  if (!subdomain || subdomain.includes(".") || subdomain === "www") return null
  return subdomain
}
