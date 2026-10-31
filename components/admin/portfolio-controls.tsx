"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Switch } from "@/components/ui/switch"
import {
  adminSetPortfolioEnabledAction,
  adminSetPortfolioPromoBarAction,
} from "@/lib/actions/admin"
import { cn } from "@/lib/utils"

function ToggleLabel({
  checked,
  onLabel,
  offLabel,
}: {
  checked: boolean
  onLabel: string
  offLabel: string
}) {
  return (
    <span
      className={cn(
        "text-[0.65rem] font-medium",
        checked ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {checked ? onLabel : offLabel}
    </span>
  )
}

/**
 * Admin access gate. Disabling a portfolio makes its public page, media, and
 * contact form unavailable without touching its publication state.
 */
export function PortfolioAccessSwitch({
  portfolioId,
  username,
  enabled,
  published,
}: {
  portfolioId: string
  username: string
  enabled: boolean
  published: boolean
}) {
  const router = useRouter()
  const [checked, setChecked] = useState(enabled)
  const [pending, startTransition] = useTransition()

  function change(next: boolean) {
    setChecked(next)
    startTransition(async () => {
      try {
        const result = await adminSetPortfolioEnabledAction({
          portfolioId,
          enabled: next,
        })

        if (!result.ok) {
          setChecked(!next)
          toast.error("Couldn't change access", { description: result.error })
          return
        }

        toast.success(next ? "Portfolio enabled" : "Portfolio disabled", {
          description: next
            ? published
              ? "The public page is live again."
              : "It will appear publicly once it is published."
            : "The public link now returns not found.",
        })
        router.refresh()
      } catch {
        setChecked(!next)
        toast.error("Couldn't change access", {
          description: "Check your connection and try again.",
        })
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={change}
        disabled={pending}
        aria-label={`${checked ? "Disable" : "Enable"} /${username}`}
      />
      <ToggleLabel checked={checked} onLabel="Enabled" offLabel="Disabled" />
    </div>
  )
}

/** Per-portfolio promo banner visibility. */
export function PortfolioBannerSwitch({
  portfolioId,
  username,
  enabled,
}: {
  portfolioId: string
  username: string
  enabled: boolean
}) {
  const router = useRouter()
  const [checked, setChecked] = useState(enabled)
  const [pending, startTransition] = useTransition()

  function change(next: boolean) {
    setChecked(next)
    startTransition(async () => {
      try {
        const result = await adminSetPortfolioPromoBarAction({
          portfolioId,
          enabled: next,
        })

        if (!result.ok) {
          setChecked(!next)
          toast.error("Couldn't change the banner", {
            description: result.error,
          })
          return
        }

        toast.success(next ? "Promo banner shown" : "Promo banner hidden", {
          description: next
            ? "Visitors will see the banner above the page."
            : "This portfolio now opens without the promo banner.",
        })
        router.refresh()
      } catch {
        setChecked(!next)
        toast.error("Couldn't change the banner", {
          description: "Check your connection and try again.",
        })
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={change}
        disabled={pending}
        aria-label={`${checked ? "Hide" : "Show"} promo banner on /${username}`}
      />
      <ToggleLabel checked={checked} onLabel="Shown" offLabel="Hidden" />
    </div>
  )
}
