import type { Metadata } from "next"
import Link from "next/link"
import {
  IconBrandWhatsapp,
  IconCheck,
  IconInbox,
  IconMail,
  IconMessage,
  IconPhone,
  IconTrash,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { deleteMessageAction, markMessageReadAction } from "@/lib/actions/inbox"
import { requireUser } from "@/lib/auth"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type PageProps = {
  searchParams: Promise<{ filter?: string | string[] }>
}

export default async function MessagesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawFilter = Array.isArray(params.filter) ? params.filter[0] : params.filter
  const filter = rawFilter === "all" ? "all" : "unread"

  const { supabase, userId } = await requireUser("/messages")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()
  const isAdmin = profile?.role === "admin"

  const { data: messages } = await supabase
    .from("portfolio_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  const portfolioIds = [
    ...new Set((messages ?? []).map((message) => message.portfolio_id)),
  ]
  const { data: portfolios } = portfolioIds.length
    ? await supabase
        .from("portfolios")
        .select("id, username")
        .in("id", portfolioIds)
    : { data: [] }
  const portfolioMap = new Map(
    (portfolios ?? []).map((portfolio) => [portfolio.id, portfolio.username])
  )

  const allMessages = messages ?? []
  const unreadCount = allMessages.filter((message) => !message.read_at).length
  const visibleMessages =
    filter === "unread"
      ? allMessages.filter((message) => !message.read_at)
      : allMessages

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {isAdmin ? "Admin inbox" : "Inbox"}
          </p>
          <h1 className="mt-1.5 font-heading text-3xl font-semibold tracking-[-0.035em]">
            Website messages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin
              ? "Enquiries across every published portfolio. Newest first."
              : "Enquiries sent through your portfolio contact form."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs">
            <IconMessage className="size-3.5 text-muted-foreground" />
            {allMessages.length} total
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
              unreadCount
                ? "border-amber-600/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                : "bg-card text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                unreadCount ? "bg-amber-500" : "bg-muted-foreground/40"
              )}
            />
            {unreadCount} unread
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          href="/messages?filter=all"
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            filter === "all"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </Link>
        <Link
          href="/messages?filter=unread"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            filter === "unread"
              ? "border-amber-600/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="size-1.5 rounded-full bg-amber-500" />
          Unread
        </Link>
      </div>

      {visibleMessages.length ? (
        <ul className="space-y-2">
          {visibleMessages.map((message) => {
            const username = portfolioMap.get(message.portfolio_id)
            const isUnread = !message.read_at
            return (
              <li
                key={message.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-card transition-colors",
                  isUnread
                    ? "border-amber-600/25 bg-amber-500/[0.03]"
                    : "border-border/60"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-0 left-0 w-1",
                    isUnread ? "bg-amber-500" : "bg-transparent"
                  )}
                />
                <div className="flex gap-3 p-4 pl-5">
                  <span
                    className={cn(
                      "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                      isUnread
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <IconInbox className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2
                        className={cn(
                          "font-heading text-sm",
                          isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                        )}
                      >
                        {message.name}
                      </h2>
                      {isUnread ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-300">
                          <span className="size-1 rounded-full bg-amber-500" />
                          New
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[0.6rem] font-medium tracking-wide text-muted-foreground uppercase">
                          <IconCheck className="size-2.5" />
                          Read
                        </span>
                      )}
                      {isAdmin && username ? (
                        <Link
                          href={`/admin/portfolios/${message.portfolio_id}`}
                          className="font-mono text-[0.65rem] text-muted-foreground underline-offset-4 hover:underline"
                        >
                          /{username}
                        </Link>
                      ) : null}
                      <span className="ml-auto text-[0.65rem] text-muted-foreground">
                        {formatDateTime(message.created_at)}
                      </span>
                    </div>

                    <p
                      className={cn(
                        "mt-1.5 whitespace-pre-wrap text-sm leading-relaxed",
                        isUnread ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {message.message}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-2.5 text-xs">
                      {message.email ? (
                        <a
                          href={`mailto:${message.email}`}
                          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-medium text-foreground/80 underline-offset-4 hover:bg-muted hover:text-foreground hover:underline"
                        >
                          <IconMail className="size-3.5 text-muted-foreground" />
                          {message.email}
                        </a>
                      ) : null}
                      {message.phone ? (
                        <>
                          <a
                            href={`tel:${message.phone.replace(/[^+\d]/g, "")}`}
                            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-medium text-foreground/80 underline-offset-4 hover:bg-muted hover:text-foreground hover:underline"
                          >
                            <IconPhone className="size-3.5 text-muted-foreground" />
                            {message.phone}
                          </a>
                          <a
                            href={`https://wa.me/${message.phone.replace(/[^\d]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-medium text-foreground/80 underline-offset-4 hover:bg-muted hover:text-foreground hover:underline"
                          >
                            <IconBrandWhatsapp className="size-3.5 text-muted-foreground" />
                            WhatsApp
                          </a>
                        </>
                      ) : null}
                      <div className="ml-auto flex items-center gap-1">
                        <form action={markMessageReadAction}>
                          <input
                            type="hidden"
                            name="messageId"
                            value={message.id}
                          />
                          <input
                            type="hidden"
                            name="read"
                            value={message.read_at ? "0" : "1"}
                          />
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            {message.read_at ? "Mark unread" : "Mark read"}
                          </Button>
                        </form>
                        <form action={deleteMessageAction}>
                          <input
                            type="hidden"
                            name="messageId"
                            value={message.id}
                          />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete message from ${message.name}`}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <IconTrash />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <IconInbox className="mx-auto size-7 text-muted-foreground/50" />
          <h2 className="mt-3 font-heading text-lg font-semibold">
            {filter === "unread" ? "No unread messages" : "No messages yet"}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {isAdmin
              ? filter === "unread"
                ? "All enquiries have been read."
                : "Enquiries from published portfolios will appear here."
              : filter === "unread"
                ? "You're all caught up."
                : "When someone uses the contact form on your website, their message will appear here. You can reply by email, phone, or WhatsApp."}
          </p>
          {filter === "unread" ? (
            <Button
              variant="outline"
              className="mt-4 h-9 text-sm"
              nativeButton={false}
              render={<Link href="/messages?filter=all" />}
            >
              View all messages
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}