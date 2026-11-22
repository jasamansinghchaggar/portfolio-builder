import type { MapType } from "./constants"
import type { Basics } from "./schemas"

/**
 * A location is either a searchable place (`query`) or a precise pin
 * (`latitude`/`longitude`). The editor fills both when it can, because the
 * coordinates survive Google renaming a business while the text keeps the map
 * readable if the pin is missing.
 */
export type MapLocation = {
  query: string
  latitude: number | null
  longitude: number | null
  label?: string
  zoom?: number
  mapType?: MapType
}

export type ParsedMapLocation = {
  query: string
  place: string
  latitude: number | null
  longitude: number | null
  zoom: number | null
}

export type ParseMapResult =
  ({ ok: true } & ParsedMapLocation) | { ok: false; error: string }

const SHORT_LINK_HOSTS = new Set(["maps.app.goo.gl", "goo.gl"])

/**
 * Google Maps is served from google.com and country domains such as
 * google.co.in, so match the family rather than a fixed list.
 */
export function isGoogleHost(hostname: string) {
  const host = hostname.toLowerCase()
  if (SHORT_LINK_HOSTS.has(host)) return true
  if (host === "google.com" || host.endsWith(".google.com")) return true
  return /^(?:www\.|maps\.)?google\.[a-z]{2,3}(?:\.[a-z]{2})?$/.test(host)
}

const COORDINATE_PAIR = /^(-?\d{1,3}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)$/

export const ZOOM_PRESETS = [
  { value: 17, label: "Street" },
  { value: 14, label: "Local area" },
  { value: 11, label: "City" },
] as const

export const MAP_TYPE_OPTIONS: { value: MapType; label: string }[] = [
  { value: "roadmap", label: "Roadmap" },
  { value: "satellite", label: "Satellite" },
]

export function clampZoom(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 15
  }
  return Math.min(21, Math.max(1, Math.round(value)))
}

/** Closest friendly preset for a stored zoom level. */
export function nearestZoomPreset(value: number) {
  return ZOOM_PRESETS.reduce((closest, preset) =>
    Math.abs(preset.value - value) < Math.abs(closest.value - value)
      ? preset
      : closest
  ).value
}

export function isGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      isGoogleHost(url.hostname)
    )
  } catch {
    return false
  }
}

/** Short share links need a server round-trip to reveal the place. */
export function isGoogleMapsShortLink(value: string) {
  try {
    const url = new URL(value.trim())
    return SHORT_LINK_HOSTS.has(url.hostname.toLowerCase())
  } catch {
    return false
  }
}

function validCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  )
}

function coordinatePair(value: string) {
  const match = COORDINATE_PAIR.exec(value.trim())
  if (!match) return null
  const latitude = Number(match[1])
  const longitude = Number(match[2])
  return validCoordinate(latitude, longitude) ? { latitude, longitude } : null
}

function decodePlaceName(value: string) {
  try {
    return decodeURIComponent(value).replace(/\+/g, " ").trim()
  } catch {
    return value.replace(/\+/g, " ").trim()
  }
}

function placeFromPath(pathname: string) {
  const match = /\/(?:maps\/)?(?:place|search)\/([^/]+)/.exec(pathname)
  return match ? decodePlaceName(match[1] ?? "") : ""
}

function numberFrom(value: string | null) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Turns anything an owner is likely to paste into usable map fields:
 * raw coordinates, a long Google Maps URL, or a plain address.
 */
