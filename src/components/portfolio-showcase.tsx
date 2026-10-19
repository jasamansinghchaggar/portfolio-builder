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
} from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';
import type { Portfolio, PortfolioSection } from '@/lib/portfolio/schema';
import { cn } from '@/lib/utils';

const ui = {
  root: '@container/showcase relative min-h-screen bg-[#f7f6f2] px-7 pb-9 text-[#24231f] [--accent:var(--portfolio-accent,#bc6545)] [font-family:var(--sans)] max-[760px]:px-[18px] max-[480px]:px-[14px]',
  shell: 'mx-auto w-full min-w-0 max-w-[1180px]',
  nav: 'flex h-[82px] min-w-0 items-center gap-[14px] border-b border-[#deddd6] @max-[760px]/showcase:h-[66px] @max-[760px]/showcase:gap-2',
  monogram:
    'grid size-[34px] shrink-0 place-items-center rounded-full bg-[var(--accent)] font-[family-name:var(--serif)] text-[15px] font-semibold text-white',
  navName:
    'min-w-0 max-w-[42%] truncate text-[13px] font-semibold tracking-[-.02em] @max-[760px]/showcase:text-xs @max-[760px]/showcase:max-w-[42%]',
  navLinks: 'ml-auto flex gap-7 @max-[760px]/showcase:hidden',
  navLink: 'text-[11px] text-[#77746d] transition-colors hover:text-[var(--accent)]',
  contactLink:
    'ml-7 inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-[#24231f] transition-colors hover:text-[var(--accent)] [&_svg]:size-3.5 @max-[760px]/showcase:ml-auto @max-[760px]/showcase:gap-[3px] @max-[760px]/showcase:text-[10px] @max-[760px]/showcase:whitespace-nowrap',
  hero: 'relative grid min-h-[590px] min-w-0 grid-cols-[1fr_.82fr] items-center gap-[8%] px-[4%] py-16 pb-[74px] @max-[760px]/showcase:min-h-0 @max-[760px]/showcase:grid-cols-1 @max-[760px]/showcase:gap-[30px] @max-[760px]/showcase:px-[2%] @max-[760px]/showcase:py-[42px] @max-[760px]/showcase:pb-[46px]',
  heroCopy: 'relative z-10 min-w-0',
  kicker:
    'inline-flex items-center gap-[9px] text-[9px] font-bold tracking-[.15em] text-[#77746d] [&_i]:block [&_i]:size-[7px] [&_i]:rounded-full [&_i]:bg-[var(--accent)]',
  heroTitle:
    'my-6 mb-5 max-w-[650px] break-words font-[family-name:var(--serif)] text-[clamp(42px,8vw,100px)] leading-[.99] font-medium tracking-[-.065em] text-[#24231f] @max-[760px]/showcase:text-[clamp(42px,13vw,64px)] @max-[760px]/showcase:tracking-[-.055em]',
  heroSubtitle:
    'm-0 max-w-[420px] text-[15px] leading-[1.8] text-[#77746d] @max-[760px]/showcase:text-[13px]',
  workLink:
    'mt-[30px] inline-flex items-center gap-3 rounded-full bg-[#24231f] px-[17px] py-[13px] text-[10px] font-semibold text-white [&_svg]:size-3.5',
  heroMeta:
    'mt-[42px] flex flex-wrap gap-5 text-[9px] text-[#77746d] @max-[760px]/showcase:mt-7 @max-[760px]/showcase:gap-3 @max-[760px]/showcase:text-[8px]',
  heroMetaItem:
    'flex items-center gap-1.5 [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:text-[var(--accent)]',
  heroVisual:
    'relative h-[min(50vw,480px)] min-h-[400px] overflow-hidden rounded-[48%_48%_8px_8px] bg-[#e7e2d8] @max-[760px]/showcase:mx-auto @max-[760px]/showcase:h-[300px] @max-[760px]/showcase:min-h-[240px] @max-[760px]/showcase:w-full',
  image: 'block size-full object-cover',
  art: 'relative grid min-h-[320px] place-items-center overflow-hidden bg-[linear-gradient(145deg,color-mix(in_srgb,var(--accent),white_80%),#e6ded1)] [&>span]:relative [&>span]:z-[1] [&>span]:font-[family-name:var(--serif)] [&>span]:text-[clamp(110px,20vw,250px)] [&>span]:leading-none [&>span]:tracking-[-.1em] [&>span]:text-[color-mix(in_srgb,var(--accent),transparent_35%)] [&>i]:absolute [&>i]:block [&>i]:size-[62%] [&>i]:rotate-[-25deg] [&>i]:rounded-full [&>i]:border [&>i]:border-[color-mix(in_srgb,var(--accent),transparent_72%)] [&>i:nth-of-type(1)]:h-[48%] [&>i:nth-of-type(1)]:w-[78%] [&>i:nth-of-type(1)]:rotate-[25deg] [&>i:nth-of-type(2)]:h-[78%] [&>i:nth-of-type(2)]:w-[48%] [&>i:nth-of-type(2)]:rotate-[25deg] [&>i:nth-of-type(3)]:top-[12%] [&>i:nth-of-type(3)]:right-[12%] [&>i:nth-of-type(3)]:size-[22%] [&>i:nth-of-type(3)]:border-0 [&>i:nth-of-type(3)]:bg-[color-mix(in_srgb,var(--accent),transparent_82%)]',
  caption:
    'absolute inset-x-[18px] bottom-4 flex justify-between text-[9px] tracking-[.04em] text-white [text-shadow:0_1px_8px_#0007]',
  sideNote:
    'absolute top-1/2 right-[-4px] text-[8px] tracking-[.2em] text-[#8c8880] [writing-mode:vertical-rl] @max-[760px]/showcase:hidden',
  intro:
    'flex justify-between border-y border-[#deddd6] px-[4%] py-[14px] text-[8px] tracking-[.12em] text-[#89867e] uppercase',
  section:
    'min-w-0 scroll-mt-6 border-b border-[#deddd6] px-[4%] pt-[74px] pb-20 @max-[760px]/showcase:px-[2%] @max-[760px]/showcase:py-[54px]',
  sectionHeading:
    'mb-7 flex items-center gap-[15px] text-[8px] font-bold tracking-[.16em] text-[#858178] [&_i]:h-px [&_i]:w-[38px] [&_i]:bg-[var(--accent)]',
  projectCard:
    'grid min-w-0 min-h-[380px] grid-cols-[1.1fr_.9fr] bg-[#efede7] @max-[760px]/showcase:min-h-0 @max-[760px]/showcase:grid-cols-1',
  projectVisual:
    'relative min-h-[340px] overflow-hidden bg-[#e7e2d8] @max-[760px]/showcase:min-h-[220px]',
  projectIndex:
    'absolute top-[18px] left-[18px] text-[8px] tracking-[.12em] text-white [text-shadow:0_1px_8px_#0007]',
  projectCopy:
    'flex min-w-0 flex-col justify-center p-[clamp(24px,5vw,70px)] @max-[760px]/showcase:p-6',
  projectType: 'text-[8px] font-bold tracking-[.15em] text-[var(--accent)]',
  h2: 'my-[14px] break-words font-[family-name:var(--serif)] text-[clamp(30px,4vw,48px)] leading-[1.08] font-medium tracking-[-.04em]',
  paragraph: 'whitespace-pre-line text-xs leading-[1.8] text-[#77746d] [&_a]:break-words',
  projectFooter:
    'mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#d9d6ce] pt-[14px] text-[9px] text-[#858178] [&_a]:inline-flex [&_a]:max-w-full [&_a]:items-center [&_a]:gap-1.5 [&_a]:break-words [&_a]:font-semibold [&_a]:text-[#24231f] [&_svg]:size-3.5',
  contentGrid:
    'grid min-w-0 min-h-[240px] grid-cols-[1fr_.85fr] items-center gap-[12%] @max-[760px]/showcase:min-h-0 @max-[760px]/showcase:grid-cols-1 @max-[760px]/showcase:gap-[25px]',
  sectionCopy:
    'max-w-[580px] min-w-0 [&_h2]:my-[14px] [&_h2]:break-words [&_h2]:font-[family-name:var(--serif)] [&_h2]:text-[clamp(38px,5vw,64px)] [&_h2]:leading-[1.08] [&_h2]:font-medium [&_h2]:tracking-[-.04em] @max-[760px]/showcase:[&_h2]:text-[32px] [&_p]:whitespace-pre-line [&_p]:text-xs [&_p]:leading-[1.8] [&_p]:text-[#77746d]',
  sectionMark:
    'grid size-9 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent),white_88%)] text-[var(--accent)] [&_svg]:size-4',
  inlineLink:
    'mt-4 inline-flex max-w-full items-center gap-1.5 break-words text-xs font-semibold text-[#24231f] [&_svg]:size-3.5',
  noteCard:
    'relative flex min-h-[210px] min-w-0 flex-col justify-between overflow-hidden bg-[#ebe8df] p-[30px] @max-[760px]/showcase:min-h-[150px] @max-[760px]/showcase:p-[22px] [&>span]:text-[8px] [&>span]:tracking-[.15em] [&>span]:text-[#858178] [&>strong]:relative [&>strong]:z-[1] [&>strong]:max-w-[320px] [&>strong]:break-words [&>strong]:font-[family-name:var(--serif)] [&>strong]:text-[clamp(22px,3vw,34px)] [&>strong]:leading-[1.2] [&>strong]:font-medium [&>strong]:whitespace-pre-line [&>i]:absolute [&>i]:right-4 [&>i]:bottom-[-80px] [&>i]:font-serif [&>i]:text-[260px] [&>i]:leading-[.8] [&>i]:text-[color-mix(in_srgb,var(--accent),transparent_80%)]',
  pillList:
    'm-0 flex list-none flex-wrap gap-[9px] p-0 [&>li]:rounded-full [&>li]:border [&>li]:border-[#deddd6] [&>li]:bg-[#fbfaf7] [&>li]:px-[14px] [&>li]:py-[10px] [&>li]:text-[10px] [&>li]:text-[#57544e]',
  contact:
    'mx-[4%] mt-[78px] mb-7 bg-[#24231f] p-[clamp(26px,7vw,84px)] text-white @max-[760px]/showcase:mx-[2%] @max-[760px]/showcase:mt-[42px] @max-[760px]/showcase:mb-[18px] [&_h2]:my-[22px] [&_h2]:break-words [&_h2]:font-[family-name:var(--serif)] [&_h2]:text-[clamp(38px,8vw,92px)] [&_h2]:leading-[.98] [&_h2]:font-medium [&_h2]:tracking-[-.06em] [&_h2_em]:font-medium [&_h2_em]:text-[var(--accent)] [&_p]:text-xs [&_p]:text-[#c5c1b7] [&_a]:mt-[15px] [&_a]:inline-flex [&_a]:max-w-full [&_a]:items-center [&_a]:gap-2.5 [&_a]:break-words [&_a]:rounded-full [&_a]:bg-[var(--accent)] [&_a]:px-[18px] [&_a]:py-[13px] [&_a]:text-[10px] [&_a]:font-semibold [&_a]:text-white [&_svg]:size-3.5 @max-[760px]/showcase:[&_h2]:text-[clamp(38px,12vw,58px)] @max-[480px]/showcase:p-[28px_22px]',
  footer:
    'flex flex-wrap items-center justify-between gap-3 px-[4%] pt-[26px] text-[9px] text-[#89867e] @max-[480px]/showcase:justify-center [&_a:first-child]:font-bold [&_a:first-child]:text-[#24231f] [&_span]:max-w-full [&_span]:text-center',
};

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function sectionCopy(section?: PortfolioSection) {
  return text(section?.content.body) || text(section?.content.headline);
}

