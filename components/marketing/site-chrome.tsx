import Link from "next/link"

import { Brand } from "@/components/marketing/brand"
import { Button } from "@/components/ui/button"
import { IconArrowRight } from "@tabler/icons-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Brand />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link className="transition-colors hover:text-foreground" href="/#templates">
            Templates
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/#features">
            Features
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/#how-it-works">
            How it works
          </Link>
          <Link
            className="transition-colors hover:text-foreground"
            href="/template-preview/atlas"
          >
            Live example
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            className="h-9 px-3 text-sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Log in
          </Button>
          <Button
            className="h-9 px-3.5 text-sm"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Start free
            <IconArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-sm">
          <Brand />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A small, considered portfolio builder. Pick a shape, write the
            story, publish the link.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-6 text-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Product
            </p>
            <Link className="hover:underline" href="/#templates">
              Templates
            </Link>
            <Link className="hover:underline" href="/#features">
              Features
            </Link>
            <Link className="hover:underline" href="/template-preview/atlas">
              Example
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Account
            </p>
            <Link className="hover:underline" href="/login">
              Log in
            </Link>
            <Link className="hover:underline" href="/register">
              Create account
            </Link>
            <Link className="hover:underline" href="/forgot-password">
              Reset password
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Folio. Built for people with something to show.</p>
          <p>Next.js · Supabase · Vercel</p>
        </div>
      </div>
    </footer>
  )
}
