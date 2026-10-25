import type { Metadata } from "next"
import Link from "next/link"
import {
  IconArrowUpRight,
  IconFileText,
  IconSearch,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react"

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
import { publicPortfolioUrl } from "@/lib/config"
import { formatDate, formatDateTime } from "@/lib/format"
import type { PortfolioStatus } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

type PageProps = {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[] }>
}

const STATUSES: { value: "all" | PortfolioStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "unpublished", label: "Unpublished" },
]

const STATUS_BADGE: Record<PortfolioStatus, string> = {
  draft: "border-amber-600/25 bg-amber-500/10 text-amber-800 dark:text-amber-300",
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

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = sanitizeSearch(single(params.q) ?? "")
  const requestedStatus = single(params.status)
  const status = STATUSES.some((item) => item.value === requestedStatus)
    ? (requestedStatus as "all" | PortfolioStatus)
    : "all"

  const { supabase } = await requireAdmin()

  const usersCount = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
  const portfoliosCount = supabase
    .from("portfolios")
    .select("id", { count: "exact", head: true })
  const publishedCount = supabase
    .from("portfolios")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
  const draftCount = supabase
    .from("portfolios")
    .select("id", { count: "exact", head: true })
    .in("status", ["draft", "unpublished"])

  let portfoliosQuery = supabase
    .from("portfolios")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50)
  if (status !== "all") portfoliosQuery = portfoliosQuery.eq("status", status)
  if (q) portfoliosQuery = portfoliosQuery.ilike("username", `%${q}%`)

  let usersQuery = supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(50)
  if (q) {
    usersQuery = usersQuery.or(
      `email.ilike.%${q}%,full_name.ilike.%${q}%`
    )
  }

  const [
    { count: totalUsers },
    { count: totalPortfolios },
    { count: totalPublished },
    { count: totalDrafts },
    { data: portfolios },
    { data: users },
  ] = await Promise.all([
    usersCount,
    portfoliosCount,
    publishedCount,
    draftCount,
    portfoliosQuery,
    usersQuery,
  ])

  const ownerIds = [...new Set((portfolios ?? []).map((item) => item.user_id))]
  const { data: owners } = ownerIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ownerIds)
    : { data: [] }
  const ownerMap = new Map((owners ?? []).map((owner) => [owner.id, owner]))

  const metrics = [
    {
      label: "Registered users",
      value: totalUsers ?? 0,
      icon: IconUsers,
      hint: "All accounts",
    },
    {
      label: "Portfolios",
      value: totalPortfolios ?? 0,
      icon: IconFileText,
      hint: "One per account",
    },
    {
      label: "Published",
      value: totalPublished ?? 0,
      icon: IconWorld,
      hint: "Live right now",
    },
    {
      label: "Draft & offline",
      value: totalDrafts ?? 0,
      icon: IconFileText,
      hint: "Not publicly visible",
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Admin
          </p>
          <h1 className="mt-1.5 font-heading text-3xl font-semibold tracking-[-0.035em]">
            Platform overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accounts, portfolios, and publication state. Read only.
          </p>
        </div>
        <form action="/admin" method="get" className="flex items-center gap-2">
          {status !== "all" ? (
            <input type="hidden" name="status" value={status} />
          ) : null}
          <div className="relative">
            <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search name, email, username…"
              className="h-9 w-full pl-8 text-sm sm:w-64"
            />
          </div>
          <Button type="submit" variant="outline" className="h-9 text-sm">
            Search
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {metric.label}
              </p>
              <metric.icon className="size-3.5 text-muted-foreground" />
            </div>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums tracking-[-0.04em]">
              {metric.value}
            </p>
            <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
              {metric.hint}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {STATUSES.map((item) => {
          const query = new URLSearchParams()
          if (q) query.set("q", q)
          if (item.value !== "all") query.set("status", item.value)
          const href = query.toString() ? `/admin?${query.toString()}` : "/admin"
          return (
            <Button
              key={item.value}
              variant={status === item.value ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              render={<Link href={href} />}
            >
              {item.label}
            </Button>
          )
        })}
        {q ? (
          <span className="ml-1 text-xs text-muted-foreground">
            Filtering by “{q}”
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Portfolios</CardTitle>
            <CardDescription>
              {portfolios?.length ?? 0} shown, newest activity first.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Portfolio</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(portfolios ?? []).map((portfolio) => {
                    const owner = ownerMap.get(portfolio.user_id)
                    return (
                      <TableRow key={portfolio.id}>
                        <TableCell>
                          <div className="font-medium">/{portfolio.username}</div>
                          <div className="text-[0.65rem] text-muted-foreground">
                            Created {formatDate(portfolio.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-40 truncate">
                            {owner?.full_name || "—"}
                          </div>
                          <div className="max-w-40 truncate text-[0.65rem] text-muted-foreground">
                            {owner?.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[0.6rem] font-medium capitalize",
                              STATUS_BADGE[portfolio.status]
                            )}
                          >
                            {portfolio.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-[0.65rem] text-muted-foreground">
                          {formatDateTime(portfolio.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          {portfolio.status === "published" ? (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label="Open portfolio"
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
                          ) : (
                            <span className="text-[0.65rem] text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {!portfolios?.length ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-xs text-muted-foreground"
                      >
                        No portfolios match this view.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {users?.length ?? 0} shown, newest accounts first. Sensitive
              credentials are never exposed here.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(users ?? []).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="max-w-32 truncate font-medium">
                        {user.full_name || "—"}
                      </TableCell>
                      <TableCell className="max-w-48 truncate text-[0.7rem] text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "admin" ? "default" : "outline"}
                          className="text-[0.6rem] capitalize"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[0.65rem] text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!users?.length ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-xs text-muted-foreground"
                      >
                        No users match this search.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-[0.65rem] leading-relaxed text-muted-foreground">
        Admin access is enforced on the server. Promote another administrator
        with a manual SQL update to{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono">
          public.profiles.role
        </code>
        .
      </p>
    </div>
  )
}
