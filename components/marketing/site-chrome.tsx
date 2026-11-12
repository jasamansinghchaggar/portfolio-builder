import { PendingLink } from "@/components/app/pending-link"

import { Brand } from "@/components/marketing/brand"
import { Button } from "@/components/ui/button"
import { IconArrowRight } from "@tabler/icons-react"

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Brand />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <PendingLink
            className="transition-colors hover:text-foreground"
            href="/#templates"
          >
            Templates
          </PendingLink>
          <PendingLink
            className="transition-colors hover:text-foreground"
            href="/#features"
          >
            Features
          </PendingLink>
          <PendingLink
            className="transition-colors hover:text-foreground"
            href="/#how-it-works"
          >
            How it works
          </PendingLink>
          <PendingLink
            className="transition-colors hover:text-foreground"
            href="/template-preview/studio"
          >
            Live example
          </PendingLink>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          {signedIn ? (
            <Button
              className="h-9 px-3.5 text-sm"
              nativeButton={false}
              render={<PendingLink href="/dashboard" />}
            >
              Dashboard
              <IconArrowRight />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="h-9 px-3 text-sm"
                nativeButton={false}
                render={<PendingLink href="/login" />}
              >
                Log in
              </Button>
              <Button
                className="h-9 px-3.5 text-sm"
                nativeButton={false}
                render={<PendingLink href="/register" />}
              >
                Start free
                <IconArrowRight />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function SiteFooter({ signedIn = false }: { signedIn?: boolean }) {
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
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Product
            </p>
            <PendingLink className="hover:underline" href="/#templates">
              Templates
            </PendingLink>
            <PendingLink className="hover:underline" href="/#features">
              Features
            </PendingLink>
            <PendingLink className="hover:underline" href="/template-preview/studio">
              Example
            </PendingLink>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Account
            </p>
            {signedIn ? (
              <>
                <PendingLink className="hover:underline" href="/dashboard">
                  Dashboard
                </PendingLink>
                <PendingLink className="hover:underline" href="/editor">
                  Editor
                </PendingLink>
                <PendingLink className="hover:underline" href="/settings">
                  Settings
                </PendingLink>
              </>
            ) : (
              <>
                <PendingLink className="hover:underline" href="/login">
                  Log in
                </PendingLink>
                <PendingLink className="hover:underline" href="/register">
                  Create account
                </PendingLink>
                <PendingLink className="hover:underline" href="/forgot-password">
                  Reset password
                </PendingLink>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto w-full max-w-6xl px-5 py-5 text-xs text-muted-foreground sm:px-8">
          <p>
             © {new Date().getFullYear()} MyFolio. Built for people with something
            to show.
          </p>
        </div>
      </div>
    </footer>
  )
}
