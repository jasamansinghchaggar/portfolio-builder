"use client"

import Link, { useLinkStatus } from "next/link"
import type { ComponentProps } from "react"

function LinkPendingIndicator() {
  const { pending } = useLinkStatus()

  if (!pending) return null

  return <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-current" />
}

export function PendingLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      <LinkPendingIndicator />
      {children}
    </Link>
  )
}
