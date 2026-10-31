import { cache } from "react"

import { createPublicClient } from "@/lib/supabase/public"
import { normalizeUsername, USERNAME_PATTERN } from "@/lib/config"
import type { PortfolioContent } from "./schemas"
import { portfolioContentSchema } from "./schemas"
import { parseMediaMap, type MediaMap } from "./media"

export type PublicPortfolio = {
  username: string
  content: PortfolioContent
  media: MediaMap
  publishedAt: string | null
  updatedAt: string
  promoBarEnabled: boolean
}

export const getPublicPortfolio = cache(
  async (username: string): Promise<PublicPortfolio | null> => {
    const normalized = normalizeUsername(username)
    if (!USERNAME_PATTERN.test(normalized) || normalized.includes("--")) {
      return null
    }

    const supabase = createPublicClient()
    const { data, error } = await supabase.rpc("get_public_portfolio", {
      p_username: normalized,
    })

    if (error || !data?.length) return null
    const row = data[0]
    const parsed = portfolioContentSchema.safeParse(row.content)
    if (!parsed.success) return null

    return {
      username: row.username,
      content: parsed.data,
      media: parseMediaMap(row.media),
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      promoBarEnabled: row.promo_bar_enabled,
    }
  }
)

export const getPublicMediaInfo = cache(async (id: string) => {
  const supabase = createPublicClient()
  const { data, error } = await supabase.rpc("get_public_media", { p_id: id })
  if (error || !data?.length) return null
  return data[0]
})

export async function getPublishedPortfolios() {
  const supabase = createPublicClient()
  const { data, error } = await supabase.rpc("get_public_portfolios")
  if (error) return []
  return data
}