function SafeImage({ section, className }: { section?: PortfolioSection; className?: string }) {
  const imageUrl = text(section?.content.imageUrl);
  if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
    return (
      <Image
        className={cn('block size-full object-cover', className)}
        src={imageUrl}
        alt={text(section?.content.imageAlt) || section?.title || 'Portfolio image'}
        width={1200}
        height={800}
        loading="lazy"
        unoptimized
      />
    );
  }
  return (
    <div className={cn(ui.art, className)} aria-hidden="true">
      <span>{section?.title.slice(0, 1).toUpperCase() || 'F'}</span>
      <i />
      <i />
      <i />
    </div>
  );
}

function SectionIcon({ type }: { type: PortfolioSection['type'] }) {
  const props = { 'aria-hidden': true, weight: 'regular' as const };
  switch (type) {
    case 'experience':
      return <Briefcase {...props} />;
    case 'education':
      return <GraduationCap {...props} />;
    case 'skills':
      return <Code {...props} />;
    case 'services':
      return <Wrench {...props} />;
    case 'certifications':
      return <Certificate {...props} />;
    case 'achievements':
      return <Trophy {...props} />;
    case 'testimonials':
      return <ChatCircleText {...props} />;
    case 'team':
      return <UsersThree {...props} />;
    case 'contact':
      return <EnvelopeSimple {...props} />;
    case 'resume':
      return <FileText {...props} />;
    case 'projects':
    case 'case-studies':
      return <BookOpen {...props} />;
    default:
      return <Sparkle {...props} />;
  }
}

