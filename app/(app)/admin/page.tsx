import type { Metadata } from "next"
import Link from "next/link"
import {
  IconArrowUpRight,
  IconEye,
  IconPencil,
  IconSearch,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react"

import { AdminManager } from "@/components/admin/admin-manager"
import { BannerManager } from "@/components/admin/banner-manager"
import {
  PortfolioAccessSwitch,
  PortfolioBannerSwitch,
} from "@/components/admin/portfolio-controls"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireAdmin } from "@/lib/auth"
import {
  adminListPromoBannersAction,
  type AdminPromoBanner,
} from "@/lib/actions/admin"
import { publicPortfolioUrl } from "@/lib/config"
import { formatDate, formatDateTime } from "@/lib/format"
import type {
  Portfolio,
  PortfolioStatus,
  Profile,
} from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type Tab = "portfolios" | "users" | "banners" | "admins"

type PageProps = {
  searchParams: Promise<{
    q?: string | string[]
    status?: string | string[]
    tab?: string | string[]
  }>
}

type AdminPortfolio = Pick<
  Portfolio,
  | "id"
  | "username"
  | "user_id"
  | "status"
  | "is_disabled"
  | "promo_bar_enabled"
  | "created_at"
  | "updated_at"
>

type AdminUser = Pick<
  Profile,
  "id" | "email" | "full_name" | "role" | "created_at"
>

type UserPortfolio = Pick<
  Portfolio,
  "id" | "user_id" | "username" | "status" | "is_disabled"
>

const STATUSES: { value: "all" | PortfolioStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "unpublished", label: "Unpublished" },
]

