import { describe, expect, it } from "vitest"

import {
  mediaMapFromEditor,
  mediaMapFromRows,
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
      },
    ])
    expect(map[editorMedia.id]).toEqual({
      width: 800,
      height: 600,
      mimeType: "image/webp",
      fileName: "project.webp",
    })
  })

  it("maps editor media to render metadata", () => {
    expect(mediaMapFromEditor([editorMedia])[editorMedia.id]).toEqual({
      width: 800,
      height: 600,
      mimeType: "image/webp",
      fileName: "project.webp",
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
    expect(parseMediaMap(null)).toEqual({})
    expect(parseMediaMap([])).toEqual({})
  })
})
