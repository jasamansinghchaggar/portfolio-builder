"use client"

import { useEffect, useRef, useState } from "react"
import {
  IconCrop,
  IconDotsVertical,
  IconFileTypePdf,
  IconPhoto,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { EditorField } from "@/components/editor/fields"
import { MediaCropDialog } from "@/components/editor/media-crop-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { useEditorMode } from "@/components/editor/editor-mode"
import {
  adminDeleteMediaAction,
  adminUploadMediaAction,
} from "@/lib/actions/admin"
import { deleteMediaAction, uploadMediaAction } from "@/lib/actions/media"
import {
  isImageMime,
  mediaHref,
  mediaObjectPosition,
  focalObjectPosition,
  DEFAULT_FOCAL,
  type EditorMedia,
  type FocalPoint,
  type MediaKind,
} from "@/lib/portfolio/media"
import type { CropSelection } from "@/components/editor/media-crop-dialog"
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
  slot,
  crop,
  onCropChange,
}: {
  label: string
  hint?: React.ReactNode
  value: string | null
  onChange: (value: string | null) => void
  media: EditorMedia[]
  onMediaAdded: (media: EditorMedia) => void
  kind?: MediaKind
  accept?: "image" | "pdf"
  slot?: string
  crop?: FocalPoint | null
  onCropChange?: (crop: FocalPoint | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [cropInitial, setCropInitial] = useState<FocalPoint>(DEFAULT_FOCAL)
  const { admin, portfolioId } = useEditorMode()

  useEffect(() => {
    if (!cropSrc || !cropFile) return
    return () => URL.revokeObjectURL(cropSrc)
  }, [cropSrc, cropFile])

  const selected = media.find((item) => item.id === value)
  const options = media.filter((item) =>
    accept === "pdf"
      ? item.mimeType === "application/pdf"
      : isImageMime(item.mimeType)
  )

  function openCropDialog() {
    if (!selected || !isImageMime(selected.mimeType)) return
    setCropFile(null)
    setCropSrc(mediaHref(selected.id))
    setCropInitial(crop ?? { x: selected.focalX, y: selected.focalY })
  }

  async function upload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("kind", kind)
      const result =
        admin && portfolioId
          ? await adminUploadMediaAction(portfolioId, formData)
          : await uploadMediaAction(formData)
      if (!result.ok) {
        toast.error("Upload failed", { description: result.error })
        return
      }
      setCropSrc(null)
      setCropFile(null)
      if (slot && onCropChange) onCropChange(null)
      onMediaAdded(result.media)
      onChange(result.media.id)
      toast.success("File uploaded")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function cropToFile(
    source: Blob,
    selection: CropSelection,
    fileName: string
  ) {
    const url = URL.createObjectURL(source)
    try {
      const image = new Image()
      image.src = url
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error("Unable to read image"))
      })

      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(selection.width))
      canvas.height = Math.max(1, Math.round(selection.height))
      const context = canvas.getContext("2d")
      if (!context) throw new Error("Unable to prepare image crop")
      context.drawImage(
        image,
        Math.round(selection.x),
        Math.round(selection.y),
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
      )
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.9)
      )
      if (!blob) throw new Error("Unable to create image crop")
      return new File([blob], fileName.replace(/\.[^.]+$/, "") + ".webp", {
        type: "image/webp",
      })
    } finally {
      URL.revokeObjectURL(url)
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
                style={{ objectPosition: focalObjectPosition(crop, selected) }}
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
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={
                        selected
                          ? `Options for ${selected.fileName}`
                          : "File options"
                      }
                    />
                  }
                  disabled={uploading}
                >
                  {uploading ? (
                    <Spinner className="size-3" />
                  ) : (
                    <IconDotsVertical />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      {accept === "pdf" ? "File options" : "Image options"}
                    </DropdownMenuLabel>
                    {selected &&
                    isImageMime(selected.mimeType) &&
                    onCropChange ? (
                      <DropdownMenuItem onClick={openCropDialog}>
                        <IconCrop />
                        Adjust crop
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                      onClick={() => setPickerOpen(true)}
                      disabled={!options.length}
                    >
                      <IconPhoto />
                      Choose existing
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => inputRef.current?.click()}
                      disabled={uploading}
                    >
                      <IconUpload />
                      Upload new
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onChange(null)}
                    >
                      <IconTrash />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
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
                  {uploading ? <Spinner className="size-3" /> : <IconUpload />}
                  {uploading ? "Uploading" : "Upload"}
                </Button>
              </>
            )}
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
          event.target.value = ""
          if (!file) return
          if (
            accept === "image" &&
            (file.type === "image/jpeg" ||
              file.type === "image/png" ||
              file.type === "image/webp")
          ) {
            setCropFile(file)
            setCropSrc(URL.createObjectURL(file))
            setCropInitial(DEFAULT_FOCAL)
            return
          }
          void upload(file)
        }}
      />

      <MediaCropDialog
        key={cropSrc ?? "empty"}
        src={cropSrc}
        open={Boolean(cropSrc)}
        busy={uploading}
        initialCrop={cropInitial}
        confirmLabel={cropFile ? "Upload image" : "Apply crop"}
        onOpenChange={(open) => {
          if (!open) {
            setCropSrc(null)
            setCropFile(null)
          }
        }}
        onConfirm={(selection) => {
          void (async () => {
            try {
              const source = cropFile
                ? cropFile
                : await fetch(cropSrc as string).then((response) => {
                    if (!response.ok) throw new Error("Unable to load image")
                    return response.blob()
                  })
              const sourceName = cropFile?.name ?? selected?.fileName ?? "image"
              const cropped = await cropToFile(source, selection, sourceName)
              await upload(cropped)
            } catch {
              toast.error("Crop failed", {
                description: "We couldn't create that crop. Please try again.",
              })
            }
          })()
        }}
      />

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-h-[85vh] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose a file</DialogTitle>
            <DialogDescription>
              Files are private until your portfolio is published with them.
            </DialogDescription>
          </DialogHeader>

          {options.length ? (
            <div className="grid min-h-0 auto-rows-max grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
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
                    <div className="grid aspect-4/3 place-items-center overflow-hidden bg-muted/40">
                      {isImageMime(item.mimeType) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={mediaHref(item.id)}
                          alt={item.fileName}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          style={{ objectPosition: mediaObjectPosition(item) }}
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
                requestAnimationFrame(() => inputRef.current?.click())
              }}
            >
              <IconUpload />
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
  const { admin } = useEditorMode()

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
                const result = admin
                  ? await adminDeleteMediaAction(media.id)
                  : await deleteMediaAction(media.id)
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
