import type { MediaMap } from "@/lib/portfolio/media"
import type { PortfolioContent } from "@/lib/portfolio/types"

import { StudioRenderer } from "./studio-renderer"

type PortfolioRendererProps = {
  content: PortfolioContent
  media?: MediaMap
  /** Disables smooth scrolling and floating actions inside the editor. */
  preview?: boolean
  username?: string
}

/**
 * Every portfolio now renders through the business-first Studio design.
 * Legacy template ids are normalised before the content reaches this point.
 */
export function PortfolioRenderer({
  content,
  media = {},
  preview = false,
  username,
}: PortfolioRendererProps) {
  return (
    <StudioRenderer
      content={content}
      media={media}
      preview={preview}
      username={username}
    />
  )
}
