"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconPencil,
  IconSettings,
  IconShieldLock,
} from "@tabler/icons-react"

import { Brand } from "@/components/marketing/brand"
import type { PortfolioStatus } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

const STATUS_LABEL: Record<PortfolioStatus, string> = {
  draft: "Draft",
  published: "Published",
  unpublished: "Unpublished",
}

const STATUS_STYLE: Record<PortfolioStatus, string> = {
  draft:
    "border-amber-600/25 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  published:
    "border-emerald-600/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  unpublished: "border-muted-foreground/25 bg-muted text-muted-foreground",
}

export function AppHeader({
  fullName,
  email,
  isAdmin,
  hasPortfolio,
  status,
  initials,
}: {
  fullName: string
  email: string
  isAdmin: boolean
  hasPortfolio: boolean
  status: PortfolioStatus | null
  initials: string
}) {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Overview", icon: IconLayoutDashboard },
    ...(hasPortfolio
      ? [
          { href: "/editor", label: "Editor", icon: IconPencil },
          { href: "/settings", label: "Settings", icon: IconSettings },
        ]
      : []),
    ...(isAdmin
      ? [{ href: "/admin", label: "Admin", icon: IconShieldLock }]
      : []),
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-(--app-header-height) flex-col border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-center gap-3 px-4 sm:px-6">
        <Brand href={hasPortfolio ? "/dashboard" : "/onboarding"} />

        <nav className="ml-3 hidden items-center gap-0.5 md:flex">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <link.icon className="size-3.5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {status ? (
            <span
              className={cn(
                "hidden items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium sm:inline-flex",
                STATUS_STYLE[status]
              )}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {STATUS_LABEL[status]}
            </span>
          ) : null}

          <div className="hidden items-center gap-2 border-l pl-2.5 sm:flex">
            <span className="grid size-7 place-items-center rounded-full bg-foreground font-heading text-[0.65rem] font-semibold text-background">
              {initials}
            </span>
            <div className="leading-tight">
              <p className="max-w-32 truncate text-[0.7rem] font-medium">
                {fullName || "Your account"}
              </p>
              <p className="max-w-32 truncate text-[0.6rem] text-muted-foreground">
                {email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex h-10 shrink-0 items-center gap-0.5 overflow-x-auto border-t px-4 md:hidden">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <link.icon className="size-3.5" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
