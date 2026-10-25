"use client"

import { useState } from "react"
import { IconFileTypePdf, IconFolder, IconPhoto } from "@tabler/icons-react"

import { DeleteMediaButton } from "@/components/editor/media-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { isImageMime, mediaHref, type EditorMedia } from "@/lib/portfolio/media"

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaLibrary({
  media,
  onDeleted,
}: {
  media: EditorMedia[]
  onDeleted: (id: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-8 text-xs"
        onClick={() => setOpen(true)}
      >
        <IconFolder />
        Files
        <span className="ml-1 rounded-full bg-muted px-1.5 text-[0.6rem] text-muted-foreground tabular-nums">
          {media.length}
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Media library</DialogTitle>
            <DialogDescription>
              Images and CVs attached to this portfolio. Files in use can&apos;t
              be deleted until you remove them from the content and save. If a
              file is on your live page, publish that change first.
            </DialogDescription>
          </DialogHeader>

          {media.length ? (
            <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg border bg-background"
                >
                  <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-muted/40">
                    {isImageMime(item.mimeType) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={mediaHref(item.id)}
                        alt={item.fileName}
                        className="size-full object-cover"
                      />
                    ) : (
                      <IconFileTypePdf className="size-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.65rem] font-medium">
                        {item.fileName}
                      </p>
                      <p className="text-[0.6rem] text-muted-foreground">
                        {fileSize(item.sizeBytes)} · {item.kind}
                      </p>
                    </div>
                    <DeleteMediaButton media={item} onDeleted={onDeleted} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed px-4 py-12 text-center">
              <IconPhoto className="mx-auto size-6 text-muted-foreground/50" />
              <p className="mt-2 text-xs text-muted-foreground">
                No files yet. Upload images or a CV from any image field.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
