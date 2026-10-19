import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Buildings,
  Certificate,
  ChatCircleText,
  Code,
  EnvelopeSimple,
  FileText,
  GraduationCap,
  Sparkle,
  Trophy,
  UserCircle,
  UsersThree,
  Wrench,
} from "@phosphor-icons/react";
import Image from "next/image";
import type { Portfolio, PortfolioSection } from "@/lib/portfolio/schema";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sectionCopy(section?: PortfolioSection) {
  return text(section?.content.body) || text(section?.content.headline);
}

function SafeImage({ section }: { section?: PortfolioSection }) {
  const imageUrl = text(section?.content.imageUrl);
  if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
    return (
      <Image
        className="showcase-image"
        src={imageUrl}
        alt={
          text(section?.content.imageAlt) ||
          section?.title ||
          "Portfolio image"
        }
        width={1200}
        height={800}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`showcase-art showcase-art-${section?.type ?? "default"}`}
      aria-hidden="true"
    >
      <span>{section?.title.slice(0, 1).toUpperCase() || "F"}</span>
      <i />
      <i />
      <i />
    </div>
  );
}

function SectionIcon({ type }: { type: PortfolioSection["type"] }) {
  const props = { "aria-hidden": true, weight: "regular" as const };
  switch (type) {
    case "experience": return <Briefcase {...props} />;
    case "education": return <GraduationCap {...props} />;
    case "skills": return <Code {...props} />;
    case "services": return <Wrench {...props} />;
    case "certifications": return <Certificate {...props} />;
    case "achievements": return <Trophy {...props} />;
    case "testimonials": return <ChatCircleText {...props} />;
    case "team": return <UsersThree {...props} />;
    case "contact": return <EnvelopeSimple {...props} />;
    case "resume": return <FileText {...props} />;
    case "projects":
    case "case-studies": return <BookOpen {...props} />;
    default: return <Sparkle {...props} />;
  }
}

