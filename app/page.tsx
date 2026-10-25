import type { Metadata } from "next"
import Link from "next/link"
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconDeviceMobile,
  IconEye,
  IconLayoutGrid,
  IconPhoto,
  IconShieldLock,
  IconSparkles,
} from "@tabler/icons-react"

import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome"
import { TemplateThumbnail } from "@/components/marketing/template-thumbnail"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/config"
import { TEMPLATES } from "@/lib/portfolio/templates"

export const metadata: Metadata = {
  title: "A portfolio that feels like you",
  description:
    "Build a polished portfolio in an afternoon. Write your story, choose a template, preview every detail, and publish one link.",
}

const FEATURES = [
  {
    icon: IconLayoutGrid,
    title: "Sections that fit",
    body: "Twelve purpose-built section types — from projects and experience to services and testimonials. Add, hide, and reorder without touching layout code.",
  },
  {
    icon: IconEye,
    title: "Preview before you publish",
    body: "See the real page at desktop and mobile sizes. Your published site only changes when you say so.",
  },
  {
    icon: IconShieldLock,
    title: "Drafts stay private",
    body: "Editing never quietly rewrites your live page. Draft and published content live separately until you hit publish.",
  },
  {
    icon: IconPhoto,
    title: "Images, handled",
    body: "Upload a portrait, project shots, or a CV. Files are validated, resized, and served privately until they belong to a published page.",
  },
]

const STEPS = [
  {
    number: "01",
    title: "Pick a starting point",
    body: "Choose one of four distinct templates, then make it yours with a colour, type pairing, and corner style.",
  },
  {
    number: "02",
    title: "Tell the story",
    body: "Add the sections that matter. Write in plain language, reorder the page, and leave anything unfinished hidden.",
  },
  {
    number: "03",
    title: "Publish the link",
    body: "Preview desktop and mobile, fix anything the publish check flags, and share your own corner of the web.",
  },
]

