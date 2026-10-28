import Image from "next/image"
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandYoutube,
  IconCalendar,
  IconChartBar,
  IconDownload,
  IconGlobe,
  IconMail,
  IconMapPin,
  IconMenu2,
  IconPhone,
  IconStar,
  IconX,
} from "@tabler/icons-react"

import { APP_NAME, SITE_URL } from "@/lib/config"
import { designStyle } from "@/lib/portfolio/colors"
import {
  isImageMime,
  mediaDownloadHref,
  mediaHref,
  type MediaMap,
} from "@/lib/portfolio/media"
import {
  businessName as contentBusinessName,
  contactAddress,
  contactEmail,
  contactPhone,
  contactSection,
  formatDateRange,
  initials,
  navigationSections,
  ownerName as contentOwnerName,
  phoneHref,
  renderedSections,
  sectionAnchor,
  sectionLabel,
  socialIconKey,
  splitParagraphs,
  whatsappHref,
  youtubeId,
} from "@/lib/portfolio/sections"
import type {
  PortfolioContent,
  Section,
  SectionOfType,
} from "@/lib/portfolio/types"

import {
  ContactForm,
  FloatingContact,
  GalleryGrid,
  QrCard,
  QrTabs,
  ReadMore,
  SaveContactButton,
  ShareButton,
} from "./studio-client"

import "./studio.css"

const SOCIAL_ICONS = {
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  whatsapp: IconBrandWhatsapp,
  linkedin: IconBrandLinkedin,
  youtube: IconBrandYoutube,
  twitter: IconBrandX,
  globe: IconGlobe,
} as const

type StudioRendererProps = {
  content: PortfolioContent
  media?: MediaMap
  preview?: boolean
  username?: string
}

