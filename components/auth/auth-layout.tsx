import Link from "next/link"
import { IconArrowLeft, IconQuote } from "@tabler/icons-react"

import { Brand } from "@/components/marketing/brand"
import { APP_NAME } from "@/lib/config"

export function AuthLayout({
  children,
  title,
  description,
  footer,
}: {
  children: React.ReactNode
  title: string
  description: string
  footer?: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-[#191510] px-12 py-10 text-[#f7f3ec] lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:52px_52px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 size-[28rem] rounded-full bg-amber-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 bottom-0 size-[26rem] rounded-full bg-teal-500/10 blur-3xl"
        />

        <div className="relative">
          <Brand href="/" className="text-[#f7f3ec]" />
        </div>

        <div className="relative max-w-md">
          <IconQuote className="size-8 text-amber-400/70" />
          <blockquote className="mt-5 font-serif text-3xl leading-[1.15] tracking-[-0.02em] text-[#f0e8db]">
            “The work was already there. {APP_NAME} just gave it a door.”
          </blockquote>
          <p className="mt-5 text-sm text-[#a89c8c]">
            A calm, deliberate place for designers, engineers, writers, and
            anyone with something worth showing.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-2">
            {["#f7f3ec", "#b45309", "#22d3ee"].map((color, index) => (
              <div
                key={color}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
              >
                <div
                  className="h-14 rounded-md"
                  style={{
                    background:
                      index === 0
                        ? "linear-gradient(160deg,#f7f3ec,#d9cbb5)"
                        : index === 1
                          ? "linear-gradient(160deg,#b45309,#7c3a06)"
                          : "linear-gradient(160deg,#22d3ee,#0e7490)",
                  }}
                />
                <div className="mt-2.5 h-1.5 w-10 rounded-full bg-white/25" />
                <div className="mt-1.5 h-1.5 w-7 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-[#7d7264]">
          One portfolio. One link. Yours.
        </p>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between lg:hidden">
          <Brand />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft className="size-3.5" />
            Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <div className="mb-7">
              <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em]">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
            {children}
            {footer ? (
              <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
            ) : null}
          </div>
        </div>

        <p className="text-center text-[0.7rem] text-muted-foreground lg:text-left">
          By continuing you agree to keep this space kind and honest.
        </p>
      </main>
    </div>
  )
}