export default function HomePage() {
  const atlas = TEMPLATES[0]
  const signal = TEMPLATES[1]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(180,83,9,0.12),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgba(15,118,110,0.08),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(180,83,9,0.14),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgba(34,211,238,0.08),transparent_45%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]"
          />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:pb-28 lg:pt-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <IconSparkles className="size-3.5 text-amber-700 dark:text-amber-400" />
                Four hand-built templates. One honest story.
              </p>
              <h1 className="mt-6 max-w-[15ch] font-heading text-5xl leading-[0.94] font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Your work deserves a{" "}
                <span className="font-serif text-amber-800 italic dark:text-amber-400">
                  proper
                </span>{" "}
                home.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {APP_NAME} is a focused portfolio builder for designers,
                engineers, writers, and anyone with something worth showing.
                Choose a shape, write the story, publish one link.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  className="h-11 px-5 text-sm shadow-sm"
                  nativeButton={false}
                  render={<Link href="/register" />}
                >
                  Build your portfolio
                  <IconArrowRight data-icon="inline-end" />
                </Button>
                <Button
                  variant="outline"
                  className="h-11 px-5 text-sm"
                  nativeButton={false}
                  render={<Link href="/template-preview/atlas" />}
                >
                  See a live example
                  <IconArrowUpRight data-icon="inline-end" />
                </Button>
              </div>
              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {["Free to start", "No code", "Publish in minutes"].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <IconCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-[560px] pb-14 lg:pb-10">
              <div
                aria-hidden="true"
                className="absolute inset-x-6 top-8 bottom-8 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-500/10"
              />
              <Link
                href={`/template-preview/${atlas.id}`}
                className="relative block w-[84%] -rotate-[2.5deg] rounded-2xl border bg-card p-2 shadow-2xl transition-transform duration-300 hover:-translate-y-1 hover:rotate-0"
              >
                <TemplateThumbnail template={atlas} className="rounded-xl" />
                <span className="flex items-center justify-between px-1.5 pb-0.5 pt-2 text-xs">
                  <span className="font-medium">Atlas</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    Preview <IconArrowUpRight className="size-3.5" />
                  </span>
                </span>
              </Link>
              <Link
                href={`/template-preview/${signal.id}`}
                className="absolute right-0 bottom-0 w-[58%] rotate-[3deg] rounded-2xl border bg-card p-2 shadow-2xl transition-transform duration-300 hover:-translate-y-1 hover:rotate-0"
              >
                <TemplateThumbnail template={signal} className="rounded-xl" />
                <span className="flex items-center justify-between px-1.5 pb-0.5 pt-2 text-xs">
                  <span className="font-medium">Signal</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    Preview <IconArrowUpRight className="size-3.5" />
                  </span>
                </span>
              </Link>
              <div className="absolute top-4 right-0 flex items-center gap-2 rounded-full border bg-background/90 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Live at folio.site/avery
              </div>
            </div>
          </div>
        </section>

        <section id="templates" className="scroll-mt-20 border-b py-20 sm:py-28">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-800 dark:text-amber-400">
                  Templates
                </p>
                <h2 className="mt-3 max-w-[16ch] font-heading text-4xl leading-[1.02] font-semibold tracking-[-0.04em] sm:text-5xl">
                  Four starting points. One you.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground lg:justify-self-end lg:text-base">
                Each template has its own voice and layout logic. Switch at any
                time — your words, sections, and media stay put.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {TEMPLATES.map((template) => (
                <Link
                  key={template.id}
                  href={`/template-preview/${template.id}`}
                  className="group flex flex-col rounded-2xl border bg-card p-3 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-xl"
                >
                  <TemplateThumbnail
                    template={template}
                    className="rounded-xl transition-transform duration-500 group-hover:scale-[1.005]"
                  />
                  <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-heading text-xl font-semibold tracking-tight">
                        {template.name}
                      </h3>
                      <span className="grid size-8 place-items-center rounded-full border text-muted-foreground transition-colors group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                        <IconArrowUpRight className="size-4" />
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {template.tagline}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {template.bestFor.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border px-2 py-0.5 text-[0.68rem] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-b py-20 sm:py-28">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-800 dark:text-amber-400">
                Built deliberately
              </p>
              <h2 className="mt-3 font-heading text-4xl leading-[1.02] font-semibold tracking-[-0.04em] sm:text-5xl">
                Everything you need. Nothing in the way.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                No canvas to fight, no plugins to configure, no mystery about
                what&apos;s live. Just a quiet, well-made tool for putting your
                work online.
              </p>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="flex flex-col bg-background p-6">
                  <span className="grid size-9 place-items-center rounded-lg border bg-muted/40">
                    <feature.icon className="size-4" />
                  </span>
                  <h3 className="mt-5 font-heading text-lg font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-4 rounded-2xl border bg-card p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <IconDeviceMobile className="size-5" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-semibold">
                    Responsive by default
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Every template is built for real phones, not just a narrow
                    browser window. Type scales, grids collapse, navigation
                    becomes a menu.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border bg-card p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-400">
                  <IconShieldLock className="size-5" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-semibold">
                    Publish checks, not surprises
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Before a page goes live, we check for missing names, empty
                    projects, broken contact details, and other loose ends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-b py-20 sm:py-28">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-800 dark:text-amber-400">
                How it works
              </p>
              <h2 className="mt-3 max-w-[13ch] font-heading text-4xl leading-[1.02] font-semibold tracking-[-0.04em] sm:text-5xl">
                An afternoon, start to link.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Most people spend longer choosing a profile photo than they do
                setting up their portfolio. That&apos;s the point.
              </p>
              <Button
                variant="outline"
                className="mt-6 h-10 px-4 text-sm"
                nativeButton={false}
                render={<Link href="/register" />}
              >
                Start with a template
                <IconArrowRight data-icon="inline-end" />
              </Button>
            </div>

            <ol className="relative">
              <span
                aria-hidden="true"
                className="absolute top-3 bottom-3 left-[1.1rem] w-px bg-border sm:left-[1.35rem]"
              />
              {STEPS.map((step) => (
                <li key={step.number} className="relative flex gap-5 pb-10 last:pb-0 sm:gap-7">
                  <span className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full border bg-background font-mono text-[0.65rem] text-muted-foreground sm:size-11">
                    {step.number}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-[#191510] px-6 py-14 text-[#f7f3ec] sm:px-12 sm:py-20">
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-20 size-96 rounded-full bg-amber-500/20 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
              />
              <div className="relative max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
                  Ready when you are
                </p>
                <h2 className="mt-4 font-heading text-4xl leading-[0.98] font-semibold tracking-[-0.045em] sm:text-6xl">
                  Put the work where people can find it.
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#cabfae] sm:text-base">
                  Create an account, pick a template, and have a portfolio link
                  to share before the day is out. Free to start.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    className="h-11 bg-[#f7f3ec] px-5 text-sm text-[#191510] hover:bg-white"
                    nativeButton={false}
                    render={<Link href="/register" />}
                  >
                    Create your portfolio
                    <IconArrowRight data-icon="inline-end" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 border-white/20 bg-transparent px-5 text-sm text-[#f7f3ec] hover:bg-white/10 hover:text-white"
                    nativeButton={false}
                    render={<Link href="/login" />}
                  >
                    I already have an account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
