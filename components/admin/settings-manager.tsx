"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Switch } from "@/components/ui/switch"
import {
  adminUpdatePlatformSettingsAction,
  type PlatformSettings,
} from "@/lib/actions/admin"

export function SettingsManager({
  initialSettings,
}: {
  initialSettings: PlatformSettings
}) {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [pending, startTransition] = useTransition()

  function handleToggle(next: boolean) {
    startTransition(async () => {
      try {
        const result = await adminUpdatePlatformSettingsAction({
          showAttribution: next,
        })
        if (!result.ok) {
          toast.error("Couldn't update settings", {
            description: result.error,
          })
          return
        }
        setSettings((current) => ({ ...current, showAttribution: next }))
        toast.success(next ? "Attribution shown" : "Attribution hidden")
        router.refresh()
      } catch {
        toast.error("Couldn't update settings", {
          description: "Check your connection and try again.",
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg font-semibold">Public portfolio</h2>
        <p className="text-sm text-muted-foreground">
          Site-wide options applied to every published portfolio.
        </p>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Show &ldquo;Made with&rdquo; attribution
          </p>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            Adds a small credit to the public footer and the social preview
            image. Turn it off for a fully white-label portfolio. Existing
            deployments stay visible until you change this.
          </p>
        </div>
        <Switch
          checked={settings.showAttribution}
          onCheckedChange={handleToggle}
          disabled={pending}
          aria-label="Show attribution"
        />
      </div>
    </div>
  )
}
