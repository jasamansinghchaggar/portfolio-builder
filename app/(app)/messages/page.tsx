import type { Metadata } from "next"
import Link from "next/link"
import {
  IconBrandWhatsapp,
  IconCheck,
  IconMail,
  IconMessage,
  IconPhone,
  IconTrash,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { deleteMessageAction, markMessageReadAction } from "@/lib/actions/inbox"
import { redirect } from "next/navigation"

import { requireUser } from "@/lib/auth"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function MessagesPage() {
  const { supabase, userId } = await requireUser("/messages")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()
  const isAdmin = profile?.role === "admin"
  if (isAdmin) redirect("/admin")

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

  const unread = (messages ?? []).filter((message) => !message.read_at).length

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
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
            {messages?.length ?? 0} total
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
              unread
                ? "border-amber-600/25 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                : "bg-card text-muted-foreground"
            )}
          >
            {unread} unread
          </span>
        </div>
      </div>

      {messages?.length ? (
        <div className="space-y-3">
          {messages.map((message) => {
            const username = portfolioMap.get(message.portfolio_id)
            return (
              <article
                key={message.id}
                className={cn(
                  "rounded-xl border bg-card p-4",
                  !message.read_at && "border-foreground/20"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-base font-semibold">
                        {message.name}
                      </h2>
                      {!message.read_at ? (
                        <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-300">
                          New
                        </span>
                      ) : null}
                      {isAdmin && username ? (
                        <Link
                          href={`/admin/portfolios/${message.portfolio_id}`}
                          className="font-mono text-[0.65rem] text-muted-foreground underline-offset-4 hover:underline"
                        >
                          /{username}
                        </Link>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                      {formatDateTime(message.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
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

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                  {message.message}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-2.5 text-xs">
                  {message.email ? (
                    <a
                      href={`mailto:${message.email}`}
                      className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
                    >
                      <IconMail className="size-3.5 text-muted-foreground" />
                      {message.email}
                    </a>
                  ) : null}
                  {message.phone ? (
                    <>
                      <a
                        href={`tel:${message.phone.replace(/[^+\d]/g, "")}`}
                        className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
                      >
                        <IconPhone className="size-3.5 text-muted-foreground" />
                        {message.phone}
                      </a>
                      <a
                        href={`https://wa.me/${message.phone.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
                      >
                        <IconBrandWhatsapp className="size-3.5 text-muted-foreground" />
                        WhatsApp
                      </a>
                    </>
                  ) : null}
                  {message.read_at ? (
                    <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground">
                      <IconCheck className="size-3.5" />
                      Read
                    </span>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <IconMail className="mx-auto size-7 text-muted-foreground/50" />
          <h2 className="mt-3 font-heading text-lg font-semibold">
            No messages yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {isAdmin
              ? "Enquiries from published portfolios will appear here."
              : "When someone uses the contact form on your website, their message will appear here. You can reply by email, phone, or WhatsApp."}
          </p>
        </div>
      )}
    </div>
  )
}
