"use client"

import Image from "next/image"
import { useEffect, useId, useRef, useState, useTransition } from "react"
import QRCode from "qrcode"
import {
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconDownload,
  IconMessageCircle,
  IconShare,
  IconBrandWhatsapp,
  IconX,
} from "@tabler/icons-react"

import { sendPortfolioMessageAction } from "@/lib/actions/messages"
import {
  isImageMime,
  mediaHref,
  type MediaMap,
} from "@/lib/portfolio/media"

export function ReadMore({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className="pf-readmore">
      <div id={id} className="pf-readmore-body" data-open={open}>
        {children}
      </div>
      <button
        type="button"
        className="pf-button pf-button-ghost"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Read less" : "Read more"}
      </button>
    </div>
  )
}

export function ShareButton({
  title,
  label = "Share",
}: {
  title: string
  label?: string
}) {
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // The visitor cancelled or the browser refused; fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setMessage("Link copied to clipboard.")
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setMessage("Copy is not available in this browser.")
    }
  }

  return (
    <span className="pf-share">
      <button type="button" className="pf-share-button" onClick={() => void share()}>
        {copied ? <IconCopy /> : <IconShare />}
        {copied ? "Copied" : label}
      </button>
      <span className="pf-share-status" role="status">
        {message}
      </span>
    </span>
  )
}

export function SaveContactButton({
  businessName,
  ownerName,
  phone,
  email,
  website,
  label = "Save contact",
}: {
  businessName: string
  ownerName: string
  phone: string
  email: string
  website: string
  label?: string
}) {
  function save() {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${businessName}`,
      `ORG:${businessName}`,
      ownerName ? `TITLE:${ownerName}` : "",
      phone ? `TEL;TYPE=CELL:${phone}` : "",
      email ? `EMAIL:${email}` : "",
      website ? `URL:${website}` : "",
      "END:VCARD",
    ].filter(Boolean)
    const blob = new Blob([lines.join("\n")], { type: "text/vcard" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${businessName.replace(/[^\w]+/g, "-") || "contact"}.vcf`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" className="pf-action" onClick={save}>
      <IconDownload />
      <span>{label}</span>
    </button>
  )
}

export type GalleryEntry = {
  id: string
  title: string
  caption: string
  imageMediaId: string | null
}

