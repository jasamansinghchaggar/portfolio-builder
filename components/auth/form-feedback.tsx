import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

export function FormFeedback({
  status,
  message,
  className,
}: {
  status: "idle" | "error" | "success"
  message?: string
  className?: string
}) {
  if (!message || status === "idle") return null

  const error = status === "error"

  return (
    <div
      role={error ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm leading-relaxed",
        error
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-emerald-600/25 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300",
        className
      )}
    >
      {error ? (
        <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
      ) : (
        <IconCircleCheck className="mt-0.5 size-4 shrink-0" />
      )}
      <p>{message}</p>
    </div>
  )
}
