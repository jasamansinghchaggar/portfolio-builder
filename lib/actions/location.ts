"use server"

import { getAuthUserId } from "@/lib/auth"
import {
  isGoogleHost,
  isGoogleMapsShortLink,
  isGoogleMapsUrl,
  parseMapInput,
  type ParsedMapLocation,
} from "@/lib/portfolio/location"

const MAX_HOPS = 3
const TIMEOUT_MS = 10000
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

export type ResolveMapsLinkResult =
  ({ ok: true } & ParsedMapLocation) | { ok: false; error: string }

async function fetchHop(url: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, {
      redirect: "manual",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "user-agent": BROWSER_UA,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
    })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Expands a `maps.app.goo.gl` share link into a place and pin. Read-only: it
 * never writes to the portfolio, so it cannot bypass revision checks.
 */
export async function resolveMapsLink(
  input: string
): Promise<ResolveMapsLinkResult> {
  const { userId } = await getAuthUserId()
  if (!userId) {
    return { ok: false, error: "Your session has expired. Sign in again." }
  }

  const value = input.trim()
  if (!isGoogleMapsUrl(value)) {
    return {
      ok: false,
      error:
        "That link isn't a Google Maps link. Copy the link from Google Maps, or type your address instead.",
    }
  }

  const direct = parseMapInput(value)
  if (direct.ok) return direct

  if (!isGoogleMapsShortLink(value)) {
    return { ok: false, error: direct.error }
  }

  let current: URL
  try {
    current = new URL(value)
  } catch {
    return {
      ok: false,
      error: "That link couldn't be read. Try copying it again.",
    }
  }

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    let response: Response
    try {
      response = await fetchHop(current.toString())
    } catch (error) {
      const timedOut =
        error instanceof Error &&
        (error.name === "AbortError" || /abort/i.test(error.message))
      return {
        ok: false,
        error: timedOut
          ? "Google Maps took too long to answer. Open the link in your browser (it redirects to a full Google Maps page), copy the address from the address bar, and paste that instead."
          : "We couldn't reach Google Maps. Open the link in your browser, copy the address from the address bar, and paste that instead.",
      }
    }

    if (response.status < 300 || response.status >= 400) break

    const location = response.headers.get("location")
    if (!location) break

    let next: URL
    try {
      next = new URL(location, current)
    } catch {
      break
    }

    if (!isGoogleHost(next.hostname)) {
      return {
        ok: false,
        error:
          "That share link leads somewhere unexpected. Open the map in your browser and paste the full link instead.",
      }
    }

    current = next
    const parsed = parseMapInput(current.toString())
    if (parsed.ok) return parsed
  }

  const parsed = parseMapInput(current.toString())
  if (parsed.ok) return parsed

  return {
    ok: false,
    error:
      "We couldn't read that link. Open it in your browser (it redirects to a full Google Maps page), copy the address from the address bar, and paste it here.",
  }
}
