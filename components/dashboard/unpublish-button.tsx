"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { IconEyeOff } from "@tabler/icons-react"
import { toast } from "sonner"

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
import { Spinner } from "@/components/ui/spinner"
import { unpublishPortfolioAction } from "@/lib/actions/portfolio"

export function UnpublishButton({
  portfolioId,
  revision,
  className,
}: {
  portfolioId: string
  revision: number
  className?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function unpublish() {
    setPending(true)
    const result = await unpublishPortfolioAction({ portfolioId, revision })
    setPending(false)

    if (!result.ok) {
      toast.error("Couldn't unpublish", { description: result.error })
      return
    }

    setOpen(false)
    toast.success("Portfolio unpublished", {
      description: "The public link no longer shows your portfolio.",
    })
    router.refresh()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" className={className ?? "h-9 text-sm"} />
        }
      >
        <IconEyeOff />
        Unpublish
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <IconEyeOff />
          </AlertDialogMedia>
          <AlertDialogTitle>Take your portfolio offline?</AlertDialogTitle>
          <AlertDialogDescription>
            The public link stops working immediately. Your draft and published
            snapshot are kept, so you can publish again later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep it live</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault()
              void unpublish()
            }}
          >
            {pending ? <Spinner className="size-4" /> : null}
            {pending ? "Unpublishing…" : "Unpublish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
