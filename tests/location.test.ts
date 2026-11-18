import { describe, expect, it } from "vitest"

import { createSampleContent } from "@/lib/portfolio/sample"
import {
  buildDirectionsUrl,
  buildMapEmbedUrl,
  buildOpenInMapsUrl,
  locationName,
  mapQuery,
  nearestZoomPreset,
  parseMapInput,
} from "@/lib/portfolio/location"

describe("parseMapInput", () => {
  it("accepts raw coordinates", () => {
    const parsed = parseMapInput("28.4595, 77.0726")
    expect(parsed).toEqual({
      ok: true,
      query: "28.4595,77.0726",
      place: "",
      latitude: 28.4595,
      longitude: 77.0726,
      zoom: null,
    })
  })

  it("reads the pin, place name, and zoom from a Google Maps place URL", () => {
    const parsed = parseMapInput(
      "https://www.google.com/maps/place/Quinn+Studio/@40.6862,-73.9954,17z/data=!4m6!3m5!1s0x0:0x0!8m2!3d40.68621!4d-73.99541"
    )

    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.place).toBe("Quinn Studio")
    expect(parsed.query).toBe("Quinn Studio")
    expect(parsed.latitude).toBe(40.68621)
    expect(parsed.longitude).toBe(-73.99541)
    expect(parsed.zoom).toBe(17)
  })

  it("reads address searches and ll coordinates", () => {
    const search = parseMapInput(
      "https://maps.google.com/?q=India+Gate%2C+New+Delhi"
    )
    expect(search.ok).toBe(true)
    if (!search.ok) return
    expect(search.query).toBe("India Gate, New Delhi")
    expect(search.latitude).toBeNull()

    const ll = parseMapInput("https://maps.google.com/?ll=28.6129,77.2295&z=15")
    expect(ll.ok).toBe(true)
    if (!ll.ok) return
    expect(ll.latitude).toBe(28.6129)
    expect(ll.longitude).toBe(77.2295)
    expect(ll.zoom).toBe(15)
    expect(ll.query).toBe("28.6129,77.2295")
  })

  it("treats plain text as an address", () => {
    const parsed = parseMapInput("  12 MG Road, Bengaluru  ")
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.query).toBe("12 MG Road, Bengaluru")
    expect(parsed.latitude).toBeNull()
  })

  it("rejects non-Google and unsafe links", () => {
    expect(parseMapInput("https://example.com/maps/place/x").ok).toBe(false)
    expect(parseMapInput("javascript:alert(1)").ok).toBe(false)
    expect(parseMapInput("").ok).toBe(false)
  })

  it("accepts Google country domains", () => {
    const parsed = parseMapInput(
      "https://maps.google.co.in/maps/place/India+Gate/@28.6129,77.2295,15z"
    )
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.place).toBe("India Gate")
    expect(parsed.latitude).toBe(28.6129)
    expect(parsed.longitude).toBe(77.2295)
  })

  it("asks for a different link when a share link has no readable place", () => {
    const parsed = parseMapInput("https://maps.app.goo.gl/abc123")
    expect(parsed.ok).toBe(false)
    if (parsed.ok) return
    expect(parsed.error).toContain("Share")
  })
})

describe("map URLs", () => {
  it("uses the keyless embed when no API key is configured", () => {
    const url = buildMapEmbedUrl(
      {
        query: "India Gate",
        latitude: null,
        longitude: null,
        zoom: 14,
        mapType: "roadmap",
      },
      undefined
    )

    expect(url).toContain("https://www.google.com/maps?")
    expect(url).toContain("q=India+Gate")
    expect(url).toContain("z=14")
    expect(url).toContain("output=embed")
  })

  it("uses the Embed API place mode so a pin is always shown", () => {
    const url = buildMapEmbedUrl(
      {
        query: "Quinn Studio",
        latitude: 40.6862,
        longitude: -73.9954,
        zoom: 15,
        mapType: "roadmap",
      },
      "test-key"
    )

    expect(url).toContain("/maps/embed/v1/place")
    expect(url).toContain("key=test-key")
    expect(url).toContain("q=40.6862%2C-73.9954")
    expect(url).toContain("zoom=15")
  })

  it("uses the Embed API place mode when there is no pin", () => {
    const url = buildMapEmbedUrl(
      {
        query: "India Gate",
        latitude: null,
        longitude: null,
        zoom: 12,
        mapType: "satellite",
      },
      "test-key"
    )

    expect(url).toContain("/maps/embed/v1/place")
    expect(url).toContain("q=India+Gate")
    expect(url).toContain("maptype=satellite")
  })

  it("markers satellite maps in keyless mode", () => {
    const url = buildMapEmbedUrl(
      {
        query: "India Gate",
        latitude: null,
        longitude: null,
        zoom: 12,
        mapType: "satellite",
      },
      undefined
    )
    expect(url).toContain("t=k")
  })

  it("builds directions and open-in-maps links", () => {
    const pin = {
      query: "Quinn Studio",
      latitude: 40.6862,
      longitude: -73.9954,
    }
    expect(buildDirectionsUrl(pin)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=40.6862%2C-73.9954"
    )
    expect(buildOpenInMapsUrl(pin)).toBe(
      "https://www.google.com/maps/search/?api=1&query=40.6862%2C-73.9954"
    )
    expect(
      buildDirectionsUrl({
        query: "India Gate",
        latitude: null,
        longitude: null,
      })
    ).toContain("destination=India%20Gate")
    expect(
      buildOpenInMapsUrl({ query: "", latitude: null, longitude: null })
    ).toBeNull()
  })

  it("falls back to the page address when the section has no query", () => {
    const { basics } = createSampleContent()
    expect(
      mapQuery({ query: "", latitude: null, longitude: null }, basics)
    ).toBe("82 Dean Street, Brooklyn, NY")
  })
})

describe("zoom presets", () => {
  it("snaps stored zoom levels to the closest friendly preset", () => {
    expect(nearestZoomPreset(17)).toBe(17)
    expect(nearestZoomPreset(16)).toBe(17)
    expect(nearestZoomPreset(13)).toBe(14)
    expect(nearestZoomPreset(9)).toBe(11)
  })
})

describe("locationName", () => {
  it("prefers a label, then a place name, then a friendly fallback", () => {
    expect(
      locationName({
        query: "India Gate",
        latitude: null,
        longitude: null,
        label: "Our Delhi office",
      })
    ).toBe("Our Delhi office")

    expect(
      locationName({ query: "India Gate", latitude: null, longitude: null })
    ).toBe("India Gate")

    expect(
      locationName({
        query: "28.6129,77.2295",
        latitude: 28.6129,
        longitude: 77.2295,
      })
    ).toBe("Our location")
  })
})
