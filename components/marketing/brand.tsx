import Link from "next/link"

import { APP_NAME } from "@/lib/config"
import { cn } from "@/lib/utils"

export function Brand({
  href = "/",
  className,
}: {
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 text-foreground",
        className
      )}
      aria-label={`${APP_NAME} home`}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background shadow-sm transition-transform group-hover:-rotate-3">
        <span className="font-heading text-sm font-semibold leading-none">
          {APP_NAME.slice(0, 1)}
        </span>
      </span>
      <span className="font-heading text-[0.95rem] font-semibold tracking-tight">
        {APP_NAME}
      </span>
    </Link>
  )
}