const STATUS_BADGE: Record<PortfolioStatus, string> = {
  draft:
    "border-amber-600/25 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  published:
    "border-emerald-600/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  unpublished: "border-border bg-muted text-muted-foreground",
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function sanitizeSearch(value: string) {
  return value
    .replace(/[^a-zA-Z0-9@._\-\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
}

function buildHref({
  tab,
  status,
  q,
}: {
  tab: Tab
  status: "all" | PortfolioStatus
  q: string
}) {
  const query = new URLSearchParams()
  if (tab === "users") query.set("tab", "users")
  if (tab === "banners") query.set("tab", "banners")
  if (tab === "admins") query.set("tab", "admins")
  if (q) query.set("q", q)
  if (tab === "portfolios" && status !== "all") query.set("status", status)
  const value = query.toString()
  return value ? `/admin?${value}` : "/admin"
}

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = sanitizeSearch(single(params.q) ?? "")
  const requestedTab = single(params.tab)
  const tab: Tab =
    requestedTab === "users"
      ? "users"
      : requestedTab === "banners"
        ? "banners"
        : requestedTab === "admins"
          ? "admins"
          : "portfolios"
  const requestedStatus = single(params.status)
  const status = STATUSES.some((item) => item.value === requestedStatus)
    ? (requestedStatus as "all" | PortfolioStatus)
    : "all"

  const { supabase, userId } = await requireAdmin()

  const [
    { count: totalPortfolios },
    { count: totalUsers },
    { count: liveCount },
    { count: disabledCount },
    { count: totalBanners },
    { count: totalAdmins },
  ] = await Promise.all([
    supabase
      .from("portfolios")
      .select("id", { count: "exact", head: true })
      .neq("user_id", userId),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .neq("id", userId),
    supabase
      .from("portfolios")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("is_disabled", false)
      .neq("user_id", userId),
    supabase
      .from("portfolios")
      .select("id", { count: "exact", head: true })
      .eq("is_disabled", true)
      .neq("user_id", userId),
    supabase.from("promo_banners").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin"),
  ])

  let portfolios: AdminPortfolio[] = []
  const ownerMap = new Map<string, { full_name: string; email: string }>()

  if (tab === "portfolios") {
    let matchingOwnerIds: string[] = []
    if (q) {
      const { data: matches } = await supabase
        .from("profiles")
        .select("id")
        .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(50)
      matchingOwnerIds = (matches ?? []).map((match) => match.id)
    }

    let query = supabase
      .from("portfolios")
      .select(
        "id, username, user_id, status, is_disabled, promo_bar_enabled, created_at, updated_at"
      )
      .neq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(50)

    if (status !== "all") query = query.eq("status", status)
    if (q) {
      const filters = [`username.ilike.%${q}%`]
      if (matchingOwnerIds.length) {
        filters.push(`user_id.in.(${matchingOwnerIds.join(",")})`)
      }
      query = query.or(filters.join(","))
    }

    const { data } = await query
    portfolios = data ?? []

    const ownerIds = [...new Set(portfolios.map((item) => item.user_id))]
    if (ownerIds.length) {
      const { data: owners } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ownerIds)
      for (const owner of owners ?? []) {
        ownerMap.set(owner.id, {
          full_name: owner.full_name,
          email: owner.email,
        })
      }
    }
  }

  let users: AdminUser[] = []
  const portfolioByUser = new Map<string, UserPortfolio>()

  let banners: AdminPromoBanner[] = []
  if (tab === "banners") {
    const result = await adminListPromoBannersAction()
    banners = result.ok ? result.banners : []
  }

  let admins: Pick<Profile, "id" | "email" | "full_name" | "created_at">[] = []
  if (tab === "admins") {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: false })
    admins = data ?? []
  }

  if (tab === "users") {
    let usersQuery = supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .neq("id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
    if (q) {
      usersQuery = usersQuery.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
    }

    const { data } = await usersQuery
    users = data ?? []

    if (users.length) {
      const { data: rows } = await supabase
        .from("portfolios")
        .select("id, user_id, username, status, is_disabled")
        .in(
          "user_id",
          users.map((user) => user.id)
        )
      for (const row of rows ?? []) portfolioByUser.set(row.user_id, row)
    }
  }

  const hasFilters = Boolean(q) || (tab === "portfolios" && status !== "all")

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Admin
          </p>
          <h1 className="mt-1.5 font-heading text-3xl font-semibold tracking-[-0.035em]">
            Portfolios and people
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Turn an owner&apos;s page on or off, choose whether it shows the
            promo banner, or step in to edit on their behalf.
          </p>
        </div>

        <form
          action="/admin"
          method="get"
          className="flex items-center gap-2 self-start lg:self-auto"
        >
          {tab === "users" ? (
            <input type="hidden" name="tab" value="users" />
          ) : status !== "all" ? (
            <input type="hidden" name="status" value={status} />
          ) : null}
          <div className="relative">
            <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder={
                tab === "users"
                  ? "Search name or email…"
                  : "Search username, owner, or email…"
              }
              className="h-9 w-full pl-8 text-sm sm:w-72"
            />
          </div>
          <Button type="submit" variant="outline" className="h-9 text-sm">
            Search
          </Button>
        </form>
      </div>

      <nav className="flex items-center gap-5 border-b">
        <Link
          href={buildHref({ tab: "portfolios", status, q })}
          aria-current={tab === "portfolios" ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex items-center gap-2 border-b-2 px-0.5 pb-2.5 text-sm font-medium transition-colors",
            tab === "portfolios"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <IconWorld className="size-4" />
          Portfolios
          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground tabular-nums">
            {totalPortfolios ?? 0}
          </span>
        </Link>
        <Link
          href={buildHref({ tab: "users", status, q })}
          aria-current={tab === "users" ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex items-center gap-2 border-b-2 px-0.5 pb-2.5 text-sm font-medium transition-colors",
            tab === "users"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <IconUsers className="size-4" />
          Users
          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground tabular-nums">
            {totalUsers ?? 0}
          </span>
        </Link>
        <Link
          href={buildHref({ tab: "banners", status, q })}
          aria-current={tab === "banners" ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex items-center gap-2 border-b-2 px-0.5 pb-2.5 text-sm font-medium transition-colors",
            tab === "banners"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Banners
          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground tabular-nums">
            {totalBanners ?? 0}
          </span>
        </Link>
        <Link
          href={buildHref({ tab: "admins", status, q })}
          aria-current={tab === "admins" ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex items-center gap-2 border-b-2 px-0.5 pb-2.5 text-sm font-medium transition-colors",
            tab === "admins"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Admins
          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground tabular-nums">
            {totalAdmins ?? 0}
          </span>
        </Link>
      </nav>

      {tab === "portfolios" ? (
        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Portfolios</CardTitle>
                <CardDescription>
                  {liveCount ?? 0} live · {disabledCount ?? 0} disabled ·{" "}
                  {portfolios.length} shown, newest activity first.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {STATUSES.map((item) => (
                  <Button
                    key={item.value}
                    variant={status === item.value ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    nativeButton={false}
                    render={
                      <Link href={buildHref({ tab, status: item.value, q })} />
                    }
                  >
                    {item.label}
                  </Button>
                ))}
                {hasFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    nativeButton={false}
                    render={<Link href="/admin" />}
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Portfolio</TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Banner</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Updated
                  </TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolios.map((portfolio) => {
                  const owner = ownerMap.get(portfolio.user_id)
                  const isLive =
                    portfolio.status === "published" && !portfolio.is_disabled

                  return (
                    <TableRow key={portfolio.id}>
                      <TableCell className="pl-6">
                        <div className="font-medium">/{portfolio.username}</div>
                        <div className="text-xs text-muted-foreground">
                          Created {formatDate(portfolio.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="max-w-44 truncate">
                          {owner?.full_name || "—"}
                        </div>
                        <div className="max-w-44 truncate text-xs text-muted-foreground">
                          {owner?.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-medium capitalize",
                            STATUS_BADGE[portfolio.status]
                          )}
                        >
                          {portfolio.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <PortfolioAccessSwitch
                          portfolioId={portfolio.id}
                          username={portfolio.username}
                          enabled={!portfolio.is_disabled}
                          published={portfolio.status === "published"}
                        />
                      </TableCell>
                      <TableCell>
                        <PortfolioBannerSwitch
                          portfolioId={portfolio.id}
                          username={portfolio.username}
                          enabled={portfolio.promo_bar_enabled}
                        />
                      </TableCell>
                      <TableCell className="hidden text-xs whitespace-nowrap text-muted-foreground xl:table-cell">
                        {formatDateTime(portfolio.updated_at)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Edit /${portfolio.username}`}
                            title="Edit portfolio"
                            nativeButton={false}
                            render={
                              <Link
                                href={`/admin/portfolios/${portfolio.id}`}
                              />
                            }
                          >
                            <IconPencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Preview /${portfolio.username}`}
                            title="Preview draft"
                            nativeButton={false}
                            render={
                              <Link
                                href={`/admin-preview/${portfolio.id}`}
                                target="_blank"
                                rel="noreferrer"
                              />
                            }
                          >
                            <IconEye />
                          </Button>
                          {isLive ? (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Open /${portfolio.username} publicly`}
                              title="Open public page"
                              nativeButton={false}
                              render={
                                <a
                                  href={publicPortfolioUrl(portfolio.username)}
                                  target="_blank"
                                  rel="noreferrer"
                                />
                              }
                            >
                              <IconArrowUpRight />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {!portfolios.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No portfolios match this view.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : tab === "users" ? (
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {users.length} shown, newest accounts first. Sensitive credentials
              are never exposed here.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Portfolio</TableHead>
                  <TableHead className="pr-6">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const portfolio = portfolioByUser.get(user.id)
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="max-w-40 truncate pl-6 font-medium">
                        {user.full_name || "—"}
                      </TableCell>
                      <TableCell className="max-w-56 truncate text-xs text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "outline"
                          }
                          className="text-[0.65rem] capitalize"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {portfolio ? (
                          <Link
                            href={`/admin/portfolios/${portfolio.id}`}
                            className="font-medium underline-offset-4 hover:underline"
                          >
                            /{portfolio.username}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No portfolio
                          </span>
                        )}
                        {portfolio?.is_disabled ? (
                          <span className="ml-1.5 text-[0.65rem] text-muted-foreground">
                            disabled
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="pr-6 text-xs whitespace-nowrap text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {!users.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No users match this search.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            <p className="border-t px-6 py-3 text-xs leading-relaxed text-muted-foreground">
              To promote another administrator, update{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono">
                public.profiles.role
              </code>{" "}
              directly in the database.
            </p>
          </CardContent>
        </Card>
      ) : tab === "admins" ? (
        <AdminManager initialAdmins={admins} />
      ) : (
        <BannerManager initialBanners={banners} />
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        Access and banner changes are recorded in the{" "}
        <Link
          href="/admin/audit"
          className="font-medium underline underline-offset-4 hover:text-foreground"
        >
          audit log
        </Link>
        .
      </p>
    </div>
  )
}