export function PortfolioShowcase({
  portfolio,
  preview = false,
  mobilePreview = false,
}: {
  portfolio: Portfolio;
  preview?: boolean;
  mobilePreview?: boolean;
}) {
  const sections = portfolio.sections.filter((section) => section.visible);
  const hero = sections.find((section) => section.type === 'hero');
  const supporting = sections.filter(
    (section) => section.type !== 'hero' && section.type !== 'contact',
  );
  const contactSection = sections.find((section) => section.type === 'contact');
  const heroTitle = text(hero?.content.headline) || portfolio.name;
  const heroSubtitle =
    text(hero?.content.subtitle) || `A selection of work, ideas, and things I care about.`;
  const navigation = supporting.slice(0, 4);
  const firstWork = supporting.find(
    (section) => section.type === 'projects' || section.type === 'case-studies',
  );
  const projectCount = supporting.filter(
    (section) => section.type === 'projects' || section.type === 'case-studies',
  ).length;
  const contactUrl = text(contactSection?.content.url);
  const contactCopy = sectionCopy(contactSection);

  return (
    <div
      className={cn(
        ui.root,
        preview && 'h-full min-h-0 overflow-auto px-4.5 pb-5',
        mobilePreview && 'px-3',
        portfolio.template === 'editorial' && 'bg-[#f7edea] font-[Georgia,serif]',
        portfolio.template === 'mono' && 'bg-[#f0f2f3] font-[Arial,sans-serif]',
      )}
      role="region"
      aria-label={`${portfolio.name} portfolio`}
      style={
        {
          '--portfolio-accent': portfolio.accent,
        } as React.CSSProperties
      }
    >
      <div className={ui.shell}>
        <nav
          className={cn(ui.nav, portfolio.template === 'editorial' && 'border-[#dfd2ce]')}
          aria-label="Portfolio navigation"
        >
          <a className={ui.monogram} href="#top" aria-label={`${portfolio.name}, home`}>
            {portfolio.name.slice(0, 1).toUpperCase()}
          </a>
          <a className={ui.navName} href="#top">
            {portfolio.name}
          </a>
          <div className={ui.navLinks}>
            {navigation.map((section) => (
              <a className={ui.navLink} key={section.id} href={`#section-${section.id}`}>
                {section.title}
              </a>
            ))}
          </div>
          {contactSection && (
            <a className={ui.contactLink} href="#contact">
              Let’s talk <ArrowUpRight aria-hidden="true" weight="regular" />
            </a>
          )}
        </nav>

        <header className={ui.hero} id="top">
          <div className={ui.heroCopy}>
            <span className={ui.kicker}>
              <i />
              {portfolio.kind === 'organization'
                ? 'ORGANIZATION · SELECTED WORK'
                : 'PORTFOLIO · SELECTED WORK'}
            </span>
            <h1
              className={cn(
                ui.heroTitle,
                portfolio.template === 'editorial' && 'font-[Georgia,serif] font-normal',
                portfolio.template === 'mono' && 'font-[Arial,sans-serif] tracking-[-.06em]',
              )}
            >
              {heroTitle}
            </h1>
            <p className={ui.heroSubtitle}>{heroSubtitle}</p>
            <a
              className={ui.workLink}
              href={supporting.length ? `#section-${firstWork?.id ?? supporting[0].id}` : '#top'}
            >
              {firstWork
                ? 'Explore selected work'
                : supporting.length
                  ? 'Explore my portfolio'
                  : 'Back to introduction'}{' '}
              <ArrowDown aria-hidden="true" weight="regular" />
            </a>
            <div className={ui.heroMeta}>
              {projectCount > 0 && (
                <span className={ui.heroMetaItem}>
                  <Briefcase aria-hidden="true" weight="regular" />
                  {projectCount} featured {projectCount === 1 ? 'project' : 'projects'}
                </span>
              )}
              <span className={ui.heroMetaItem}>
                {portfolio.kind === 'organization' ? (
                  <Buildings aria-hidden="true" weight="regular" />
                ) : (
                  <UserCircle aria-hidden="true" weight="regular" />
                )}
                {portfolio.kind === 'organization'
                  ? 'Organization portfolio'
                  : 'Personal portfolio'}
              </span>
            </div>
          </div>
          <div
            className={cn(
              ui.heroVisual,
              portfolio.template === 'editorial' && 'rounded-lg bg-[#ead9d3]',
              portfolio.template === 'mono' && 'rounded-sm',
              mobilePreview && 'h-55 min-h-45 rounded-[42%_42%_6px_6px]',
            )}
          >
            <SafeImage section={hero ?? sections[0]} className="absolute inset-0 h-full min-h-0" />
            <span className={ui.caption}>
              {portfolio.name} <b>— 01</b>
            </span>
          </div>
          <span className={ui.sideNote}>WORK · EXPERIENCE · IDEAS</span>
        </header>

        <div className={ui.intro}>
          <span>Scroll to explore</span>
          <span>01 — {String(supporting.length + 1).padStart(2, '0')}</span>
        </div>

        {supporting.map((section, index) => {
          const copy = sectionCopy(section);
          const image = text(section.content.imageUrl);
          const url = text(section.content.url);
          const isWork = section.type === 'projects' || section.type === 'case-studies';
          const isList = ['skills', 'services', 'certifications', 'achievements'].includes(
            section.type,
          );
          const items = copy
            .split(/[\n,;]/)
            .map((item) => item.trim())
            .filter(Boolean);

          return (
            <section
              className={cn(
                ui.section,
                portfolio.template === 'editorial' && 'border-[#dfd2ce]',
                portfolio.template === 'mono' && 'border-[#d1d5d8]',
              )}
              id={`section-${section.id}`}
              key={section.id}
            >
              <div className={ui.sectionHeading}>
                <span>
                  {String(index + 1).padStart(2, '0')} / {section.title.toUpperCase()}
                </span>
                <i />
              </div>
              {isWork ? (
                <article
                  className={cn(
                    'group',
                    ui.projectCard,
                    portfolio.template === 'mono' && 'bg-[#e7eaec]',
                  )}
                  id={section.type === 'projects' ? 'work' : undefined}
                >
                  <div
                    className={cn(
                      ui.projectVisual,
                      portfolio.template === 'mono' && 'filter-[grayscale(.3)]',
                    )}
                  >
                    <SafeImage
                      section={section}
                      className="absolute inset-0 size-full min-h-0 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className={ui.projectIndex}>
                      PROJECT {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className={ui.projectCopy}>
                    <span className={ui.projectType}>FEATURED PROJECT</span>
                    <h2
                      className={cn(
                        ui.h2,
                        portfolio.template === 'editorial' && 'font-[Georgia,serif] font-normal',
                        portfolio.template === 'mono' &&
                          'font-[Arial,sans-serif] tracking-[-.06em]',
                      )}
                    >
                      {section.title}
                    </h2>
                    {copy && <p className={ui.paragraph}>{copy}</p>}
                    <div className={ui.projectFooter}>
                      <span>{text(section.content.category) || 'Selected work'}</span>
                      {url && /^https?:\/\//i.test(url) && (
                        <a href={url} target="_blank" rel="noreferrer noopener">
                          View project <ArrowUpRight aria-hidden="true" weight="regular" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ) : (
                <div
                  className={cn(
                    ui.contentGrid,
                    isList && 'grid-cols-2 @max-[760px]/showcase:grid-cols-1',
                  )}
                >
                  <div
                    className={cn(
                      ui.sectionCopy,
                      portfolio.template === 'editorial' &&
                        '[&_h2]:font-[Georgia,serif] [&_h2]:font-normal',
                      portfolio.template === 'mono' &&
                        '[&_h2]:font-[Arial,sans-serif] [&_h2]:tracking-[-.06em]',
                    )}
                  >
                    <span className={ui.sectionMark}>
                      <SectionIcon type={section.type} />
                    </span>
                    <h2>{section.title}</h2>
                    {copy && <p>{copy}</p>}
                    {url && /^https?:\/\//i.test(url) && (
                      <a
                        className={ui.inlineLink}
                        href={url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Explore more <ArrowUpRight aria-hidden="true" weight="regular" />
                      </a>
                    )}
                  </div>
                  {isList && items.length > 1 ? (
                    <ul className={ui.pillList}>
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : image && /^https?:\/\//i.test(image) ? (
                    <SafeImage section={section} />
                  ) : (
                    <div className={ui.noteCard}>
                      <span>A POINT OF VIEW</span>
                      <strong>{text(section.content.headline) || copy || section.title}</strong>
                      <i>“</i>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {contactSection && (
          <section
            className={cn(
              ui.contact,
              portfolio.template === 'mono' &&
                '[&_h2]:font-[Arial,sans-serif] [&_h2]:tracking-[-.06em]',
            )}
            id="contact"
          >
            <span className={cn(ui.kicker, 'text-[#c5c1b7]')}>
              <i />
              HAVE A GOOD ONE IN MIND?
            </span>
            <h2>
              Let’s make
              <br />
              <em>something matter.</em>
            </h2>
            <p>{contactCopy || 'Have a project, a question, or just want to say hello?'}</p>
            {contactUrl && /^https?:\/\//i.test(contactUrl) && (
              <a href={contactUrl} target="_blank" rel="noreferrer noopener">
                Get in touch <ArrowUpRight aria-hidden="true" weight="regular" />
              </a>
            )}
          </section>
        )}
        <footer className={ui.footer}>
          <a href="#top">{portfolio.name}</a>
          <span>Thoughtfully made with Forme</span>
          <a href="#top">Back to top ↑</a>
        </footer>
      </div>
    </div>
  );
}