export function StudioRenderer({
  content,
  media = {},
  preview = false,
  username = "",
}: StudioRendererProps) {
  const sections = renderedSections(content.sections)
  const hero = sections.find((section) => section.type === "hero")
  const navSections = navigationSections(content.sections)
  const businessName = contentBusinessName(content)
  const ownerName = contentOwnerName(content)
  const phone = contactPhone(content)
  const email = contactEmail(content)
  const address = contactAddress(content)
  const whatsapp = whatsappHref(content)
  const website = content.basics.website.trim()
  const heroImageId =
    content.basics.heroMediaId ||
    (hero?.type === "hero" ? hero.imageMediaId : null)
  const heroMeta = heroImageId ? media[heroImageId] : undefined
  const socials = socialsFromContent(content)
  const navItems = [
    { id: "hero", label: "Home" },
    ...navSections.map((section) => ({
      id: sectionAnchor(section.type),
      label: sectionLabel(section),
    })),
  ]
  const quickLinks = navSections.slice(0, 4)
  const supportSection = navSections.filter((section) =>
    ["contact", "payment", "qr"].includes(section.type)
  )
  const footerName = businessName
  const firstName = ownerName.split(/\s+/)[0] || ownerName

  return (
    <div
      className="pf-site"
      data-template="studio"
      data-appearance={content.design.appearance}
      data-font-pair={content.design.fontPair}
      data-corners={content.design.corners}
      data-backdrop={content.design.backdrop}
      data-preview={preview ? "true" : undefined}
      style={designStyle(content.design.accent)}
      id="pf-top"
    >
      <a className="pf-skip" href="#pf-main">
        Skip to content
      </a>

      <header className="pf-nav">
        <div className="pf-shell pf-nav-inner">
          <a className="pf-brand" href="#pf-top" aria-label="Back to top">
            {content.basics.logoMediaId && media[content.basics.logoMediaId] ? (
              <Image
                src={mediaHref(content.basics.logoMediaId)}
                alt=""
                width={44}
                height={44}
                className="pf-brand-logo"
              />
            ) : (
              <span className="pf-brand-mark" aria-hidden="true">
                {initials(businessName)}
              </span>
            )}
            <span className="pf-brand-name">{businessName}</span>
          </a>

          <nav className="pf-nav-links" aria-label="Sections">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pf-nav-actions">
            {whatsapp ? (
              <a
                className="pf-button pf-button-small"
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandWhatsapp />
                Chat on WhatsApp
              </a>
            ) : (
              <a className="pf-button pf-button-small" href="#section-contact">
                Get in touch
              </a>
            )}
          </div>

          <details className="pf-menu">
            <summary aria-label="Open navigation">
              <IconMenu2 className="pf-menu-icon-open" aria-hidden="true" />
              <IconX className="pf-menu-icon-close" aria-hidden="true" />
            </summary>
            <div className="pf-menu-panel">
              <p className="pf-menu-label">Browse</p>
              {navItems.map((item) => (
                <a key={item.id} href={`#${item.id}`}>
                  {item.label}
                </a>
              ))}
            </div>
          </details>
        </div>
      </header>

      <header
        className="pf-hero"
        id="section-hero"
        data-image={heroImageId ? "true" : undefined}
      >
        {heroImageId && heroMeta && isImageMime(heroMeta.mimeType) ? (
          <Image
            src={mediaHref(heroImageId)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="pf-hero-media"
          />
        ) : null}
        <div className="pf-hero-veil" aria-hidden="true" />
        <div className="pf-shell pf-hero-inner">
          <p className="pf-hero-eyebrow">
            {content.basics.headline ||
              content.basics.role ||
              "Welcome to our website"}
          </p>
          <h1>{businessName}</h1>
          <p className="pf-hero-sub">
            <strong>{ownerName}</strong>
            {content.basics.role ? (
              <>
                <span aria-hidden="true"> · </span>
                {content.basics.role}
              </>
            ) : null}
            {content.basics.tagline ? (
              <small>{content.basics.tagline}</small>
            ) : null}
          </p>
          <div className="pf-hero-actions">
            {whatsapp ? (
              <a
                className="pf-button"
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandWhatsapp />
                Chat on WhatsApp
              </a>
            ) : (
              <a className="pf-button" href="#section-contact">
                <IconMail />
                Get in touch
              </a>
            )}
            {phone ? (
              <a className="pf-button pf-button-ghost" href={phoneHref(phone) ?? "#"}>
                <IconPhone />
                Call us
              </a>
            ) : null}
            <a className="pf-button pf-button-ghost" href="#section-contact">
              <IconCalendar />
              Book an appointment
            </a>
          </div>
        </div>
      </header>

      <section className="pf-quick" aria-label="Quick actions">
        <div className="pf-shell">
          <div className="pf-quick-grid">
            {phone ? (
              <a className="pf-action" href={phoneHref(phone) ?? "#"}>
                <span className="pf-action-icon">
                  <IconPhone />
                </span>
                <span>Call us</span>
              </a>
            ) : null}
            {whatsapp ? (
              <a
                className="pf-action"
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="pf-action-icon">
                  <IconBrandWhatsapp />
                </span>
                <span>WhatsApp</span>
              </a>
            ) : null}
            {email ? (
              <a className="pf-action" href={`mailto:${email}`}>
                <span className="pf-action-icon">
                  <IconMail />
                </span>
                <span>Email us</span>
              </a>
            ) : null}
            {website ? (
              <a
                className="pf-action"
                href={website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="pf-action-icon">
                  <IconGlobe />
                </span>
                <span>Website</span>
              </a>
            ) : null}
            <ShareButton title={businessName} variant="action" />
            <SaveContactButton
              businessName={businessName}
              ownerName={ownerName}
              phone={phone}
              email={email}
              website={website}
            />
          </div>

          {socials.length ? (
            <div className="pf-quick-socials">
              <span>Connect with us:</span>
              {socials.map((item) => {
                const Icon = SOCIAL_ICONS[socialIconKey(item.platform)]
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.platform}
                  >
                    <Icon />
                  </a>
                )
              })}
            </div>
          ) : null}
        </div>
      </section>

      <main id="pf-main">
        {sections
          .filter((section) => section.type !== "hero")
          .map((section, index) => (
            <StudioSection
              key={section.id}
              section={section}
              content={content}
              media={media}
              index={index}
              username={username}
              socials={socials}
              preview={preview}
            />
          ))}
        {sections.length <= 1 && !hero ? (
          <div className="pf-empty-block">
            <p>This website is waiting for its first lines.</p>
          </div>
        ) : null}
      </main>

      <footer className="pf-footer">
        <div className="pf-shell">
          <div className="pf-footer-grid">
            <div>
              <h4>{footerName}</h4>
              <p>
                {content.basics.tagline ||
                  content.basics.headline ||
                  `${firstName}'s business, built with care.`}
              </p>
            </div>
            {quickLinks.length ? (
              <div>
                <h4>Quick links</h4>
                <ul>
                  {quickLinks.map((section) => (
                    <li key={section.id}>
                      <a href={`#${sectionAnchor(section.type)}`}>
                        {sectionLabel(section)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {supportSection.length ? (
              <div>
                <h4>Support and info</h4>
                <ul>
                  {supportSection.map((section) => (
                    <li key={section.id}>
                      <a href={`#${sectionAnchor(section.type)}`}>
                        {sectionLabel(section)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div>
              <h4>Reach us</h4>
              <p>
                {phone ? <a href={phoneHref(phone) ?? "#"}>{phone}</a> : null}
                {phone && email ? <br /> : null}
                {email ? <a href={`mailto:${email}`}>{email}</a> : null}
                {address ? (
                  <>
                    <br />
                    {address}
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div className="pf-footer-bottom">
            <span>
              © {new Date().getFullYear()} {footerName}. All rights reserved.
            </span>
            <span>
              Made with{" "}
              <a href={SITE_URL} rel="noopener noreferrer">
                {APP_NAME}
              </a>
            </span>
          </div>
        </div>
      </footer>

      <div className="pf-disclaimer">
        Platform disclaimer: the site owner is responsible for all content and
        transactions.{" "}
        <a href="mailto:abuse@folio.app">Report abuse</a>
      </div>

      {!preview ? (
        <FloatingContact
          whatsappUrl={whatsapp}
          ownerName={ownerName}
          phone={phone}
        />
      ) : null}
    </div>
  )
}

type SocialLinkItem = {
  id: string
  platform: string
  url: string
}

function socialsFromContent(content: PortfolioContent): SocialLinkItem[] {
  const section = content.sections.find((item) => item.type === "socials")
  if (section?.type === "socials") {
    return section.items.filter((item) => item.url.trim())
  }
  const contact = contactSection(content)
  if (!contact) return []
  return contact.links
    .filter((link) => link.url.trim())
    .map((link) => ({ id: link.id, platform: link.label, url: link.url }))
}

function StudioSection({
  section,
  content,
  media,
  index,
  username,
  socials,
  preview,
}: {
  section: Section
  content: PortfolioContent
  media: MediaMap
  index: number
  username: string
  socials: SocialLinkItem[]
  preview: boolean
}) {
  const title = sectionLabel(section)
  const alt = index % 2 === 1

  return (
    <section
      id={sectionAnchor(section.type)}
      className={alt ? "pf-section pf-section-alt" : "pf-section"}
    >
      <div className="pf-shell">
        {section.type === "about" ? (
          <AboutSection section={section} />
        ) : section.type === "mission" ? (
          <MissionSection section={section} title={title} />
        ) : section.type === "services" ? (
          <ServicesSection section={section} />
        ) : section.type === "events" ? (
          <EventsSection section={section} title={title} />
        ) : section.type === "products" ? (
          <ProductsSection section={section} media={media} title={title} />
        ) : section.type === "gallery" ? (
          <GallerySection section={section} media={media} title={title} />
        ) : section.type === "videos" ? (
          <VideosSection section={section} title={title} />
        ) : section.type === "payment" ? (
          <PaymentSection section={section} media={media} />
        ) : section.type === "socials" ? (
          <SocialsSection section={section} title={title} />
        ) : section.type === "contact" ? (
          <ContactSection
            section={section}
            username={username}
            socials={socials}
            preview={preview}
          />
        ) : section.type === "qr" ? (
          <QrSection
            section={section}
            content={content}
            username={username}
            socials={socials}
          />
        ) : (
          <LegacySection section={section} media={media} title={title} />
        )}
      </div>
    </section>
  )
}

function SectionHead({
  title,
  tag,
  intro,
  shareId,
}: {
  title: string
  tag?: string
  intro?: string
  shareId?: string
}) {
  return (
    <div className="pf-head">
      {tag ? <span className="pf-tag">{tag}</span> : null}
      <div className="pf-head-title">
        <h2>{title}</h2>
        <ShareButton title={title} label="Share" />
      </div>
      {intro ? <p>{intro}</p> : null}
      {shareId ? <span id={shareId} /> : null}
    </div>
  )
}

function AboutSection({ section }: { section: SectionOfType<"about"> }) {
  const paragraphs = splitParagraphs(section.body)
  return (
    <>
      <SectionHead
        title={section.title.trim() || "About us"}
        tag={section.tag}
      />
      <ReadMore>
        <div className="pf-about-body">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          {section.highlights.length ? (
            <ul className="pf-ticks">
              {section.highlights.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.message || section.messageTitle ? (
            <div className="pf-note">
              {section.messageTitle ? <strong>{section.messageTitle}</strong> : null}
              {section.message ? <p>{section.message}</p> : null}
            </div>
          ) : null}
        </div>
      </ReadMore>
    </>
  )
}

function MissionSection({
  section,
  title,
}: {
  section: SectionOfType<"mission">
  title: string
}) {
  return (
    <>
      <SectionHead title={title} intro={section.intro} />
      <div className="pf-cards pf-cards-three">
        {section.items.map((item) => (
          <article key={item.id} className="pf-card">
            <span className="pf-card-icon">
              <IconStar />
            </span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </>
  )
}

function ServicesSection({
  section,
}: {
  section: SectionOfType<"services">
}) {
  const contactHref = section.ctaUrl.trim() || "#section-contact"
  return (
    <>
      <SectionHead
        title={section.title.trim() || "How we can help"}
        intro={section.intro}
      />
      <div className="pf-cards">
        {section.items.map((item, index) => (
          <article key={item.id} className="pf-card">
            <span className="pf-step">{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
      {section.ctaText || section.ctaLabel ? (
        <div className="pf-join">
          <p>{section.ctaText}</p>
          <a className="pf-button" href={contactHref}>
            {section.ctaLabel || "Get in touch"}
          </a>
        </div>
      ) : null}
    </>
  )
}

function EventsSection({
  section,
  title,
}: {
  section: SectionOfType<"events">
  title: string
}) {
  return (
    <>
      <SectionHead title={title} intro={section.intro} />
      <div className="pf-cards">
        {section.items.map((item) => (
          <article key={item.id} className="pf-card">
            <div className="pf-event-date">
              <IconCalendar />
              {item.meta[0] ?? "Coming up"}
            </div>
            <h3>{item.title}</h3>
            {item.theme ? <strong className="pf-event-theme">{item.theme}</strong> : null}
            <p>{item.text}</p>
            {item.meta.length ? (
              <div className="pf-pills">
                {item.meta.map((pill, index) => (
                  <span key={index} className="pf-pill">
                    {pill}
                  </span>
                ))}
              </div>
            ) : null}
            {item.list.length ? (
              <ul className="pf-list">
                {item.list.map((entry, index) => (
                  <li key={index}>{entry}</li>
                ))}
              </ul>
            ) : null}
            {item.quote ? <blockquote>{item.quote}</blockquote> : null}
          </article>
        ))}
      </div>
    </>
  )
}

function ProductsSection({
  section,
  media,
  title,
}: {
  section: SectionOfType<"products">
  media: MediaMap
  title: string
}) {
  return (
    <>
      <SectionHead title={title} intro={section.intro} />
      <div className="pf-products">
        {section.items.map((item) => {
          const meta = item.imageMediaId ? media[item.imageMediaId] : undefined
          return (
            <article key={item.id} className="pf-product">
              <div className="pf-product-image">
                {item.imageMediaId && meta && isImageMime(meta.mimeType) ? (
                  <Image
                    src={mediaHref(item.imageMediaId)}
                    alt={item.title || "Product image"}
                    fill
                    sizes="(min-width: 900px) 33vw, 50vw"
                  />
                ) : (
                  <span>{initials(item.title || "Product")}</span>
                )}
              </div>
              <div className="pf-product-body">
                <div className="pf-product-head">
                  <h3>{item.title}</h3>
                  {item.price ? <strong>{item.price}</strong> : null}
                </div>
                <p>{item.description}</p>
                {item.url ? (
                  <a
                    className="pf-text-link"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View product
                  </a>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

function GallerySection({
  section,
  media,
  title,
}: {
  section: SectionOfType<"gallery">
  media: MediaMap
  title: string
}) {
  return (
    <>
      <SectionHead title={title} intro={section.intro} />
      <GalleryGrid
        items={section.items.map((item) => ({
          id: item.id,
          title: item.title,
          caption: item.caption,
          imageMediaId: item.imageMediaId,
        }))}
        media={media}
      />
    </>
  )
}

function VideosSection({
  section,
  title,
}: {
  section: SectionOfType<"videos">
  title: string
}) {
  return (
    <>
      <SectionHead title={title} intro={section.intro} />
      <div className="pf-videos">
        {section.items.map((item) => {
          const id = youtubeId(item.youtubeId)
          if (!id) return null
          return (
            <figure key={item.id}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}`}
                title={item.title || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
              {item.title ? <figcaption>{item.title}</figcaption> : null}
            </figure>
          )
        })}
      </div>
    </>
  )
}

function PaymentSection({
  section,
  media,
}: {
  section: SectionOfType<"payment">
  media: MediaMap
}) {
  const qrMeta = section.qrMediaId ? media[section.qrMediaId] : undefined
  const upiLink = section.upiId.trim()
    ? `upi://pay?pa=${encodeURIComponent(section.upiId.trim())}&pn=${encodeURIComponent(section.payeeName || section.heading)}&cu=INR`
    : ""

  return (
    <>
      <SectionHead
        title={section.title.trim() || "Payments"}
        intro={section.subtitle}
      />
      <div className="pf-pay">
        <h3>{section.heading || "Scan to pay"}</h3>
        {section.qrMediaId && qrMeta && isImageMime(qrMeta.mimeType) ? (
          <Image
            src={mediaHref(section.qrMediaId)}
            alt="Payment QR code"
            width={260}
            height={260}
            className="pf-pay-qr"
          />
        ) : upiLink ? (
          <QrCard
            text={upiLink}
            caption="Scan with any UPI app to pay."
            fileName="payment-qr.png"
          />
        ) : (
          <p className="pf-empty">Add a UPI ID or upload your payment QR code.</p>
        )}
        {section.upiId ? (
          <p className="pf-pay-upi">
            UPI ID: <strong>{section.upiId}</strong>
          </p>
        ) : null}
        {section.payeeName ? <p className="pf-pay-name">{section.payeeName}</p> : null}
      </div>
    </>
  )
}

function SocialsSection({
  section,
  title,
}: {
  section: SectionOfType<"socials">
  title: string
}) {
  return (
    <>
      <SectionHead title={title} intro={section.intro} />
      <div className="pf-social-grid">
        {section.items.map((item) => {
          const Icon = SOCIAL_ICONS[socialIconKey(item.platform)]
          return (
            <a
              key={item.id}
              className="pf-social"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="pf-social-icon">
                <Icon />
              </span>
              <span>{item.platform}</span>
            </a>
          )
        })}
      </div>
    </>
  )
}

function ContactSection({
  section,
  username,
  socials,
  preview,
}: {
  section: SectionOfType<"contact">
  username: string
  socials: SocialLinkItem[]
  preview: boolean
}) {
  const phone = section.phone || ""
  const whatsapp = section.whatsapp || section.phone
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`
    : null
  return (
    <>
      <SectionHead
        title={section.title.trim() || "Get in touch"}
        intro={section.subtitle || section.message}
      />
      <div className="pf-contact">
        <div className="pf-card pf-contact-info">
          <h3>Contact information</h3>
          {phone ? (
            <div className="pf-contact-item">
              <span className="pf-card-icon">
                <IconPhone />
              </span>
              <div>
                <h4>Call us</h4>
                <a href={phoneHref(phone) ?? "#"}>{phone}</a>
              </div>
            </div>
          ) : null}
          {waLink ? (
            <div className="pf-contact-item">
              <span className="pf-card-icon">
                <IconBrandWhatsapp />
              </span>
              <div>
                <h4>WhatsApp</h4>
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  Message us
                </a>
              </div>
            </div>
          ) : null}
          {section.email ? (
            <div className="pf-contact-item">
              <span className="pf-card-icon">
                <IconMail />
              </span>
              <div>
                <h4>Email</h4>
                <a href={`mailto:${section.email}`}>{section.email}</a>
              </div>
            </div>
          ) : null}
          {section.address ? (
            <div className="pf-contact-item">
              <span className="pf-card-icon">
                <IconMapPin />
              </span>
              <div>
                <h4>Address</h4>
                <span>{section.address}</span>
              </div>
            </div>
          ) : null}
          {socials.length ? (
            <div className="pf-contact-socials">
              {socials.map((item) => {
                const Icon = SOCIAL_ICONS[socialIconKey(item.platform)]
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    aria-label={item.platform}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon />
                  </a>
                )
              })}
            </div>
          ) : null}
        </div>

        <ContactForm
          username={username}
          title={section.formTitle}
          note={section.formNote}
          preview={preview}
        />
      </div>
    </>
  )
}

function QrSection({
  section,
  content,
  username,
  socials,
}: {
  section: SectionOfType<"qr">
  content: PortfolioContent
  username: string
  socials: SocialLinkItem[]
}) {
  const instagram =
    section.instagramUrl.trim() ||
    socials.find((item) => socialIconKey(item.platform) === "instagram")?.url ||
    ""
  const entries = [
    {
      id: "website",
      label: "Website link",
      text:
        section.websiteUrl.trim() ||
        (username ? `${SITE_URL}/p/${username}` : SITE_URL),
      caption: "Scan to visit our website instantly.",
    },
    {
      id: "whatsapp",
      label: "WhatsApp chat",
      text: section.whatsappUrl.trim() || whatsappHref(content) || "",
      caption: "Scan to message us directly on WhatsApp.",
    },
    {
      id: "instagram",
      label: "Instagram profile",
      text: instagram,
      caption: "Scan to follow us on Instagram.",
    },
  ].filter((entry) => entry.text.trim())

  return (
    <>
      <SectionHead title={section.title.trim() || "Scan and connect"} intro={section.intro} />
      <QrTabs entries={entries} />
    </>
  )
}

function LegacySection({
  section,
  media,
  title,
}: {
  section: Section
  media: MediaMap
  title: string
}) {
  switch (section.type) {
    case "projects":
      return (
        <>
          <SectionHead title={title} intro={section.intro} />
          <div className="pf-cards">
            {section.items.map((item) => {
              const meta = item.imageMediaId ? media[item.imageMediaId] : undefined
              return (
                <article key={item.id} className="pf-card pf-project">
                  {item.imageMediaId && meta && isImageMime(meta.mimeType) ? (
                    <div className="pf-project-image">
                      <Image
                        src={mediaHref(item.imageMediaId)}
                        alt={item.title}
                        fill
                        sizes="(min-width: 900px) 33vw, 100vw"
                      />
                    </div>
                  ) : null}
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.tags.length ? (
                    <div className="pf-pills">
                      {item.tags.map((tag) => (
                        <span key={tag} className="pf-pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {item.url ? (
                    <a
                      className="pf-text-link"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View project
                    </a>
                  ) : null}
                </article>
              )
            })}
          </div>
        </>
      )
    case "experience":
      return (
        <>
          <SectionHead title={title} />
          <div className="pf-rows">
            {section.items.map((item) => (
              <article key={item.id} className="pf-row">
                <div className="pf-row-date">
                  {formatDateRange(item.startDate, item.endDate, item.current)}
                </div>
                <div>
                  <h3>{item.role}</h3>
                  <p className="pf-row-org">
                    {item.company}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>
                  {item.description ? <p>{item.description}</p> : null}
                  {item.highlights.length ? (
                    <ul className="pf-ticks">
                      {item.highlights.map((entry, index) => (
                        <li key={index}>{entry}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </>
      )
    case "skills":
      return (
        <>
          <SectionHead title={title} intro={section.intro} />
          <div className="pf-cards">
            {section.groups.map((group) => (
              <article key={group.id} className="pf-card">
                <h3>{group.name}</h3>
                <div className="pf-pills">
                  {group.items.map((item) => (
                    <span key={item} className="pf-pill">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      )
    case "education":
      return (
        <>
          <SectionHead title={title} />
          <div className="pf-rows">
            {section.items.map((item) => (
              <article key={item.id} className="pf-row">
                <div className="pf-row-date">
                  {formatDateRange(item.startDate, item.endDate)}
                </div>
                <div>
                  <h3>{item.degree}</h3>
                  <p className="pf-row-org">
                    {item.institution}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>
                  {item.description ? <p>{item.description}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </>
      )
    case "certifications":
      return (
        <>
          <SectionHead title={title} />
          <div className="pf-cards">
            {section.items.map((item) => (
              <article key={item.id} className="pf-card">
                <h3>{item.name}</h3>
                <p className="pf-row-org">
                  {item.issuer}
                  {item.issueDate ? ` · ${item.issueDate}` : ""}
                </p>
                {item.credentialUrl ? (
                  <a
                    className="pf-text-link"
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View credential
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )
    case "testimonials":
      return (
        <>
          <SectionHead title={title} />
          <div className="pf-cards pf-cards-two">
            {section.items.map((item) => (
              <article key={item.id} className="pf-card pf-quote">
                <blockquote>{item.quote}</blockquote>
                <p className="pf-quote-author">
                  <strong>{item.name}</strong>
                  {item.role || item.company ? (
                    <span>
                      {item.role}
                      {item.role && item.company ? ", " : ""}
                      {item.company}
                    </span>
                  ) : null}
                </p>
              </article>
            ))}
          </div>
        </>
      )
    case "achievements":
      return (
        <>
          <SectionHead title={title} />
          <div className="pf-cards">
            {section.items.map((item) => (
              <article key={item.id} className="pf-card">
                <span className="pf-card-icon">
                  <IconChartBar />
                </span>
                <h3>{item.title}</h3>
                <p className="pf-row-org">
                  {item.issuer}
                  {item.date ? ` · ${item.date}` : ""}
                </p>
                {item.description ? <p>{item.description}</p> : null}
              </article>
            ))}
          </div>
        </>
      )
    case "resume":
      return (
        <>
          <SectionHead title={title} />
          <div className="pf-card pf-resume">
            {section.summary ? <p>{section.summary}</p> : null}
            {section.highlights.length ? (
              <ul className="pf-ticks">
                {section.highlights.map((entry, index) => (
                  <li key={index}>{entry}</li>
                ))}
              </ul>
            ) : null}
            {section.fileMediaId ? (
              <a className="pf-button" href={mediaDownloadHref(section.fileMediaId)}>
                <IconDownload />
                Download CV
              </a>
            ) : null}
          </div>
        </>
      )
    default:
      return null
  }
}
