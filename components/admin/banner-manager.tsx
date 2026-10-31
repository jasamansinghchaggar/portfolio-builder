"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  adminCreatePromoBannerAction,
  adminDeletePromoBannerAction,
  adminUpdatePromoBannerAction,
  type AdminPromoBanner,
} from "@/lib/actions/admin"

type Draft = {
  message: string
  linkUrl: string
  linkLabel: string
  isActive: boolean
  sortOrder: number
}

const emptyDraft: Draft = {
  message: "",
  linkUrl: "",
  linkLabel: "Create yours",
  isActive: true,
  sortOrder: 0,
}

export function BannerManager({
  initialBanners,
}: {
  initialBanners: AdminPromoBanner[]
}) {
  const router = useRouter()
  const [banners, setBanners] = useState(initialBanners)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft)
  const [pending, startTransition] = useTransition()

  function resetCreate() {
    setDraft(emptyDraft)
    setCreating(false)
  }

  function startEdit(banner: AdminPromoBanner) {
    setEditingId(banner.id)
    setEditDraft({
      message: banner.message,
      linkUrl: banner.linkUrl ?? "",
      linkLabel: banner.linkLabel,
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function handleCreate() {
    const message = draft.message.trim()
    if (!message) {
      toast.error("Message is required")
      return
    }
    startTransition(async () => {
      try {
        const result = await adminCreatePromoBannerAction({
          message,
          linkUrl: draft.linkUrl.trim() || undefined,
          linkLabel: draft.linkLabel.trim() || undefined,
          isActive: draft.isActive,
          sortOrder: draft.sortOrder,
        })
        if (!result.ok) {
          toast.error("Couldn't create banner", { description: result.error })
          return
        }
        toast.success("Banner created")
        resetCreate()
        router.refresh()
      } catch {
        toast.error("Couldn't create banner", {
          description: "Check your connection and try again.",
        })
      }
    })
  }

  function handleUpdate(id: string) {
    const message = editDraft.message.trim()
    if (!message) {
      toast.error("Message is required")
      return
    }
    startTransition(async () => {
      try {
        const result = await adminUpdatePromoBannerAction({
          id,
          message,
          linkUrl: editDraft.linkUrl.trim() === "" ? null : editDraft.linkUrl.trim(),
          linkLabel: editDraft.linkLabel.trim() || undefined,
          isActive: editDraft.isActive,
          sortOrder: editDraft.sortOrder,
        })
        if (!result.ok) {
          toast.error("Couldn't update banner", { description: result.error })
          return
        }
        toast.success("Banner updated")
        setEditingId(null)
        router.refresh()
      } catch {
        toast.error("Couldn't update banner", {
          description: "Check your connection and try again.",
        })
      }
    })
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this banner?")) return
    startTransition(async () => {
      try {
        const result = await adminDeletePromoBannerAction({ id })
        if (!result.ok) {
          toast.error("Couldn't delete banner", { description: result.error })
          return
        }
        setBanners((current) => current.filter((banner) => banner.id !== id))
        toast.success("Banner deleted")
        router.refresh()
      } catch {
        toast.error("Couldn't delete banner", {
          description: "Check your connection and try again.",
        })
      }
    })
  }

  function handleToggleActive(banner: AdminPromoBanner, next: boolean) {
    startTransition(async () => {
      try {
        const result = await adminUpdatePromoBannerAction({
          id: banner.id,
          isActive: next,
        })
        if (!result.ok) {
          toast.error("Couldn't update banner", { description: result.error })
          return
        }
        setBanners((current) =>
          current.map((item) =>
            item.id === banner.id ? { ...item, isActive: next } : item
          )
        )
        toast.success(next ? "Banner activated" : "Banner deactivated")
        router.refresh()
      } catch {
        toast.error("Couldn't update banner", {
          description: "Check your connection and try again.",
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Promo banners</h2>
          <p className="text-sm text-muted-foreground">
            Messages rotate on the public promo bar. Active banners are shown to
            visitors.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreating((value) => !value)}
          disabled={pending}
        >
          {creating ? "Cancel" : "New banner"}
        </Button>
      </div>

      {creating ? (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Message
            </label>
            <Input
              value={draft.message}
              onChange={(event) =>
                setDraft((current) => ({ ...current, message: event.target.value }))
              }
              placeholder="Built with Folio — a website that works as hard as you do."
              maxLength={240}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Link URL (optional)
              </label>
              <Input
                value={draft.linkUrl}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, linkUrl: event.target.value }))
                }
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Link label
              </label>
              <Input
                value={draft.linkLabel}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, linkLabel: event.target.value }))
                }
                placeholder="Create yours"
                maxLength={40}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Sort order
              </label>
              <Input
                type="number"
                value={draft.sortOrder}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    sortOrder: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="flex items-end gap-2">
              <Switch
                checked={draft.isActive}
                onCheckedChange={(checked) =>
                  setDraft((current) => ({ ...current, isActive: checked }))
                }
                aria-label="Active"
              />
              <span className="text-xs text-muted-foreground">
                {draft.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={resetCreate} disabled={pending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={pending}>
              {pending ? "Saving…" : "Create"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Message</th>
              <th className="hidden px-4 py-2 font-medium md:table-cell">Link</th>
              <th className="px-4 py-2 font-medium">Active</th>
              <th className="px-4 py-2 font-medium">Order</th>
              <th className="px-4 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  No banners yet. Create one to replace the default messages.
                </td>
              </tr>
            ) : null}
            {banners.map((banner) => (
              <tr key={banner.id} className="border-b last:border-0">
                {editingId === banner.id ? (
                  <td colSpan={5} className="px-4 py-3">
                    <div className="space-y-3">
                      <Input
                        value={editDraft.message}
                        onChange={(event) =>
                          setEditDraft((current) => ({
                            ...current,
                            message: event.target.value,
                          }))
                        }
                        maxLength={240}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          value={editDraft.linkUrl}
                          onChange={(event) =>
                            setEditDraft((current) => ({
                              ...current,
                              linkUrl: event.target.value,
                            }))
                          }
                          placeholder="Link URL (optional)"
                        />
                        <Input
                          value={editDraft.linkLabel}
                          onChange={(event) =>
                            setEditDraft((current) => ({
                              ...current,
                              linkLabel: event.target.value,
                            }))
                          }
                          placeholder="Link label"
                          maxLength={40}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          type="number"
                          value={editDraft.sortOrder}
                          onChange={(event) =>
                            setEditDraft((current) => ({
                              ...current,
                              sortOrder: Number(event.target.value) || 0,
                            }))
                          }
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editDraft.isActive}
                            onCheckedChange={(checked) =>
                              setEditDraft((current) => ({
                                ...current,
                                isActive: checked,
                              }))
                            }
                            aria-label="Active"
                          />
                          <span className="text-xs text-muted-foreground">
                            {editDraft.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={pending}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(banner.id)}
                          disabled={pending}
                        >
                          {pending ? "Saving…" : "Save"}
                        </Button>
                      </div>
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3 align-top">
                      <p className="line-clamp-2">{banner.message}</p>
                    </td>
                    <td className="hidden px-4 py-3 align-top text-muted-foreground md:table-cell">
                      {banner.linkUrl ? (
                        <a
                          href={banner.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2"
                        >
                          {banner.linkLabel}
                        </a>
                      ) : (
                        <span className="text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleActive(banner, checked)
                        }
                        disabled={pending}
                        aria-label={`${banner.isActive ? "Deactivate" : "Activate"} banner`}
                      />
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums">
                      {banner.sortOrder}
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => startEdit(banner)}
                          disabled={pending}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-destructive"
                          onClick={() => handleDelete(banner.id)}
                          disabled={pending}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}