"use client"

import { useEffect, useState } from "react"
import { IconSpeakerphone } from "@tabler/icons-react"

import { APP_NAME, SITE_URL } from "@/lib/config"

const MESSAGES = [
  `Built with ${APP_NAME} — a website that works as hard as you do.`,
  "Add services, products, photos, and payment QR codes in minutes.",
  "Customers can message you directly from your website.",
  "One link for your business. Share it everywhere.",
]

const ROTATE_MS = 7000

export function PromoBar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % MESSAGES.length)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="pf-promo" role="region" aria-label="About this website">
      <div className="pf-promo-inner">
        <IconSpeakerphone aria-hidden="true" />
        <span key={index} className="pf-promo-message">
          {MESSAGES[index]}
        </span>
        <a
          className="pf-promo-link"
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Create yours
        </a>
      </div>
    </div>
  )
}
