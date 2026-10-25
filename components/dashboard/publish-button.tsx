"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconCircleCheck,
  IconWorldUpload,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { CopyUrlButton } from "@/components/dashboard/copy-url-button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { publishPortfolioAction } from "@/lib/actions/portfolio"
import type { PublishIssue } from "@/lib/portfolio/publish"
import type { PortfolioContent } from "@/lib/portfolio/types"

export function PublishButton({
  portfolioId,
  revision,
  content,
  status,
  hasUnpublishedChanges,
  className,
}: {
  portfolioId: string
  revision: number
  content: PortfolioContent
  status: "draft" | "published" | "unpublished"
  hasUnpublishedChanges: boolean
  className?: string
}) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [issues, setIssues] = useState<PublishIssue[] | null>(null)
  const [successUrl, setSuccessUrl] = useState<string | null>(null)

  const label =
    status === "published"
      ? hasUnpublishedChanges
        ? "Publish changes"
        : "Republish"
      : "Publish portfolio"

  async function publish() {
    setPending(true)
    const result = await publishPortfolioAction({
      portfolioId,
      revision,
      content,
    })
    setPending(false)

    if (!result.ok) {
      setConfirmOpen(false)
      if (result.issues?.length) {
        setIssues(result.issues)
      } else {
        toast.error("Couldn't publish", {
          description: result.error ?? "Please try again.",
        })
      }
      return
    }

    setConfirmOpen(false)
    setSuccessUrl(result.url)
    toast.success("Your portfolio is live")
    router.refresh()
  }

  return (
    <>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger
          render={<Button className={className ?? "h-9 text-sm"} />}
        >
          <IconWorldUpload data-icon="inline-start" />
          {label}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <IconWorldUpload />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {status === "published"
                ? "Publish these changes?"
                : "Publish your portfolio?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {status === "published"
                ? "This replaces the live page with the current draft. Hidden sections and their files stay private."
                : "Your draft becomes a public page at your portfolio address. You can unpublish at any time."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Not yet</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault()
                void publish()
              }}
            >
              {pending ? <Spinner className="size-4" /> : null}
              {pending ? "Publishing…" : "Publish now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(issues)}
        onOpenChange={(open) => {
          if (!open) setIssues(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mb-1 grid size-9 place-items-center rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-400">
              <IconAlertTriangle className="size-4" />
            </div>
            <DialogTitle>Almost there — a few loose ends</DialogTitle>
            <DialogDescription>
              Publishing is paused so visitors don&apos;t see an unfinished
              page. Fix these, then publish again.
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
            {issues?.map((issue, index) => (
              <li
                key={`${issue.path}-${index}`}
                className="rounded-lg border bg-muted/30 px-3 py-2.5"
              >
                <p className="text-sm leading-relaxed">{issue.message}</p>
                {issue.sectionLabel && issue.sectionId ? (
                  <Link
                    href={`/editor?section=${issue.sectionId}`}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Fix {issue.sectionLabel}
                    <IconArrowUpRight className="size-3" />
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-9 text-sm"
              nativeButton={false}
              render={<Link href="/editor" />}
            >
              Open editor
            </Button>
            <Button className="h-9 text-sm" onClick={() => setIssues(null)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(successUrl)}
        onOpenChange={(open) => {
          if (!open) setSuccessUrl(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-1 grid size-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <IconCircleCheck className="size-5" />
            </div>
            <DialogTitle>Your portfolio is live.</DialogTitle>
            <DialogDescription>
              Share the link anywhere. Draft edits won&apos;t appear here until
              you publish again.
            </DialogDescription>
          </DialogHeader>
          {successUrl ? (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
              <span className="min-w-0 flex-1 truncate font-mono text-xs">
                {successUrl}
              </span>
              <CopyUrlButton url={successUrl} />
            </div>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              className="h-9 text-sm"
              nativeButton={false}
              render={<Link href="/editor" />}
            >
              Keep editing
            </Button>
            {successUrl ? (
              <Button
                className="h-9 text-sm"
                nativeButton={false}
                render={
                  <a href={successUrl} target="_blank" rel="noreferrer" />
                }
              >
                View portfolio
                <IconArrowUpRight />
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
