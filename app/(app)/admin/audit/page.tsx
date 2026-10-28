import type { Metadata } from "next"
import Link from "next/link"
import { IconArrowLeft, IconHistory } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireAdmin } from "@/lib/auth"
import { formatDateTime } from "@/lib/format"

export const metadata: Metadata = {
  title: "Audit log",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const ACTION_LABEL: Record<string, string> = {
  "portfolio.save_draft": "Saved draft",
  "portfolio.publish": "Published",
  "portfolio.unpublish": "Unpublished",
}

export default async function AdminAuditPage() {
  const { supabase } = await requireAdmin()

  const { data: entries } = await supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Admin
          </p>
          <h1 className="mt-1.5 font-heading text-3xl font-semibold tracking-[-0.035em]">
            Audit log
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administrative saves, publications, and unpublishes. Newest first.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-9 text-sm"
          nativeButton={false}
          render={<Link href="/admin" />}
        >
          <IconArrowLeft />
          Back to admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconHistory className="size-4 text-muted-foreground" />
            Recent activity
          </CardTitle>
          <CardDescription>
            {entries?.length ?? 0} entries shown. Records are written by the
            database and cannot be edited from the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(entries ?? []).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-[0.7rem] whitespace-nowrap text-muted-foreground">
                      {formatDateTime(entry.created_at)}
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-[0.75rem]">
                      {entry.actor_email || "—"}
                    </TableCell>
                    <TableCell className="text-[0.75rem]">
                      {ACTION_LABEL[entry.action] ?? entry.action}
                    </TableCell>
                    <TableCell className="font-mono text-[0.65rem] text-muted-foreground">
                      {entry.target_id ? (
                        <Link
                          href={`/admin/portfolios/${entry.target_id}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {entry.target_id.slice(0, 8)}…
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="max-w-56 truncate font-mono text-[0.6rem] text-muted-foreground">
                      {JSON.stringify(entry.detail)}
                    </TableCell>
                  </TableRow>
                ))}
                {!entries?.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-xs text-muted-foreground"
                    >
                      No administrative changes recorded yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
