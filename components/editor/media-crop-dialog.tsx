"use client"

import { useRef, useState } from "react"
import {
  IconCrop11,
  IconCrop169,
  IconCrop32,
  IconCropPortrait,
  IconGrid3x3,
} from "@tabler/icons-react"

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

const ASPECTS = [
  { id: "square", label: "Square", ratio: 1, icon: IconCrop11 },
  { id: "wide", label: "Wide", ratio: 16 / 9, icon: IconCrop169 },
  { id: "landscape", label: "Landscape", ratio: 4 / 3, icon: IconCrop32 },
  { id: "portrait", label: "Portrait", ratio: 4 / 5, icon: IconCropPortrait },
] as const

type AspectId = (typeof ASPECTS)[number]["id"]

function round(value: number) {
  return Math.round(value * 1000) / 1000
}

function objectPosition(crop: FocalPoint) {
  return `${(crop.x * 100).toFixed(2)}% ${(crop.y * 100).toFixed(2)}%`
}

export function MediaCropDialog({
  src,
  open,
  busy = false,
  initialCrop = DEFAULT_FOCAL,
  confirmLabel = "Apply crop",
  onOpenChange,
  onConfirm,
}: {
  src: string | null
  open: boolean
  busy?: boolean
  initialCrop?: FocalPoint
  confirmLabel?: string
  onOpenChange: (open: boolean) => void
  onConfirm: (crop: FocalPoint) => void
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{
    x: number
    y: number
    crop: FocalPoint
    imageWidth: number
    imageHeight: number
  } | null>(null)
  const [crop, setCrop] = useState<FocalPoint>(initialCrop)
  const [aspect, setAspect] = useState<AspectId>("landscape")
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(
    null
  )

  const activeAspect = ASPECTS.find((item) => item.id === aspect) ?? ASPECTS[0]

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (busy || !src) return
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return
    event.preventDefault()
    event.currentTarget.focus()

    const source = natural ?? { width: rect.width, height: rect.height }
    const scale = Math.max(rect.width / source.width, rect.height / source.height)

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      crop,
      imageWidth: source.width * scale,
      imageHeight: source.height * scale,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = dragStart.current
    const rect = frameRef.current?.getBoundingClientRect()
    if (!start || !rect || busy) return

    const overflowX = start.imageWidth - rect.width
    const overflowY = start.imageHeight - rect.height
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y

    setCrop({
      x: round(
        clampFocal(start.crop.x - (overflowX > 0 ? dx / overflowX : 0))
      ),
      y: round(
        clampFocal(start.crop.y - (overflowY > 0 ? dy / overflowY : 0))
      ),
    })
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    dragStart.current = null
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
    setCrop((current) => ({
      x: round(clampFocal(current.x + move[0])),
      y: round(clampFocal(current.y + move[1])),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Adjust crop</DialogTitle>
          <DialogDescription>
            Drag the image inside the grid to choose what stays in frame. Each
            placement keeps its own crop.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1">
            {ASPECTS.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant={aspect === item.id ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7"
                  aria-pressed={aspect === item.id}
                  onClick={() => setAspect(item.id)}
                  disabled={busy}
                >
                  <Icon />
                  {item.label}
                </Button>
              )
            })}
          </div>

          <div className="rounded-lg border bg-muted/30 p-2">
            {src ? (
              <div
                ref={frameRef}
                role="group"
                tabIndex={0}
                aria-label="Crop area. Drag the image to reposition it, or use the arrow keys."
                className="relative mx-auto touch-none overflow-hidden rounded-md bg-black/5 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 active:cursor-grabbing"
                style={{
                  aspectRatio: activeAspect.ratio,
                  width: "100%",
                  maxWidth: `calc(42vh * ${activeAspect.ratio})`,
                  maxHeight: "42vh",
                  cursor: busy ? "default" : "grab",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={nudge}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Image being cropped"
                  className="pointer-events-none absolute inset-0 size-full object-cover"
                  style={{ objectPosition: objectPosition(crop) }}
                  draggable={false}
                  onLoad={(event) =>
                    setNatural({
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight,
                    })
                  }
                />

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-white/60 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-white/60 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-white/60 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-white/60 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/70"
                />
                <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2 py-0.5 text-[0.6rem] whitespace-nowrap text-white">
                  Drag to reposition
                </span>
              </div>
            ) : (
              <div className="grid h-40 place-items-center text-muted-foreground">
                <Spinner className="size-4" />
              </div>
            )}
          </div>

          <p className="inline-flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
            <IconGrid3x3 className="size-3.5" />
            Rule-of-thirds grid
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => setCrop(DEFAULT_FOCAL)}
            disabled={busy}
          >
            Reset
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
              onClick={() => onConfirm(crop)}
              disabled={busy || !src}
            >
              {busy ? <Spinner className="size-3" /> : null}
              {busy ? "Uploading…" : confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
