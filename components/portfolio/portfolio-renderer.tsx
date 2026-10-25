import Image from "next/image"
import type { CSSProperties, ReactNode } from "react"

import { SECTION_LABELS } from "@/lib/portfolio/constants"
import { designStyle } from "@/lib/portfolio/colors"
import {
  formatDateRange,
  initials,
  navigationSections,
  phoneHref,
  renderedSections,
  sectionAnchor,
  splitParagraphs,
} from "@/lib/portfolio/sections"
import { getTemplate } from "@/lib/portfolio/templates"
import { SITE_URL } from "@/lib/config"
import {
  isImageMime,
  isPdfMime,
  mediaDownloadHref,
  mediaDimensions,
  mediaHref,
  type MediaMap,
  type MediaMeta,
} from "@/lib/portfolio/media"
import type {
  PortfolioContent,
  Section,
  SectionOfType,
} from "@/lib/portfolio/types"

import "./portfolio.css"

type PortfolioRendererProps = {
  content: PortfolioContent
  media?: MediaMap
  /** Disables smooth scrolling and branding links while inside the editor. */
  preview?: boolean
}

export function PortfolioRenderer({
  content,
  media = {},
  preview = false,
}: PortfolioRendererProps) {
  // const template = getTemplate(content.templateId)
  const sections = renderedSections(content.sections)
  const navSections = navigationSections(content.sections)
  const contact = navSections.find((section) => section.type === "contact")
  const firstName = content.basics.fullName.trim().split(/\s+/)[0] || "me"

  return (
    <div
      className="pf-site"
      data-template={content.templateId}
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
      <div className="pf-backdrop" aria-hidden="true" />

      <header className="pf-header">
        <div className="pf-shell pf-header-inner">
          <a className="pf-brand" href="#pf-top" aria-label="Back to top">
            <span className="pf-brand-mark" aria-hidden="true">
              {initials(content.basics.fullName)}
            </span>
            <span className="pf-brand-text">
              <span className="pf-brand-name">
                {content.basics.fullName || "Portfolio"}
              </span>
              {/* <span className="pf-brand-meta">
                {content.basics.headline || template.name}
              </span> */}
            </span>
          </a>

          <nav className="pf-nav" aria-label="Sections">
            {navSections.map((section) => (
              <a key={section.id} href={`#${sectionAnchor(section.type)}`}>
                {SECTION_LABELS[section.type]}
              </a>
            ))}
          </nav>

          <div className="pf-header-actions">
            {contact && contact.type === "contact" && contact.email ? (
              <a
                className="pf-button pf-button-small"
                href={`mailto:${contact.email}`}
              >
                Say hello
              </a>
            ) : (
              <a className="pf-button pf-button-small" href="#section-contact">
                Get in touch
              </a>
            )}
          </div>

          <details className="pf-menu">
            <summary aria-label="Open navigation">
              <span />
              <span />
            </summary>
            <div className="pf-menu-panel">
              <p className="pf-menu-label">Browse</p>
              {navSections.map((section) => (
                <a key={section.id} href={`#${sectionAnchor(section.type)}`}>
                  {SECTION_LABELS[section.type]}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
              <a className="pf-menu-contact" href="#section-contact">
                Start a conversation
              </a>
            </div>
          </details>
        </div>
      </header>

      <main id="pf-main">
        {sections.map((section, index) => (
          <SectionView
            key={section.id}
            section={section}
            content={content}
            media={media}
            index={index}
          />
        ))}
        {!sections.length ? (
          <div className="pf-empty">
            <p>This portfolio is waiting for its first lines.</p>
          </div>
        ) : null}
      </main>

      <footer className="pf-footer">
        <div className="pf-shell pf-footer-inner">
          <div>
            <p className="pf-footer-name">
              {content.basics.fullName || "Portfolio"}
            </p>
            <p className="pf-footer-note">
              {content.basics.headline || `A portfolio by ${firstName}.`}
            </p>
          </div>
          <div className="pf-footer-links">
            {content.basics.email ? (
              <a href={`mailto:${content.basics.email}`}>Email</a>
            ) : null}
            {content.basics.location ? (
              <span>{content.basics.location}</span>
            ) : null}
            <span>
              Made with{" "}
              <a href={SITE_URL} rel="noopener noreferrer">
                Folio
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SectionView({
  section,
  content,
  media,
  index,
}: {
  section: Section
  content: PortfolioContent
  media: MediaMap
  index: number
}) {
  if (section.type === "hero") {
    return <HeroSection section={section} content={content} media={media} />
  }

  const anchor = sectionAnchor(section.type)
  const isContact = section.type === "contact"

  return (
    <section
      id={anchor}
      className={`pf-section pf-section-${section.type}`}
      aria-labelledby={`${anchor}-title`}
    >
      <div className="pf-shell">
        {!isContact ? (
          <SectionHeading
            section={section}
            index={index}
            id={`${anchor}-title`}
          />
        ) : null}
        <SectionBody
          section={section}
          media={media}
          headingId={`${anchor}-title`}
        />
      </div>
    </section>
  )
}

function SectionHeading({
  section,
  index,
  id,
}: {
  section: Exclude<Section, { type: "hero" }>
  index: number
  id: string
}) {
  const title = section.title.trim() || SECTION_LABELS[section.type]
  const intro = "intro" in section ? section.intro : ""

  return (
    <div className="pf-section-head">
      <p className="pf-kicker">
        <span>{String(index).padStart(2, "0")}</span>
        {SECTION_LABELS[section.type]}
      </p>
      <h2 id={id}>{title}</h2>
      {intro ? <p className="pf-section-intro">{intro}</p> : null}
    </div>
  )
}

function SectionBody({
  section,
  media,
  headingId,
}: {
  section: Exclude<Section, { type: "hero" }>
  media: MediaMap
  headingId: string
}) {
  switch (section.type) {
    case "about":
      return <AboutBody section={section} />
    case "projects":
      return <ProjectsBody section={section} media={media} />
    case "experience":
      return <ExperienceBody section={section} />
    case "skills":
      return <SkillsBody section={section} />
    case "education":
      return <EducationBody section={section} />
    case "certifications":
      return <CertificationsBody section={section} />
    case "services":
      return <ServicesBody section={section} />
    case "testimonials":
      return <TestimonialsBody section={section} media={media} />
    case "achievements":
      return <AchievementsBody section={section} />
    case "resume":
      return <ResumeBody section={section} media={media} />
    case "contact":
      return <ContactBody section={section} headingId={headingId} />
  }
}

function HeroSection({
  section,
  content,
  media,
}: {
  section: SectionOfType<"hero">
  content: PortfolioContent
  media: MediaMap
}) {
  const heroImageId = section.imageMediaId ?? content.basics.avatarMediaId
  const heroImage = heroImageId ? media[heroImageId] : undefined
  const imageAvailable =
    heroImageId && heroImage && isImageMime(heroImage.mimeType)
  const name = content.basics.fullName.trim()
  const template = getTemplate(content.templateId)

  return (
    <section className="pf-hero" aria-labelledby="pf-hero-title">
      <div className="pf-shell pf-hero-grid">
        <div className="pf-hero-copy">
          <div className="pf-hero-topline">
            <span className="pf-hero-name">{name || "Your name"}</span>
            {section.availability ? (
              <span className="pf-hero-availability">
                <span className="pf-dot" aria-hidden="true" />
                {section.availability}
              </span>
            ) : null}
          </div>

          {section.eyebrow ? (
            <p className="pf-eyebrow">{section.eyebrow}</p>
          ) : null}

          <h1 id="pf-hero-title">
            {section.headline || name || "Hello, I'm glad you're here."}
          </h1>

          {section.subheadline ? (
            <p className="pf-hero-sub">{section.subheadline}</p>
          ) : null}

          {section.bio ? <p className="pf-hero-bio">{section.bio}</p> : null}

          <div className="pf-hero-actions">
            {section.primaryCtaLabel && section.primaryCtaUrl ? (
              <SmartLink href={section.primaryCtaUrl} className="pf-button">
                {section.primaryCtaLabel}
                <span aria-hidden="true">↗</span>
              </SmartLink>
            ) : null}
            {section.secondaryCtaLabel && section.secondaryCtaUrl ? (
              <SmartLink
                href={section.secondaryCtaUrl}
                className="pf-button pf-button-outline"
              >
                {section.secondaryCtaLabel}
              </SmartLink>
            ) : null}
          </div>

          <div className="pf-hero-meta">
            {section.location || content.basics.location ? (
              <span>{section.location || content.basics.location}</span>
            ) : null}
            {section.location && content.basics.location ? (
              <span aria-hidden="true">/</span>
            ) : null}
            <span className="pf-hero-meta-template">{template.name} folio</span>
          </div>
        </div>

        <div className="pf-hero-visual">
          <div className="pf-hero-frame">
            {imageAvailable ? (
              <PortfolioImage
                id={heroImageId}
                meta={heroImage}
                alt={name ? `Portrait of ${name}` : "Portrait"}
                className="pf-hero-image"
                priority
              />
            ) : (
              <div className="pf-hero-monogram" aria-hidden="true">
                <span>{initials(name)}</span>
                <small>{template.name}</small>
              </div>
            )}
            <span className="pf-hero-frame-label" aria-hidden="true">
              {content.basics.location || "Portfolio"}
            </span>
          </div>
          <div className="pf-hero-stamp" aria-hidden="true">
            <span>Est.</span>
            <span>2026</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function AboutBody({ section }: { section: SectionOfType<"about"> }) {
  const paragraphs = splitParagraphs(section.body)
  return (
    <div className="pf-about">
      <div className="pf-prose">
        {paragraphs.length ? (
          paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <p className="pf-placeholder">A short story about you goes here.</p>
        )}
      </div>
      {section.highlights.length ? (
        <ul className="pf-highlights">
          {section.highlights.map((highlight, index) => (
            <li key={index}>
              <span className="pf-check" aria-hidden="true">
                ✓
              </span>
              {highlight}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function ProjectsBody({
  section,
  media,
}: {
  section: SectionOfType<"projects">
  media: MediaMap
}) {
  return (
    <div className="pf-projects">
      {section.items.map((item, index) => {
        const image = item.imageMediaId ? media[item.imageMediaId] : undefined
        const hasImage =
          item.imageMediaId && image && isImageMime(image.mimeType)
        return (
          <article
            key={item.id}
            className="pf-project"
            data-featured={item.featured || undefined}
          >
            <div className="pf-project-visual">
              {hasImage ? (
                <PortfolioImage
                  id={item.imageMediaId!}
                  meta={image}
                  alt={item.title || "Project image"}
                  className="pf-project-image"
                />
              ) : (
                <div className="pf-project-art" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i />
                </div>
              )}
            </div>
            <div className="pf-project-body">
              <div className="pf-project-meta">
                <span>{item.year || SECTION_LABELS.projects}</span>
                {item.featured ? (
                  <span className="pf-featured">Featured</span>
                ) : null}
              </div>
              <h3>{item.title || "Untitled project"}</h3>
              {item.description ? <p>{item.description}</p> : null}
              {item.tags.length ? (
                <ul className="pf-tags" aria-label="Project tags">
                  {item.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              ) : null}
              <div className="pf-project-links">
                {item.url ? (
                  <SmartLink href={item.url}>
                    Visit project <span aria-hidden="true">↗</span>
                  </SmartLink>
                ) : null}
                {item.repoUrl ? (
                  <SmartLink href={item.repoUrl}>
                    Source <span aria-hidden="true">↗</span>
                  </SmartLink>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function ExperienceBody({ section }: { section: SectionOfType<"experience"> }) {
  return (
    <ol className="pf-timeline">
      {section.items.map((item) => (
        <li key={item.id} className="pf-timeline-item">
          <div className="pf-timeline-date">
            {formatDateRange(item.startDate, item.endDate, item.current)}
          </div>
          <div className="pf-timeline-content">
            <div className="pf-timeline-heading">
              <h3>{item.role || "Role"}</h3>
              <span>{item.company}</span>
            </div>
            {item.location ? (
              <p className="pf-timeline-location">{item.location}</p>
            ) : null}
            {item.description ? <p>{item.description}</p> : null}
            {item.highlights.length ? (
              <ul className="pf-list">
                {item.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

function SkillsBody({ section }: { section: SectionOfType<"skills"> }) {
  return (
    <div className="pf-skills">
      {section.groups.map((group, index) => (
        <div key={group.id} className="pf-skill-group">
          <p className="pf-skill-index">{String(index + 1).padStart(2, "0")}</p>
          <h3>{group.name || "Skills"}</h3>
          <ul className="pf-chips">
            {group.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function EducationBody({ section }: { section: SectionOfType<"education"> }) {
  return (
    <div className="pf-rows">
      {section.items.map((item) => (
        <article key={item.id} className="pf-row">
          <div className="pf-row-date">
            {formatDateRange(item.startDate, item.endDate)}
          </div>
          <div className="pf-row-main">
            <h3>{item.degree || "Qualification"}</h3>
            <p className="pf-row-org">
              {item.institution}
              {item.location ? ` · ${item.location}` : ""}
            </p>
            {item.description ? <p>{item.description}</p> : null}
          </div>
        </article>
      ))}
    </div>
  )
}

function CertificationsBody({
  section,
}: {
  section: SectionOfType<"certifications">
}) {
  return (
    <div className="pf-rows">
      {section.items.map((item) => (
        <article key={item.id} className="pf-row pf-row-compact">
          <div className="pf-row-date">{item.issueDate}</div>
          <div className="pf-row-main">
            <h3>{item.name || "Certification"}</h3>
            {item.issuer ? <p className="pf-row-org">{item.issuer}</p> : null}
          </div>
          {item.credentialUrl ? (
            <SmartLink href={item.credentialUrl} className="pf-row-link">
              View credential <span aria-hidden="true">↗</span>
            </SmartLink>
          ) : null}
        </article>
      ))}
    </div>
  )
}

function ServicesBody({ section }: { section: SectionOfType<"services"> }) {
  return (
    <div className="pf-services">
      {section.items.map((item, index) => (
        <article key={item.id} className="pf-service">
          <span className="pf-service-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3>{item.title || "Service"}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  )
}

function TestimonialsBody({
  section,
  media,
}: {
  section: SectionOfType<"testimonials">
  media: MediaMap
}) {
  return (
    <div className="pf-testimonials">
      {section.items.map((item) => {
        const avatar = item.avatarMediaId
          ? media[item.avatarMediaId]
          : undefined
        return (
          <figure key={item.id} className="pf-testimonial">
            <span className="pf-quote" aria-hidden="true">
              “
            </span>
            <blockquote>{item.quote}</blockquote>
            <figcaption>
              <span className="pf-avatar">
                {avatar &&
                item.avatarMediaId &&
                isImageMime(avatar.mimeType) ? (
                  <PortfolioImage
                    id={item.avatarMediaId}
                    meta={avatar}
                    alt={item.name}
                    className="pf-avatar-image"
                  />
                ) : (
                  initials(item.name)
                )}
              </span>
              <span>
                <strong>{item.name}</strong>
                <small>
                  {[item.role, item.company].filter(Boolean).join(", ")}
                </small>
              </span>
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}

function AchievementsBody({
  section,
}: {
  section: SectionOfType<"achievements">
}) {
  return (
    <div className="pf-achievements">
      {section.items.map((item) => (
        <article key={item.id} className="pf-achievement">
          <div className="pf-achievement-mark" aria-hidden="true">
            ✦
          </div>
          <div>
            <div className="pf-achievement-meta">
              <span>
                {[item.issuer, item.date].filter(Boolean).join(" · ")}
              </span>
            </div>
            <h3>{item.title || "Achievement"}</h3>
            {item.description ? <p>{item.description}</p> : null}
          </div>
        </article>
      ))}
    </div>
  )
}

function ResumeBody({
  section,
  media,
}: {
  section: SectionOfType<"resume">
  media: MediaMap
}) {
  const file = section.fileMediaId ? media[section.fileMediaId] : undefined
  const hasFile = Boolean(
    section.fileMediaId && file && isPdfMime(file.mimeType)
  )

  return (
    <div className="pf-resume">
      <div className="pf-resume-main">
        {section.summary ? (
          <p className="pf-resume-summary">{section.summary}</p>
        ) : null}
        {section.highlights.length ? (
          <ul className="pf-list">
            {section.highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {hasFile ? (
        <a
          className="pf-button pf-button-outline"
          href={mediaDownloadHref(section.fileMediaId!)}
        >
          Download CV
          <span className="pf-file-type">PDF</span>
        </a>
      ) : (
        <p className="pf-resume-note">Full CV available on request.</p>
      )}
    </div>
  )
}

function ContactBody({
  section,
  headingId,
}: {
  section: SectionOfType<"contact">
  headingId: string
}) {
  const title = section.title.trim() || "Let's work together"
  const tel = phoneHref(section.phone)
  return (
    <div className="pf-contact">
      <div className="pf-contact-copy">
        <p className="pf-kicker">
          <span>Contact</span>
          {section.location || "Elsewhere"}
        </p>
        <h2 id={headingId}>{title}</h2>
        {section.message ? <p>{section.message}</p> : null}
        <div className="pf-contact-actions">
          {section.email ? (
            <a className="pf-button" href={`mailto:${section.email}`}>
              Email me
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          {tel ? (
            <a className="pf-button pf-button-outline" href={tel}>
              {section.phone}
            </a>
          ) : null}
        </div>
      </div>
      <div className="pf-contact-side">
        {section.links.length ? (
          <ul className="pf-contact-links">
            {section.links.map((link) => (
              <li key={link.id}>
                <SmartLink href={link.url}>
                  <span>{link.label}</span>
                  <span aria-hidden="true">↗</span>
                </SmartLink>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

function PortfolioImage({
  id,
  meta,
  alt,
  className,
  priority,
}: {
  id: string
  meta: MediaMeta | undefined
  alt: string
  className?: string
  priority?: boolean
}) {
  const { width, height } = mediaDimensions(meta)
  return (
    <Image
      src={mediaHref(id)}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={className}
      sizes="(max-width: 720px) 100vw, 50vw"
      style={{ "--pf-image-ratio": `${width} / ${height}` } as CSSProperties}
    />
  )
}

function SmartLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  const external = /^https?:\/\//i.test(href)
  return (
    <a
      href={href}
      className={className}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer nofollow" }
        : {})}
    >
      {children}
    </a>
  )
}