export function GalleryGrid({
  items,
  media,
  emptyLabel = "Photos will appear here.",
}: {
  items: GalleryEntry[]
  media: MediaMap
  emptyLabel?: string
}) {
  const [active, setActive] = useState<number | null>(null)
  const current = active === null ? null : items[active]

  function move(direction: -1 | 1) {
    setActive((index) => {
      if (index === null || !items.length) return null
      return (index + direction + items.length) % items.length
    })
  }

  if (!items.length) {
    return <p className="pf-empty">{emptyLabel}</p>
  }

  return (
    <>
      <div className="pf-tiles">
        {items.map((item, index) => {
          const meta = item.imageMediaId ? media[item.imageMediaId] : undefined
          const image = item.imageMediaId && meta && isImageMime(meta.mimeType)
          return (
            <button
              key={item.id}
              type="button"
              className="pf-tile"
              onClick={() => setActive(index)}
              aria-label={`Open ${item.title || "image"}`}
            >
              {image ? (
                <Image
                  src={mediaHref(item.imageMediaId as string)}
                  alt={item.title || item.caption || "Portfolio image"}
                  fill
                  sizes="(min-width: 900px) 33vw, 50vw"
                />
              ) : (
                <span>{item.title || "Image"}</span>
              )}
            </button>
          )
        })}
      </div>

      {current ? (
        <div
          className="pf-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.title || "Image preview"}
          onClick={() => setActive(null)}
        >
          <div className="pf-lightbox-inner" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="pf-lightbox-close"
              aria-label="Close"
              onClick={() => setActive(null)}
            >
              <IconX />
            </button>
            {current.imageMediaId && media[current.imageMediaId] ? (
              <Image
                src={mediaHref(current.imageMediaId)}
                alt={current.title || "Portfolio image"}
                width={1200}
                height={900}
                className="pf-lightbox-image"
              />
            ) : (
              <div className="pf-lightbox-placeholder">{current.title}</div>
            )}
            <div className="pf-lightbox-caption">
              <div>
                <h3>{current.title}</h3>
                {current.caption ? <p>{current.caption}</p> : null}
              </div>
              <div className="pf-lightbox-nav">
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => move(-1)}
                >
                  <IconChevronLeft />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => move(1)}
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function ContactForm({
  username,
  title,
  note,
  preview = false,
}: {
  username: string
  title: string
  note: string
  preview?: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "error"; message: string }>({
    kind: "idle",
    message: "",
  })
  const formRef = useRef<HTMLFormElement>(null)

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (preview) {
      setStatus({
        kind: "idle",
        message: "This is a preview — the contact form is disabled here.",
      })
      return
    }
    const form = event.currentTarget
    const data = new FormData(form)
    startTransition(async () => {
      const result = await sendPortfolioMessageAction({
        username,
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        message: String(data.get("message") ?? ""),
      })
      if (!result.ok) {
        setStatus({ kind: "error", message: result.error })
        return
      }
      form.reset()
      setStatus({
        kind: "ok",
        message: "Message sent. We will get back to you soon.",
      })
    })
  }

  return (
    <form ref={formRef} className="pf-contact-form" onSubmit={submit}>
      <h3>{title || "Send us a message"}</h3>
      {note ? <p className="pf-form-note">{note}</p> : null}
      <div className="pf-form-row">
        <label>
          Full name
          <input name="name" autoComplete="name" required maxLength={120} />
        </label>
        <label>
          Phone number
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
      </div>
      <label>
        Email address
        <input name="email" type="email" autoComplete="email" maxLength={254} />
      </label>
      <label>
        Message
        <textarea name="message" required maxLength={4000} rows={5} />
      </label>
      <p className="pf-form-status" data-kind={status.kind} role="status">
        {status.message}
      </p>
      <button type="submit" className="pf-button" disabled={pending || preview}>
        {preview ? "Preview only" : pending ? "Sending…" : "Send message"}
      </button>
    </form>
  )
}

export function QrCard({
  text,
  caption,
  fileName,
}: {
  text: string
  caption: string
  fileName: string
}) {
  const [result, setResult] = useState<{ text: string; url: string } | null>(null)
  const [failedText, setFailedText] = useState<string | null>(null)

  useEffect(() => {
    if (!text.trim()) return
    let cancelled = false
    QRCode.toDataURL(text, {
      width: 360,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setResult({ text, url })
      })
      .catch(() => {
        if (!cancelled) setFailedText(text)
      })
    return () => {
      cancelled = true
    }
  }, [text])

  const dataUrl = result?.text === text ? result.url : null
  const failed = failedText === text

  if (!text.trim()) {
    return <div className="pf-qr-box pf-qr-empty">Add a link to generate a QR code.</div>
  }

  if (failed) {
    return <div className="pf-qr-box pf-qr-empty">QR code unavailable.</div>
  }

  return (
    <div className="pf-qr-card">
      <div className="pf-qr-box">
        {dataUrl ? (
          <Image
            src={dataUrl}
            alt={caption || "QR code"}
            width={220}
            height={220}
            unoptimized
          />
        ) : (
          <span>Generating…</span>
        )}
      </div>
      <p className="pf-qr-caption">{caption}</p>
      {dataUrl ? (
        <a className="pf-button pf-button-ghost" href={dataUrl} download={fileName}>
          <IconDownload />
          Save QR code
        </a>
      ) : null}
    </div>
  )
}

export function QrTabs({
  entries,
}: {
  entries: { id: string; label: string; text: string; caption: string }[]
}) {
  const [active, setActive] = useState(entries[0]?.id ?? "")
  const current = entries.find((entry) => entry.id === active) ?? entries[0]

  if (!current) {
    return <p className="pf-empty">Add a website, WhatsApp, or Instagram link to create a QR code.</p>
  }

  return (
    <div className="pf-qr-tabs">
      <div className="pf-tabs" role="tablist" aria-label="QR code type">
        {entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={entry.id === active}
            onClick={() => setActive(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <QrCard
        text={current.text}
        caption={current.caption}
        fileName={`${current.id}-qr.png`}
      />
    </div>
  )
}

export function FloatingContact({
  whatsappUrl,
  ownerName,
  phone,
}: {
  whatsappUrl: string | null
  ownerName: string
  phone: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="pf-fab">
      {open ? (
        <div className="pf-chatbox" role="dialog" aria-label="Chat">
          <div className="pf-chatbox-head">
            <strong>{ownerName}</strong>
            <span>Online</span>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <IconX />
            </button>
          </div>
          <p>Hi! How can we help you today? Feel free to ask any questions.</p>
          {whatsappUrl ? (
            <a className="pf-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Start chat
            </a>
          ) : phone ? (
            <a className="pf-button" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
              Call us
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="pf-fab-actions">
        {whatsappUrl ? (
          <a
            className="pf-fab-wa"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message on WhatsApp"
          >
            <IconBrandWhatsapp />
          </a>
        ) : null}
        <button
          type="button"
          className="pf-fab-chat"
          aria-label={open ? "Close chat" : "Open chat"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <IconX /> : <IconMessageCircle />}
        </button>
      </div>
    </div>
  )
}
