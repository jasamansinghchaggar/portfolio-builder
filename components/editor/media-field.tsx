"use client"

import { useRef, useState } from "react"
import {
  IconFileTypePdf,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { EditorField } from "@/components/editor/fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { deleteMediaAction, uploadMediaAction } from "@/lib/actions/media"
import {
  isImageMime,
  mediaHref,
  type EditorMedia,
  type MediaKind,
} from "@/lib/portfolio/media"
import { cn } from "@/lib/utils"

export function MediaField({
  label,
  hint,
  value,
  onChange,
  media,
  onMediaAdded,
  kind = "general",
  accept = "image",
}: {
  label: string
  hint?: React.ReactNode
  value: string | null
  onChange: (value: string | null) => void
  media: EditorMedia[]
  onMediaAdded: (media: EditorMedia) => void
  kind?: MediaKind
  accept?: "image" | "pdf"
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const selected = media.find((item) => item.id === value)
  const options = media.filter((item) =>
    accept === "pdf" ? item.mimeType === "application/pdf" : isImageMime(item.mimeType)
  )

  async function upload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("kind", kind)
      const result = await uploadMediaAction(formData)
      if (!result.ok) {
        toast.error("Upload failed", { description: result.error })
        return
      }
      onMediaAdded(result.media)
      onChange(result.media.id)
      toast.success("File uploaded")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <EditorField label={label} hint={hint}>
      <div className="rounded-lg border bg-muted/15 p-2">
        <div className="flex items-center gap-3">
          <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md border bg-background">
            {selected && isImageMime(selected.mimeType) ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={mediaHref(selected.id)}
                alt=""
                className="size-full object-cover"
              />
            ) : selected ? (
              <IconFileTypePdf className="size-5 text-muted-foreground" />
            ) : (
              <IconPhoto className="size-5 text-muted-foreground/50" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">
              {selected ? selected.fileName : "No file selected"}
            </p>
            <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
              {accept === "pdf"
                ? "PDF, up to 5 MB"
                : "JPG, PNG, or WebP, up to 5 MB"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove file"
                onClick={() => onChange(null)}
              >
                <IconX />
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setPickerOpen(true)}
              disabled={!options.length}
            >
              Choose
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Spinner className="size-3" />
              ) : (
                <IconUpload data-icon="inline-start" />
              )}
              {uploading ? "Uploading" : "Upload"}
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={
          accept === "pdf"
            ? "application/pdf"
            : "image/jpeg,image/png,image/webp"
        }
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
        }}
      />

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose a file</DialogTitle>
            <DialogDescription>
              Files are private until your portfolio is published with them.
            </DialogDescription>
          </DialogHeader>

          {options.length ? (
            <div className="grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {options.map((item) => {
                const active = item.id === value
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.id)
                      setPickerOpen(false)
                    }}
                    className={cn(
                      "group overflow-hidden rounded-lg border bg-background text-left transition-colors",
                      active
                        ? "border-foreground ring-1 ring-foreground"
                        : "hover:border-foreground/30"
                    )}
                  >
                    <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-muted/40">
                      {isImageMime(item.mimeType) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={mediaHref(item.id)}
                          alt={item.fileName}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <IconFileTypePdf className="size-7 text-muted-foreground" />
                      )}
                    </div>
                    <p className="truncate px-2 py-1.5 text-[0.65rem]">
                      {item.fileName}
                    </p>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-xs text-muted-foreground">
              No matching files yet. Upload one to get started.
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                setPickerOpen(false)
                inputRef.current?.click()
              }}
            >
              <IconUpload data-icon="inline-start" />
              Upload new
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </EditorField>
  )
}

export function DeleteMediaButton({
  media,
  onDeleted,
}: {
  media: EditorMedia
  onDeleted: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Delete ${media.fileName}`}
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <IconTrash />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this file?</DialogTitle>
            <DialogDescription>
              {media.fileName} will be removed permanently. If it&apos;s still
              used in your content, remove it there first.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-8 text-xs"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true)
                const result = await deleteMediaAction(media.id)
                setDeleting(false)
                if (!result.ok) {
                  toast.error("Couldn't delete file", {
                    description: result.error,
                  })
                  return
                }
                onDeleted(media.id)
                setOpen(false)
                toast.success("File deleted")
              }}
            >
              {deleting ? <Spinner className="size-3" /> : null}
              {deleting ? "Deleting…" : "Delete file"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
