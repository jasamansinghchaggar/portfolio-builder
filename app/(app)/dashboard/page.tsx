import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  IconArrowUpRight,
  IconCircleCheck,
  IconCircle,
  IconClock,
  IconEye,
  IconLayoutGrid,
  IconPhoto,
  IconSparkles,
} from "@tabler/icons-react"

import { CopyUrlButton } from "@/components/dashboard/copy-url-button"
import { TemplateThumbnail } from "@/components/marketing/template-thumbnail"
import { Button } from "@/components/ui/button"
import { requirePortfolio, getProfile } from "@/lib/auth"
import { publicPortfolioUrl } from "@/lib/config"
import { formatDateTime } from "@/lib/format"
import { coercePortfolioContent } from "@/lib/portfolio/defaults"
import { checklistProgress, publishChecklist } from "@/lib/portfolio/publish"
import { renderedSections } from "@/lib/portfolio/sections"
import { getTemplate } from "@/lib/portfolio/templates"
import type { PortfolioStatus } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Dashboard",
}

const STATUS_COPY: Record<
  PortfolioStatus,
  { label: string; hint: string; className: string }
> = {
  draft: {
    label: "Draft",
    hint: "Only you can see this. Publish when it feels ready.",
    className:
      "border-amber-600/25 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  },
  published: {
    label: "Published",
    hint: "Your public link is live and up to date.",
    className:
      "border-emerald-600/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  unpublished: {
    label: "Unpublished",
    hint: "The public link is offline. Your content is safe.",
    className: "border-border bg-muted text-muted-foreground",
  },
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    welcome?: string | string[]
    password?: string | string[]
  }>
}) {
  const params = await searchParams
  const welcome = params.welcome === "1" || params.welcome === "true"
  const passwordUpdated = params.password === "updated"

  const { supabase, userId, portfolio } = await requirePortfolio("/dashboard")
  const profile = await getProfile(userId)
  if (profile?.role === "admin") redirect("/admin")

  const content = coercePortfolioContent(portfolio.draft_content, {
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? "",
  })
  const template = getTemplate(content.templateId)
  const url = publicPortfolioUrl(portfolio.username)
  const status = STATUS_COPY[portfolio.status]
  const checklist = publishChecklist(content)
  const progress = checklistProgress(checklist)
  const visible = renderedSections(content.sections)
  const publishedContent = portfolio.published_content
  const hasUnpublishedChanges =
    portfolio.status === "published" &&
    (!publishedContent ||
      JSON.stringify(publishedContent) !==
        JSON.stringify(portfolio.draft_content))

  const { count: mediaCount } = await supabase
    .from("portfolio_media")
    .select("id", { count: "exact", head: true })
    .eq("portfolio_id", portfolio.id)

  return (
    <div className="space-y-5">
      {welcome ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-600/25 bg-emerald-500/5 px-4 py-3">
          <IconSparkles className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-medium">Your portfolio is ready.</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Start with the hero section, then work down the page. Everything
              saves automatically.
            </p>
          </div>
        </div>
      ) : null}

      {passwordUpdated ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-600/25 bg-emerald-500/5 px-4 py-3">
          <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
          <p className="text-sm">Your password has been updated.</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Overview
          </p>
          <h1 className="mt-1.5 font-heading text-3xl font-semibold tracking-[-0.035em]">
            {content.basics.fullName
              ? `Hello, ${content.basics.fullName.split(/\s+/)[0]}.`
              : "Your portfolio."}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One page, one link, no loose ends.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="h-9 text-sm"
            nativeButton={false}
            render={<Link href="/preview" target="_blank" />}
          >
            <IconEye />
            Preview
          </Button>
          <Button
            className="h-9 text-sm"
            nativeButton={false}
            render={<Link href="/editor" />}
          >
            Open editor
            <IconArrowUpRight />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <section className="flex flex-col justify-between overflow-hidden rounded-2xl border bg-card">
          <div className="flex flex-col p-5">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="w-full max-w-52.5 shrink-0">
                <TemplateThumbnail template={template} className="rounded-xl" />
                <p className="mt-2 text-center text-[0.7rem] text-muted-foreground">
                  {template.name} template
                </p>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium",
                      status.className
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {status.label}
                  </span>
                  {hasUnpublishedChanges ? (
                    <span className="rounded-full border border-amber-600/25 bg-amber-500/5 px-2 py-0.5 text-[0.65rem] font-medium text-amber-800 dark:text-amber-300">
                      Unpublished edits
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-3 truncate font-heading text-xl font-semibold tracking-[-0.02em]">
                  {content.basics.fullName || "Untitled portfolio"}
                </h2>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {content.basics.headline ||
                    "Add a headline in the editor to say what you do."}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {status.hint}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border bg-muted/30 px-3 py-2">
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Public address
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate font-mono text-xs">
                  {url}
                </span>
                <CopyUrlButton url={url} label="Copy" size="xs" />
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 border-t bg-muted/20 text-xs sm:grid-cols-4">
            <div className="border-r px-4 py-3">
              <dt className="text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Sections
              </dt>
              <dd className="mt-0.5 text-sm font-medium tabular-nums">
                {visible.length} visible
              </dd>
            </div>
            <div className="border-r px-4 py-3">
              <dt className="text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Files
              </dt>
              <dd className="mt-0.5 text-sm font-medium tabular-nums">
                {mediaCount ?? 0} uploaded
              </dd>
            </div>
            <div className="border-r px-4 py-3">
              <dt className="text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Last saved
              </dt>
              <dd className="mt-0.5 text-sm font-medium">
                {formatDateTime(portfolio.last_saved_at)}
              </dd>
            </div>
            <div className="px-4 py-3">
              <dt className="text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Published
              </dt>
              <dd className="mt-0.5 text-sm font-medium">
                {formatDateTime(portfolio.published_at)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-semibold">
                Publish check
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                The essentials visitors expect.
              </p>
            </div>
            <span className="font-heading text-2xl font-semibold tabular-nums">
              {progress}%
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ul className="mt-4 space-y-3">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5">
                {item.done ? (
                  <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <IconCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                )}
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      item.done &&
                        "text-muted-foreground line-through decoration-muted-foreground/40"
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.hint}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <Button
            variant="outline"
            className="mt-4 h-8 w-full text-xs"
            nativeButton={false}
            render={<Link href="/editor" />}
          >
            Finish in the editor
          </Button>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/editor"
          className="group rounded-xl border bg-card p-4 transition-colors hover:border-foreground/25 hover:bg-muted/20"
        >
          <span className="grid size-8 place-items-center rounded-lg border bg-muted/40">
            <IconLayoutGrid className="size-4" />
          </span>
          <h3 className="mt-3 font-heading text-sm font-semibold">
            Edit content
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Update sections, reorder the page, or change the template.
          </p>
        </Link>
        <Link
          href="/settings"
          className="group rounded-xl border bg-card p-4 transition-colors hover:border-foreground/25 hover:bg-muted/20"
        >
          <span className="grid size-8 place-items-center rounded-lg border bg-muted/40">
            <IconPhoto className="size-4" />
          </span>
          <h3 className="mt-3 font-heading text-sm font-semibold">
            Account & address
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Change your name, password, or portfolio username.
          </p>
        </Link>
        <div className="rounded-xl border bg-card p-4">
          <span className="grid size-8 place-items-center rounded-lg border bg-muted/40">
            <IconClock className="size-4" />
          </span>
          <h3 className="mt-3 font-heading text-sm font-semibold">
            Draft safety
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Edits never touch the live page until you press publish.
          </p>
        </div>
      </div>
    </div>
  )
}
