import type { Metadata } from "next"
import Link from "next/link"
import {
  IconArrowLeft,
  IconArrowUpRight,
  IconCompass,
} from "@tabler/icons-react"

import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist or has moved.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="relative flex flex-1 items-center overflow-hidden border-b">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(180,83,9,0.12),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgba(15,118,110,0.08),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(180,83,9,0.14),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgba(34,211,238,0.08),transparent_45%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_80%)] [background-size:64px_64px] opacity-[0.16]"
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <IconCompass className="size-3.5 text-amber-700 dark:text-amber-400" />
              Error 404 · Page not found
            </p>

            <h1 className="mt-6 max-w-[13ch] font-heading text-5xl leading-[0.96] font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              This page isn&apos;t part of the{" "}
              <span className="font-serif text-amber-800 italic dark:text-amber-400">
                story
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              The link may be mistyped, or the page may have moved. If you were
              looking for someone&apos;s portfolio, it may be unpublished,
              renamed, or still being written.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                className="h-11 px-5 text-sm shadow-sm"
                nativeButton={false}
                render={<Link href="/" />}
              >
                <IconArrowLeft data-icon="inline-start" />
                Back to home
              </Button>
              <Button
                variant="outline"
                className="h-11 px-5 text-sm"
                nativeButton={false}
                render={<Link href="/#templates" />}
              >
                Browse templates
                <IconArrowUpRight />
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Sign in to {APP_NAME}
              </Link>
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-amber-200/25 blur-3xl dark:bg-amber-500/10" />

            <div className="relative -rotate-[2deg] rounded-2xl border bg-card p-2.5 shadow-2xl">
              <div className="rounded-xl border bg-background/80 p-5">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-red-400/70" />
                  <span className="size-2 rounded-full bg-amber-400/70" />
                  <span className="size-2 rounded-full bg-emerald-400/70" />
                  <span className="ml-2 min-w-0 flex-1 truncate rounded-full border bg-muted/40 px-2.5 py-1 font-mono text-[0.6rem] text-muted-foreground">
                    {APP_NAME.toLowerCase()}.site/this-page
                  </span>
                </div>

                <div className="mt-12 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                      Page not found
                    </p>
                    <p className="mt-1 font-serif text-8xl leading-none text-amber-800 italic dark:text-amber-400">
                      404
                    </p>
                  </div>
                  <IconCompass className="mb-2 size-10 text-muted-foreground/40" />
                </div>

                <div className="mt-10 space-y-2.5">
                  <div className="h-2 w-4/5 rounded-full bg-muted" />
                  <div className="h-2 w-3/5 rounded-full bg-muted" />
                  <div className="h-2 w-2/5 rounded-full bg-muted" />
                </div>

                <div className="mt-10 flex items-center justify-between border-t pt-4 text-[0.65rem] text-muted-foreground">
                  <span>There is nothing at this address.</span>
                  <span className="font-mono">404</span>
                </div>
              </div>
            </div>

            <div className="absolute -top-3 -right-3 rotate-3 rounded-full border bg-background px-3 py-1 text-[0.65rem] font-medium shadow-sm">
              Nothing here
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
