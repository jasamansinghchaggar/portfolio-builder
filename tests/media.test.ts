import { describe, expect, it } from "vitest"

import {
  clampFocal,
  mediaMapFromEditor,
  mediaMapFromRows,
  mediaObjectPosition,
  parseFocalPoint,
  parseMediaMap,
  type EditorMedia,
} from "@/lib/portfolio/media"

const editorMedia: EditorMedia = {
  id: "11111111-1111-4111-8111-111111111111",
  kind: "project",
  mimeType: "image/webp",
  fileName: "project.webp",
  sizeBytes: 1200,
  width: 800,
  height: 600,
  focalX: 0.25,
  focalY: 0.75,
  createdAt: "2026-01-01T00:00:00.000Z",
}

describe("media maps", () => {
  it("maps database rows to render metadata", () => {
    const map = mediaMapFromRows([
      {
        id: editorMedia.id,
        mime_type: "image/webp",
        file_name: "project.webp",
        width: 800,
        height: 600,
        focal_x: 0.25,
        focal_y: 0.75,
      },
    ])
    expect(map[editorMedia.id]).toEqual({
      width: 800,
      height: 600,
      mimeType: "image/webp",
      fileName: "project.webp",
      focalX: 0.25,
      focalY: 0.75,
    })
  })

  it("centres rows saved before focal points existed", () => {
    const map = mediaMapFromRows([
      {
        id: editorMedia.id,
        mime_type: "image/webp",
        file_name: "project.webp",
        width: 800,
        height: 600,
      },
    ])
    expect(map[editorMedia.id]?.focalX).toBe(0.5)
    expect(map[editorMedia.id]?.focalY).toBe(0.5)
  })

  it("maps editor media to render metadata", () => {
    expect(mediaMapFromEditor([editorMedia])[editorMedia.id]).toEqual({
      width: 800,
      height: 600,
      mimeType: "image/webp",
      fileName: "project.webp",
      focalX: 0.25,
      focalY: 0.75,
    })
  })

  it("drops malformed entries from published media JSON", () => {
    const map = parseMediaMap({
      [editorMedia.id]: {
        width: 800,
        height: null,
        mimeType: "image/png",
        fileName: "shot.png",
      },
      broken: { width: 100 },
      alsoBroken: null,
    })
    expect(Object.keys(map)).toEqual([editorMedia.id])
    expect(map[editorMedia.id]?.focalX).toBe(0.5)
    expect(map[editorMedia.id]?.focalY).toBe(0.5)
    expect(parseMediaMap(null)).toEqual({})
    expect(parseMediaMap([])).toEqual({})
  })

  it("keeps valid focal points from published media JSON", () => {
    const map = parseMediaMap({
      [editorMedia.id]: {
        width: 800,
        height: 600,
        mimeType: "image/png",
        fileName: "shot.png",
        focalX: 0.1,
        focalY: 0.9,
      },
    })
    expect(map[editorMedia.id]?.focalX).toBe(0.1)
    expect(map[editorMedia.id]?.focalY).toBe(0.9)
  })
})

describe("focal points", () => {
  it("clamps values to the 0-1 range", () => {
    expect(clampFocal(-1)).toBe(0)
    expect(clampFocal(2)).toBe(1)
    expect(clampFocal(0.42)).toBe(0.42)
    expect(clampFocal("0.3")).toBe(0.3)
  })

  it("falls back to the centre for unusable values", () => {
    expect(clampFocal(undefined)).toBe(0.5)
    expect(clampFocal(null)).toBe(0.5)
    expect(clampFocal("")).toBe(0.5)
    expect(clampFocal(Number.NaN)).toBe(0.5)
  })

  it("parses form values into a focal point", () => {
    expect(parseFocalPoint("0.2", "0.8")).toEqual({ x: 0.2, y: 0.8 })
    expect(parseFocalPoint(undefined, undefined)).toEqual({ x: 0.5, y: 0.5 })
  })

  it("builds a CSS object-position", () => {
    expect(mediaObjectPosition({ focalX: 0.25, focalY: 0.75 })).toBe(
      "25.00% 75.00%"
    )
    expect(mediaObjectPosition(undefined)).toBe("50.00% 50.00%")
  })
})