export function parseMapInput(input: string): ParseMapResult {
  const value = input.trim()
  if (!value) {
    return { ok: false, error: "Paste a Google Maps link or your address." }
  }

  const coordinates = coordinatePair(value)
  if (coordinates) {
    const query = `${coordinates.latitude},${coordinates.longitude}`
    return {
      ok: true,
      query,
      place: "",
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      zoom: null,
    }
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    if (!isGoogleMapsUrl(value)) {
      return {
        ok: false,
        error:
          "That link isn't a Google Maps link. Copy the link from Google Maps, or type your address instead.",
      }
    }

    let url: URL
    try {
      url = new URL(value)
    } catch {
      return {
        ok: false,
        error: "That link couldn't be read. Try copying it again.",
      }
    }

    const params = url.searchParams
    // `!3d!4d` is the actual place pin; `@` is only the camera centre.
    const pin = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/.exec(value)
    const camera =
      /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,(\d+(?:\.\d+)?)z)?/.exec(value)
    const ll = params.get("ll")?.split(",") ?? []
    const center = params.get("center")?.split(",") ?? []
    const q =
      params.get("q") || params.get("query") || params.get("destination")

    const pinLatitude = pin ? Number(pin[1]) : null
    const pinLongitude = pin ? Number(pin[2]) : null
    const cameraLatitude = camera ? Number(camera[1]) : null
    const cameraLongitude = camera ? Number(camera[2]) : null
    const llLatitude = numberFrom(ll[0] ?? null)
    const llLongitude = numberFrom(ll[1] ?? null)
    const centerLatitude = numberFrom(center[0] ?? null)
    const centerLongitude = numberFrom(center[1] ?? null)

    let latitude: number | null = null
    let longitude: number | null = null
    for (const [lat, lng] of [
      [pinLatitude, pinLongitude],
      [cameraLatitude, cameraLongitude],
      [llLatitude, llLongitude],
      [centerLatitude, centerLongitude],
    ] as const) {
      if (lat !== null && lng !== null && validCoordinate(lat, lng)) {
        latitude = lat
        longitude = lng
        break
      }
    }

    const qCoordinates = q ? coordinatePair(q) : null
    if (qCoordinates && latitude === null) {
      latitude = qCoordinates.latitude
      longitude = qCoordinates.longitude
    }

    const zoomFromUrl =
      numberFrom(camera?.[3] ?? null) ??
      numberFrom(params.get("z")) ??
      numberFrom(params.get("zoom"))

    const place = q && !qCoordinates ? q.trim() : placeFromPath(url.pathname)
    const query =
      place ||
      (latitude !== null && longitude !== null
        ? `${latitude},${longitude}`
        : "")

    if (!query) {
      return {
        ok: false,
        error:
          "We couldn't find a place in that link. Open Google Maps, search for your business, then use Share → Copy link.",
      }
    }

    return {
      ok: true,
      query,
      place,
      latitude,
      longitude,
      zoom: zoomFromUrl,
    }
  }

  // Anything else is treated as an address or place name.
  return {
    ok: true,
    query: value,
    place: value,
    latitude: null,
    longitude: null,
    zoom: null,
  }
}

export function locationCenter(location: MapLocation) {
  if (location.latitude === null || location.longitude === null) return ""
  return `${location.latitude},${location.longitude}`
}

/** Falls back to the page address so a map can work without a pin. */
export function mapQuery(location: MapLocation, basics?: Basics) {
  return (
    location.query.trim() ||
    locationCenter(location) ||
    basics?.address.trim() ||
    basics?.location.trim() ||
    ""
  )
}

/** Friendly card heading: owner label, then the place name, then a fallback. */
export function locationName(location: MapLocation) {
  const label = location.label?.trim()
  if (label) return label
  const query = location.query.trim()
  if (query && !coordinatePair(query)) return query
  return "Our location"
}

export function buildMapEmbedUrl(
  location: MapLocation,
  apiKey: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY
) {
  const center = locationCenter(location)
  const query = location.query.trim() || center
  if (!center && !query) return ""

  const zoom = String(clampZoom(location.zoom))
  const mapType: MapType =
    location.mapType === "satellite" ? "satellite" : "roadmap"
  const key = apiKey?.trim()

  if (key) {
    // `place` mode keeps the marker visible; `view` only centres the map.
    const params = new URLSearchParams({
      key,
      q: center || query,
      zoom,
      maptype: mapType,
    })
    return `https://www.google.com/maps/embed/v1/place?${params.toString()}`
  }

  // Unofficial but key-free: keeps local and unconfigured deployments working.
  const params = new URLSearchParams({
    q: center || query,
    z: zoom,
    output: "embed",
  })
  if (mapType === "satellite") params.set("t", "k")
  return `https://www.google.com/maps?${params.toString()}`
}

export function buildDirectionsUrl(location: MapLocation) {
  const destination = locationCenter(location) || location.query.trim()
  if (!destination) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination
  )}`
}

export function buildOpenInMapsUrl(location: MapLocation) {
  const query = locationCenter(location) || location.query.trim()
  if (!query) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`
}
