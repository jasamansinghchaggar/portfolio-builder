"use client"

import { useState } from "react"
import { IconCheck, IconCopy } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyUrlButton({
  url,
  label = "Copy link",
  className,
  variant = "outline",
  size = "sm",
}: {
  url: string
  label?: string
  className?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copied")
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("Couldn't copy the link", {
        description: "Select and copy it manually instead.",
      })
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={copy}
      className={cn("h-8 text-xs", className)}
    >
      {copied ? <IconCheck /> : <IconCopy />}
      {copied ? "Copied" : label}
    </Button>
  )
}
