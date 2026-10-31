"use client"

import { useEffect, useState } from "react"
import { IconSpeakerphone } from "@tabler/icons-react"

import { APP_NAME, SITE_URL } from "@/lib/config"

export type PromoBannerItem = {
  id: string
  message: string
  linkUrl: string | null
  linkLabel: string
}

const DEFAULT_MESSAGES: PromoBannerItem[] = [
  {
    id: "default-1",
    message: `Built with ${APP_NAME} — a website that works as hard as you do.`,
    linkUrl: SITE_URL,
    linkLabel: "Create yours",
  },
  {
    id: "default-2",
    message: "Add services, products, photos, and payment QR codes in minutes.",
    linkUrl: SITE_URL,
    linkLabel: "Create yours",
  },
  {
    id: "default-3",
    message: "Customers can message you directly from your website.",
    linkUrl: SITE_URL,
    linkLabel: "Create yours",
  },
  {
    id: "default-4",
    message: "One link for your business. Share it everywhere.",
    linkUrl: SITE_URL,
    linkLabel: "Create yours",
  },
]

const ROTATE_MS = 7000

export function PromoBar({ banners }: { banners?: PromoBannerItem[] }) {
  const messages = banners && banners.length > 0 ? banners : DEFAULT_MESSAGES
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [messages.length])

  const current = messages[index % messages.length]

  return (
    <div className="pf-promo" role="region" aria-label="About this website">
      <div className="pf-promo-inner">
        <IconSpeakerphone aria-hidden="true" />
        <span key={current.id} className="pf-promo-message">
          {current.message}
        </span>
        <a
          className="pf-promo-link"
          href={current.linkUrl ?? SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {current.linkLabel || "Create yours"}
        </a>
      </div>
    </div>
  )
}