export function PortfolioShowcase({ portfolio }: { portfolio: Portfolio }) {
  const sections = portfolio.sections.filter((section) => section.visible);
  const hero = sections.find((section) => section.type === "hero");
  const supporting = sections.filter(
    (section) => section.type !== "hero" && section.type !== "contact",
  );
  const contactSection = sections.find(
    (section) => section.type === "contact",
  );
  const heroTitle = text(hero?.content.headline) || portfolio.name;
  const heroSubtitle =
    text(hero?.content.subtitle) ||
    `A selection of work, ideas, and things I care about.`;
  const navigation = supporting.slice(0, 4);
  const firstWork = supporting.find(
    (section) =>
      section.type === "projects" || section.type === "case-studies",
  );
  const projectCount = supporting.filter(
    (section) =>
      section.type === "projects" || section.type === "case-studies",
  ).length;
  const contactUrl = text(contactSection?.content.url);
  const contactCopy = sectionCopy(contactSection);

  return (
    <div
      className={`portfolio-showcase showcase-${portfolio.template}`}
      role="region"
      aria-label={`${portfolio.name} portfolio`}
      style={
        {
          "--portfolio-accent": portfolio.accent,
        } as React.CSSProperties
      }
    >
      <div className="showcase-shell">
        <nav className="showcase-nav" aria-label="Portfolio navigation">
          <a
            className="showcase-monogram"
            href="#top"
            aria-label={`${portfolio.name}, home`}
          >
            {portfolio.name.slice(0, 1).toUpperCase()}
          </a>
          <a className="showcase-nav-name" href="#top">
            {portfolio.name}
          </a>
          <div className="showcase-nav-links">
            {navigation.map((section) => (
              <a key={section.id} href={`#section-${section.id}`}>
                {section.title}
              </a>
            ))}
          </div>
          {contactSection && (
            <a className="showcase-contact-link" href="#contact">
              Let’s talk <ArrowUpRight aria-hidden="true" weight="regular" />
            </a>
          )}
        </nav>

        <header className="showcase-hero" id="top">
          <div className="showcase-hero-copy">
            <span className="showcase-kicker">
              <i />
              {portfolio.kind === "organization"
                ? "ORGANIZATION · SELECTED WORK"
                : "PORTFOLIO · SELECTED WORK"}
            </span>
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
            <a
              className="showcase-work-link"
              href={
                supporting.length
                  ? `#section-${firstWork?.id ?? supporting[0].id}`
                  : "#top"
              }
            >
              {firstWork
                ? "Explore selected work"
                : supporting.length
                  ? "Explore my portfolio"
                  : "Back to introduction"}{" "}
              <ArrowDown aria-hidden="true" weight="regular" />
            </a>
            <div className="showcase-hero-meta">
              {projectCount > 0 && (
                <span>
                  <Briefcase aria-hidden="true" weight="regular" />
                  {projectCount} featured{" "}
                  {projectCount === 1
                    ? "project"
                    : "projects"}
                </span>
              )}
              <span>
                {portfolio.kind === "organization" ? <Buildings aria-hidden="true" weight="regular" /> : <UserCircle aria-hidden="true" weight="regular" />}
                {portfolio.kind === "organization"
                  ? "Organization portfolio"
                  : "Personal portfolio"}
              </span>
            </div>
          </div>
          <div className="showcase-hero-visual">
            <SafeImage section={hero ?? sections[0]} />
            <span className="showcase-visual-caption">
              {portfolio.name} <b>— 01</b>
            </span>
          </div>
          <span className="showcase-side-note">
            WORK · EXPERIENCE · IDEAS
          </span>
        </header>

        <div className="showcase-intro-line">
          <span>Scroll to explore</span>
          <span>
            01 — {String(supporting.length + 1).padStart(2, "0")}
          </span>
        </div>

        {supporting.map((section, index) => {
          const copy = sectionCopy(section);
          const image = text(section.content.imageUrl);
          const url = text(section.content.url);
          const isWork =
            section.type === "projects" ||
            section.type === "case-studies";
          const isList = [
            "skills",
            "services",
            "certifications",
            "achievements",
          ].includes(section.type);
          const items = copy
            .split(/[\n,;]/)
            .map((item) => item.trim())
            .filter(Boolean);

          return (
            <section
              className={`showcase-section showcase-section-${section.type}`}
              id={`section-${section.id}`}
              key={section.id}
            >
              <div className="showcase-section-heading">
                <span>
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {section.title.toUpperCase()}
                </span>
                <i />
              </div>
              {isWork ? (
                <article
                  className="showcase-project-card"
                  id={
                    section.type === "projects"
                      ? "work"
                      : undefined
                  }
                >
                  <div className="showcase-project-visual">
                    <SafeImage section={section} />
                    <span className="showcase-project-index">
                      PROJECT{" "}
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="showcase-project-copy">
                    <span className="showcase-project-type">
                      FEATURED PROJECT
                    </span>
                    <h2>{section.title}</h2>
                    {copy && <p>{copy}</p>}
                    <div className="showcase-project-footer">
                      <span>
                        {text(
                          section.content.category,
                        ) || "Selected work"}
                      </span>
                      {url &&
                        /^https?:\/\//i.test(url) && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            View project{" "}
                            <ArrowUpRight aria-hidden="true" weight="regular" />
                          </a>
                        )}
                    </div>
                  </div>
                </article>
              ) : (
                <div
                  className={`showcase-content-grid ${isList ? "showcase-content-list" : ""}`}
                >
                  <div className="showcase-section-copy">
                    <span className="showcase-section-mark">
                      <SectionIcon type={section.type} />
                    </span>
                    <h2>{section.title}</h2>
                    {copy && <p>{copy}</p>}
                    {url && /^https?:\/\//i.test(url) && (
                      <a
                        className="showcase-inline-link"
                        href={url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Explore more{" "}
                        <ArrowUpRight aria-hidden="true" weight="regular" />
                      </a>
                    )}
                  </div>
                  {isList && items.length > 1 ? (
                    <ul className="showcase-pill-list">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : image && /^https?:\/\//i.test(image) ? (
                    <SafeImage section={section} />
                  ) : (
                    <div className="showcase-note-card">
                      <span>A POINT OF VIEW</span>
                      <strong>
                        {text(
                          section.content.headline,
                        ) ||
                          copy ||
                          section.title}
                      </strong>
                      <i>“</i>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {contactSection && (
          <section className="showcase-contact" id="contact">
            <span className="showcase-kicker">
              <i />
              HAVE A GOOD ONE IN MIND?
            </span>
            <h2>
              Let’s make
              <br />
              <em>something matter.</em>
            </h2>
            <p>
              {contactCopy ||
                "Have a project, a question, or just want to say hello?"}
            </p>
            {contactUrl && /^https?:\/\//i.test(contactUrl) && (
              <a
                href={contactUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Get in touch <ArrowUpRight aria-hidden="true" weight="regular" />
              </a>
            )}
          </section>
        )}
        <footer className="showcase-footer">
          <a href="#top">{portfolio.name}</a>
          <span>Thoughtfully made with Forme</span>
          <a href="#top">Back to top ↑</a>
        </footer>
      </div>
    </div>
  );
}
