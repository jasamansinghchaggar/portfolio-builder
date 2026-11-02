"use client"

import { useEffect, useRef, useState } from "react"
import { IconCrosshair } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  DEFAULT_FOCAL,
  clampFocal,
  type FocalPoint,
} from "@/lib/portfolio/media"

const PREVIEWS = [
  { label: "Logo / avatar", ratio: "1 / 1", note: "Square" },
  { label: "Hero banner", ratio: "16 / 9", note: "Wide" },
  { label: "Product card", ratio: "4 / 3", note: "Card" },
  { label: "Project card", ratio: "16 / 10", note: "Card" },
] as const

function round(value: number) {
  return Math.round(value * 1000) / 1000
}

function objectPosition(focal: FocalPoint) {
  return `${(focal.x * 100).toFixed(2)}% ${(focal.y * 100).toFixed(2)}%`
}

/**
 * Lets the owner pick which part of an image stays visible when the renderers
 * crop it with `object-fit: cover`. The chosen point is stored with the media
 * row and reused everywhere the image appears.
 */
export function MediaCropDialog({
  file,
  open,
  busy = false,
  onOpenChange,
  onConfirm,
}: {
  file: File | null
  open: boolean
  busy?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (focal: FocalPoint) => void
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [src] = useState(() => (file ? URL.createObjectURL(file) : null))
  const [focal, setFocal] = useState<FocalPoint>(DEFAULT_FOCAL)

  useEffect(() => {
    if (!src) return
    return () => URL.revokeObjectURL(src)
  }, [src])

  function pointFromEvent(event: React.PointerEvent<HTMLDivElement>) {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return
    setFocal({
      x: round(clampFocal((event.clientX - rect.left) / rect.width)),
      y: round(clampFocal((event.clientY - rect.top) / rect.height)),
    })
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (busy) return
    event.preventDefault()
    dragging.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    pointFromEvent(event)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current || busy) return
    pointFromEvent(event)
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function nudge(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.1 : 0.02
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }
    const move = delta[event.key]
    if (!move) return
    event.preventDefault()
    setFocal((current) => ({
      x: round(clampFocal(current.x + move[0])),
      y: round(clampFocal(current.y + move[1])),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Choose the crop</DialogTitle>
          <DialogDescription>
            Click or drag on the image to pick the part that should stay
            visible. The previews show how it will look in each layout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-2">
            {src ? (
              <div className="relative mx-auto w-fit max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Image being cropped"
                  className="block max-h-[42vh] w-auto max-w-full select-none"
                  draggable={false}
                />
                <div
                  ref={frameRef}
                  role="group"
                  tabIndex={0}
                  aria-label="Focal point. Click or drag, or use the arrow keys."
                  className="absolute inset-0 cursor-crosshair touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onKeyDown={nudge}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 w-px bg-white/70 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                    style={{ left: `${focal.x * 100}%` }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 h-px bg-white/70 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                    style={{ top: `${focal.y * 100}%` }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/20 shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
                    style={{
                      left: `${focal.x * 100}%`,
                      top: `${focal.y * 100}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="grid h-40 place-items-center text-muted-foreground">
                <Spinner className="size-4" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <IconCrosshair className="size-3.5" />
              Focal point
            </span>
            <span className="tabular-nums">
              {Math.round(focal.x * 100)}% · {Math.round(focal.y * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PREVIEWS.map((preview) => (
              <div key={preview.label} className="space-y-1">
                <div
                  className="overflow-hidden rounded-md border bg-muted/40"
                  style={{ aspectRatio: preview.ratio }}
                >
                  {src ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={src}
                      alt=""
                      className="size-full object-cover"
                      style={{ objectPosition: objectPosition(focal) }}
                    />
                  ) : null}
                </div>
                <p className="text-[0.65rem] leading-tight font-medium">
                  {preview.label}
                </p>
                <p className="text-[0.6rem] leading-tight text-muted-foreground">
                  {preview.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => setFocal(DEFAULT_FOCAL)}
            disabled={busy}
          >
            Reset to centre
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>

            <Button
              type="button"
              className="h-8 text-xs"
              onClick={() => onConfirm(focal)}
              disabled={busy || !src}
            >
              {busy ? <Spinner className="size-3" /> : null}
              {busy ? "Uploading…" : "Upload image"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
