"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowLeft,
  IconArrowUp,
  IconArrowUpRight,
  IconCheck,
  IconCircleCheck,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconEye,
  IconEyeOff,
  IconFileText,
  IconLayoutSidebar,
  IconPalette,
  IconPlus,
  IconTrash,
  IconUser,
  IconWorldUpload,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { BasicsPanel } from "@/components/editor/basics-panel"
import { DesignPanel } from "@/components/editor/design-panel"
import { MediaLibrary } from "@/components/editor/media-library"
import { SectionForm } from "@/components/editor/section-form"
import { CopyUrlButton } from "@/components/dashboard/copy-url-button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Brand } from "@/components/marketing/brand"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  loadDraftAction,
  overwriteDraftAction,
  publishPortfolioAction,
  saveDraftAction,
} from "@/lib/actions/portfolio"
import { formatDateTime } from "@/lib/format"
import { createSection } from "@/lib/portfolio/defaults"
import type { EditorMedia } from "@/lib/portfolio/media"
import type { PublishIssue } from "@/lib/portfolio/publish"
import {
  SECTION_DESCRIPTIONS,
  SECTION_LABELS,
  SECTION_TYPES,
  type SectionType,
  type TemplateId,
} from "@/lib/portfolio/constants"
import { sectionLabel } from "@/lib/portfolio/sections"
import { parsePortfolioContent } from "@/lib/portfolio/defaults"
import type {
  DesignSettings,
  PortfolioContent,
  Section,
} from "@/lib/portfolio/types"
import type { PortfolioStatus } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

type SaveState = "saved" | "unsaved" | "saving" | "error" | "conflict"
type View = "page" | "design" | string

const SAVE_COPY: Record<SaveState, { label: string; className: string }> = {
  saved: { label: "All changes saved", className: "bg-emerald-500" },
  unsaved: { label: "Unsaved changes", className: "bg-amber-500" },
  saving: { label: "Saving…", className: "bg-sky-500 animate-pulse" },
  error: { label: "Save failed", className: "bg-destructive" },
  conflict: { label: "Needs attention", className: "bg-destructive" },
}

function sectionIcon(type: SectionType) {
  return SECTION_LABELS[type]
}

export function Editor({
  portfolioId,
  username,
  publicUrl,
  status: initialStatus,
  revision: initialRevision,
  savedAt: initialSavedAt,
  publishedAt: initialPublishedAt,
  content: initialContent,
  media: initialMedia,
  initialSectionId,
  welcome,
}: {
  portfolioId: string
  username: string
  publicUrl: string
  status: PortfolioStatus
  revision: number
  savedAt: string
  publishedAt: string | null
  content: PortfolioContent
  media: EditorMedia[]
  initialSectionId?: string
  welcome?: boolean
}) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [media, setMedia] = useState(initialMedia)
  const [view, setView] = useState<View>(() => {
    if (
      initialSectionId &&
      initialContent.sections.some((section) => section.id === initialSectionId)
    ) {
      return initialSectionId
    }
    return initialContent.sections[0]?.id ?? "page"
  })
  const [revision, setRevision] = useState(initialRevision)
  const [savedAt, setSavedAt] = useState(initialSavedAt)
  const [publishedAt, setPublishedAt] = useState(initialPublishedAt)
  const [status, setStatus] = useState<PortfolioStatus>(initialStatus)
  const [saveState, setSaveState] = useState<SaveState>("saved")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(Boolean(welcome))

  const contentRef = useRef(content)
  const revisionRef = useRef(revision)
  const dirtyRef = useRef(false)
  const saveStateRef = useRef<SaveState>(saveState)
  const savePromiseRef = useRef<Promise<boolean> | null>(null)

  useEffect(() => {
    saveStateRef.current = saveState
  }, [saveState])

  const commit = useCallback((next: PortfolioContent) => {
    contentRef.current = next
    setContent(next)
    dirtyRef.current = true
    setSaveState((current) => (current === "conflict" ? current : "unsaved"))
  }, [])

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (savePromiseRef.current) return savePromiseRef.current
    if (!dirtyRef.current) return true
    if (saveStateRef.current === "conflict") return false

    const run = async () => {
      setSaveState("saving")
      setSaveError(null)
      const snapshot = contentRef.current
      const snapshotJson = JSON.stringify(snapshot)
      const result = await saveDraftAction({
        portfolioId,
        revision: revisionRef.current,
        content: snapshot,
      })

      if (result.ok) {
        revisionRef.current = result.revision
        setRevision(result.revision)
        setSavedAt(result.savedAt)
        const stillDirty = JSON.stringify(contentRef.current) !== snapshotJson
        dirtyRef.current = stillDirty
        setSaveState(stillDirty ? "unsaved" : "saved")
        return true
      }

      if (result.conflict) {
        setSaveState("conflict")
        setSaveError(result.error)
        return false
      }

      setSaveState("error")
      setSaveError(result.error)
      return false
    }

    const promise = run()
    savePromiseRef.current = promise
    try {
      return await promise
    } finally {
      savePromiseRef.current = null
    }
  }, [portfolioId])

  const persist = useCallback(async () => {
    if (saveStateRef.current === "conflict") return false
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const ok = await saveNow()
      if (!ok) return false
      if (!dirtyRef.current) return true
    }
    return !dirtyRef.current
  }, [saveNow])

  // Debounced autosave.
  useEffect(() => {
    if (!dirtyRef.current) return
    if (saveState === "conflict" || saveState === "saving" || saveState === "error") {
      return
    }
    const timer = window.setTimeout(() => {
      void saveNow()
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [content, saveState, saveNow])

  // Warn before closing with unsaved work.
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [])

  // Client-side navigation does not trigger beforeunload, so flush pending
  // edits before following an in-app link.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!dirtyRef.current) return
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest("a")
      if (!anchor) return
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return

      const href = anchor.getAttribute("href")
      if (!href || !href.startsWith("/") || href.startsWith("//")) return

      event.preventDefault()
      void (async () => {
        const saved = await persist()
        if (saved) {
          router.push(href)
        } else {
          toast.error("Couldn't save before leaving", {
            description:
              "Check your connection and try again. Your edits are still here.",
          })
        }
      })()
    }

    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [persist, router])

  // Best-effort flush if the editor is unmounted by back/forward navigation.
  useEffect(() => {
    return () => {
      if (!dirtyRef.current) return
      void saveDraftAction({
        portfolioId,
        revision: revisionRef.current,
        content: contentRef.current,
      })
    }
  }, [portfolioId])

  const selectedSection =
    view !== "page" && view !== "design"
      ? content.sections.find((section) => section.id === view) ?? null
      : null

  const activeLabel =
    view === "page"
      ? "Page details"
      : view === "design"
        ? "Design & template"
        : selectedSection
          ? sectionLabel(selectedSection)
          : "Section"

  const availableTypes = useMemo(
    () =>
      SECTION_TYPES.filter(
        (type) => !content.sections.some((section) => section.type === type)
      ),
    [content.sections]
  )

  const [reloadOpen, setReloadOpen] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop"
  )
  const [previewKey, setPreviewKey] = useState(0)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [issues, setIssues] = useState<PublishIssue[] | null>(null)
  const [successUrl, setSuccessUrl] = useState<string | null>(null)

  function updateSection(next: Section) {
    commit({
      ...contentRef.current,
      sections: contentRef.current.sections.map((section) =>
        section.id === next.id ? next : section
      ),
    })
  }

  function moveSection(id: string, direction: -1 | 1) {
    const sections = [...contentRef.current.sections]
    const index = sections.findIndex((section) => section.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= sections.length) return
    const [item] = sections.splice(index, 1)
    sections.splice(target, 0, item)
    commit({ ...contentRef.current, sections })
  }

  function removeSection(id: string) {
    const sections = contentRef.current.sections.filter(
      (section) => section.id !== id
    )
    commit({ ...contentRef.current, sections })
    if (view === id) setView(sections[0]?.id ?? "page")
  }

  function addSection(type: SectionType) {
    const section = createSection(type)
    commit({
      ...contentRef.current,
      sections: [...contentRef.current.sections, section],
    })
    setView(section.id)
    setAddOpen(false)
  }

  function toggleVisibility(section: Section, visible: boolean) {
    updateSection({ ...section, visible })
  }

  function updateDesign(templateId: TemplateId, design: DesignSettings) {
    commit({ ...contentRef.current, templateId, design })
  }

  async function retrySave() {
    const ok = await saveNow()
    if (ok) toast.success("Draft saved")
  }

  async function reloadLatest() {
    setResolving(true)
    const result = await loadDraftAction(portfolioId)
    setResolving(false)
    if (!result.ok) {
      toast.error("Couldn't load the latest draft", {
        description: result.error,
      })
      return
    }
    const parsed = parsePortfolioContent(result.content)
    if (!parsed.success) {
      toast.error("The saved draft couldn't be read.")
      return
    }
    contentRef.current = parsed.data
    revisionRef.current = result.revision
    dirtyRef.current = false
    setContent(parsed.data)
    setRevision(result.revision)
    setSavedAt(result.savedAt)
    setSaveState("saved")
    setSaveError(null)
    setReloadOpen(false)
    toast.success("Loaded the latest saved version")
  }

  async function keepMine() {
    setResolving(true)
    const result = await overwriteDraftAction({
      portfolioId,
      content: contentRef.current,
    })
    setResolving(false)
    if (!result.ok) {
      toast.error("Couldn't save over the other version", {
        description: result.error,
      })
      return
    }
    revisionRef.current = result.revision
    dirtyRef.current = false
    setRevision(result.revision)
    setSavedAt(result.savedAt)
    setSaveState("saved")
    setSaveError(null)
    toast.success("Saved your version")
  }

  async function openPreview() {
    if (saveStateRef.current === "conflict") {
      toast.error("Resolve the saved-version conflict before previewing.")
      return
    }
    const saved = await persist()
    if (!saved) {
      toast.error("Couldn't save before previewing", {
        description: saveError ?? "Check your connection and try again.",
      })
      return
    }
    setPreviewKey((value) => value + 1)
    setPreviewOpen(true)
  }

  async function publish() {
    setPublishing(true)
    const saved = await persist()
    if (!saved) {
      setPublishing(false)
      setPublishOpen(false)
      toast.error("Save your changes before publishing", {
        description:
          saveStateRef.current === "conflict"
            ? "Another version was saved elsewhere. Load it or keep your version first."
            : saveError ?? "Check your connection and try again.",
      })
      return
    }

    const result = await publishPortfolioAction({
      portfolioId,
      revision: revisionRef.current,
      content: contentRef.current,
    })
    setPublishing(false)
    setPublishOpen(false)

    if (!result.ok) {
      if (result.issues?.length) {
        setIssues(result.issues)
      } else {
        toast.error("Couldn't publish", {
          description: result.error ?? "Please try again.",
        })
      }
      return
    }

    revisionRef.current = result.revision
    setRevision(result.revision)
    setPublishedAt(result.publishedAt)
    setStatus("published")
    dirtyRef.current = false
    setSaveState("saved")
    setSuccessUrl(result.url)
    toast.success("Your portfolio is live")
  }

  const saveCopy = SAVE_COPY[saveState]

  return (
    <div className="min-h-screen bg-muted/25">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            <IconArrowLeft data-icon="inline-start" />
            Dashboard
          </Button>

          <span className="hidden h-5 w-px bg-border sm:block" />
          <Brand href="/dashboard" className="hidden sm:inline-flex" />

          <div className="ml-1 hidden min-w-0 flex-col sm:flex">
            <span className="truncate font-mono text-[0.65rem] text-muted-foreground">
              /{username}
            </span>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <div
              aria-live="polite"
              className="mr-1 hidden items-center gap-1.5 text-[0.65rem] text-muted-foreground md:flex"
            >
              <span className={cn("size-1.5 rounded-full", saveCopy.className)} />
              {saveCopy.label}
              {saveState === "saved" ? (
                <span className="text-muted-foreground/60">
                  · {formatDateTime(savedAt)}
                </span>
              ) : null}
            </div>

            {saveState === "error" || saveState === "conflict" ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => void retrySave()}
              >
                Retry
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={saveState !== "unsaved"}
                onClick={() => void retrySave()}
              >
                {saveState === "saving" ? <Spinner className="size-3" /> : null}
                Save
              </Button>
            )}

            <MediaLibrary
              media={media}
              onDeleted={(id) =>
                setMedia((current) => current.filter((item) => item.id !== id))
              }
            />

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => void openPreview()}
            >
              <IconDeviceDesktop data-icon="inline-start" />
              Preview
            </Button>

            <Button
              className="h-8 text-xs"
              onClick={() => setPublishOpen(true)}
            >
              <IconWorldUpload data-icon="inline-start" />
              {status === "published" ? "Publish changes" : "Publish"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t px-3 py-1 text-[0.65rem] text-muted-foreground md:hidden">
          <span className={cn("size-1.5 rounded-full", saveCopy.className)} />
          {saveCopy.label}
          {status === "published" && publishedAt ? (
            <span className="ml-auto">
              Live since {formatDateTime(publishedAt)}
            </span>
          ) : null}
        </div>
      </header>

      {bannerOpen ? (
        <div className="border-b border-emerald-600/20 bg-emerald-500/5">
          <div className="mx-auto flex w-full max-w-7xl items-start gap-3 px-4 py-2.5">
            <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <p className="flex-1 text-xs leading-relaxed">
              Start wherever you like. Every change saves automatically; your
              live page only updates when you press publish.
            </p>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Dismiss"
              onClick={() => setBannerOpen(false)}
            >
              ×
            </Button>
          </div>
        </div>
      ) : null}

      {saveState === "conflict" || saveState === "error" ? (
        <div className="border-b border-destructive/20 bg-destructive/5">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-start gap-3 px-4 py-2.5">
            <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium">
                {saveState === "conflict"
                  ? "This portfolio was saved somewhere else."
                  : "Your latest changes haven't saved."}
              </p>
              <p className="mt-0.5 text-[0.7rem] leading-relaxed text-muted-foreground">
                {saveError ??
                  "Check your connection and retry. Your edits are still here."}
              </p>
            </div>
            {saveState === "conflict" ? (
              <div className="flex items-center gap-1.5">
                <AlertDialog open={reloadOpen} onOpenChange={setReloadOpen}>
                  <AlertDialogTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-7 text-xs" />
                    }
                  >
                    Load latest
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Discard your edits?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Loading the latest saved version replaces everything in
                        this editor. Any changes made here since the conflict
                        will be lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={resolving}>
                        Keep mine
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={resolving}
                        onClick={(event) => {
                          event.preventDefault()
                          void reloadLatest()
                        }}
                      >
                        {resolving ? <Spinner className="size-3" /> : null}
                        Load latest
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  disabled={resolving}
                  onClick={() => void keepMine()}
                >
                  {resolving ? <Spinner className="size-3" /> : null}
                  Keep mine
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => void retrySave()}
              >
                Retry save
              </Button>
            )}
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-7xl gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-3 lg:sticky lg:top-[3.6rem] lg:self-start">
          <div className="rounded-xl border bg-card p-1.5">
            <button
              type="button"
              onClick={() => setView("page")}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors",
                view === "page"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <IconUser className="size-3.5" />
              Page details
            </button>
            <button
              type="button"
              onClick={() => setView("design")}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors",
                view === "design"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <IconPalette className="size-3.5" />
              Design & template
            </button>
          </div>

          <div className="rounded-xl border bg-card p-1.5">
            <div className="flex items-center justify-between px-1.5 pb-1.5 pt-1">
              <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                <IconLayoutSidebar className="size-3" />
                Sections
              </span>
              <span className="text-[0.6rem] tabular-nums text-muted-foreground">
                {content.sections.length}
              </span>
            </div>

            <div className="max-h-[46vh] space-y-0.5 overflow-y-auto pr-0.5">
              {content.sections.map((section, index) => {
                const active = view === section.id
                return (
                  <div
                    key={section.id}
                    className={cn(
                      "group flex items-center gap-1 rounded-md px-1 transition-colors",
                      active ? "bg-muted" : "hover:bg-muted/50"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setView(section.id)}
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left text-xs",
                        !section.visible && "opacity-55"
                      )}
                    >
                      <span className="w-4 shrink-0 font-mono text-[0.55rem] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {sectionLabel(section)}
                      </span>
                      {!section.visible ? (
                        <IconEyeOff className="size-3 shrink-0 text-muted-foreground" />
                      ) : null}
                    </button>

                    <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        aria-label={`Move ${sectionLabel(section)} up`}
                        disabled={index === 0}
                        onClick={() => moveSection(section.id, -1)}
                        className="grid size-4 place-items-center rounded text-muted-foreground hover:bg-background disabled:opacity-30"
                      >
                        <IconArrowUp className="size-2.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${sectionLabel(section)} down`}
                        disabled={index === content.sections.length - 1}
                        onClick={() => moveSection(section.id, 1)}
                        className="grid size-4 place-items-center rounded text-muted-foreground hover:bg-background disabled:opacity-30"
                      >
                        <IconArrowDown className="size-2.5" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {!content.sections.length ? (
                <p className="px-2 py-4 text-center text-[0.65rem] text-muted-foreground">
                  No sections yet.
                </p>
              ) : null}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-1.5 h-7 w-full border-dashed text-[0.65rem]"
              onClick={() => setAddOpen(true)}
              disabled={!availableTypes.length}
            >
              <IconPlus data-icon="inline-start" />
              Add section
            </Button>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="rounded-xl border bg-card">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate font-heading text-base font-semibold">
                    {activeLabel}
                  </h1>
                  {selectedSection ? (
                    <span className="rounded-full border bg-muted/40 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground">
                      {selectedSection.type}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 max-w-lg text-[0.7rem] leading-relaxed text-muted-foreground">
                  {view === "page"
                    ? "The details behind the page: name, contact, and portrait."
                    : view === "design"
                      ? "Template, colour, type, and atmosphere."
                      : selectedSection
                        ? SECTION_DESCRIPTIONS[selectedSection.type]
                        : ""}
                </p>
              </div>

              {selectedSection ? (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
                    <Switch
                      size="sm"
                      checked={selectedSection.visible}
                      onCheckedChange={(checked) =>
                        toggleVisibility(selectedSection, checked)
                      }
                      aria-label="Show section on the public page"
                    />
                    {selectedSection.visible ? (
                      <>
                        <IconEye className="size-3.5" /> Visible
                      </>
                    ) : (
                      <>
                        <IconEyeOff className="size-3.5" /> Hidden
                      </>
                    )}
                  </label>

                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove section"
                          className="text-muted-foreground hover:text-destructive"
                        />
                      }
                    >
                      <IconTrash />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogMedia>
                          <IconTrash />
                        </AlertDialogMedia>
                        <AlertDialogTitle>
                          Remove {sectionLabel(selectedSection)}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Its content is deleted from this draft. Changes won&apos;t
                          affect the live page until you publish.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep it</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeSection(selectedSection.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : null}
            </div>

            <div className="p-4 sm:p-5">
              {view === "page" ? (
                <BasicsPanel
                  basics={content.basics}
                  onChange={(basics) =>
                    commit({ ...contentRef.current, basics })
                  }
                  media={media}
                  onMediaAdded={(item) =>
                    setMedia((current) => [item, ...current])
                  }
                />
              ) : view === "design" ? (
                <DesignPanel
                  templateId={content.templateId}
                  design={content.design}
                  onChange={updateDesign}
                />
              ) : selectedSection ? (
                <SectionForm
                  section={selectedSection}
                  onChange={updateSection}
                  media={media}
                  onMediaAdded={(item) =>
                    setMedia((current) => [item, ...current])
                  }
                />
              ) : (
                <div className="py-16 text-center">
                  <IconFileText className="mx-auto size-6 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Pick a section from the left, or add one.
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="mt-3 text-center text-[0.65rem] text-muted-foreground lg:text-left">
            Draft changes are private. {status === "published"
              ? "Your live page keeps its last published version until you publish again."
              : "Nothing is public until you publish."}
          </p>
        </main>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add a section</DialogTitle>
            <DialogDescription>
              Each section type can appear once. You can reorder or hide it
              afterwards.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[55vh] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
            {availableTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addSection(type)}
                className="rounded-lg border bg-background px-3 py-2.5 text-left transition-colors hover:border-foreground/30 hover:bg-muted/40"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{sectionIcon(type)}</span>
                  <IconPlus className="size-3.5 text-muted-foreground" />
                </span>
                <span className="mt-0.5 block text-[0.65rem] leading-relaxed text-muted-foreground">
                  {SECTION_DESCRIPTIONS[type]}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex h-[88vh] max-w-6xl flex-col gap-2 p-3 sm:max-w-6xl">
          <DialogHeader className="flex-row items-center gap-2 space-y-0">
            <DialogTitle className="text-sm">Draft preview</DialogTitle>
            <div className="ml-auto flex items-center gap-1">
              <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
                <button
                  type="button"
                  aria-label="Desktop preview"
                  aria-pressed={previewDevice === "desktop"}
                  onClick={() => setPreviewDevice("desktop")}
                  className={cn(
                    "grid size-7 place-items-center rounded",
                    previewDevice === "desktop"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <IconDeviceDesktop className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Mobile preview"
                  aria-pressed={previewDevice === "mobile"}
                  onClick={() => setPreviewDevice("mobile")}
                  className={cn(
                    "grid size-7 place-items-center rounded",
                    previewDevice === "mobile"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <IconDeviceMobile className="size-4" />
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                nativeButton={false}
                render={<a href="/preview" target="_blank" rel="noreferrer" />}
              >
                Full preview
                <IconArrowUpRight data-icon="inline-end" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 justify-center overflow-hidden rounded-lg border bg-muted/40 p-2">
            <iframe
              key={`${previewKey}-${previewDevice}`}
              src={`/preview/frame?v=${previewKey}`}
              title="Portfolio draft preview"
              className={cn(
                "h-full rounded-md border bg-white shadow-sm transition-[width] duration-200",
                previewDevice === "mobile"
                  ? "w-[390px] max-w-full"
                  : "w-full"
              )}
            />
          </div>
          <p className="px-1 text-[0.65rem] text-muted-foreground">
            Showing saved draft content. Publish when it looks right.
          </p>
        </DialogContent>
      </Dialog>

      <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <IconWorldUpload />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {status === "published"
                ? "Publish these changes?"
                : "Publish your portfolio?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {status === "published"
                ? "The live page will be replaced with this draft. Hidden sections stay private."
                : "Your draft becomes a public page. You can keep editing privately and publish again later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={publishing}>Not yet</AlertDialogCancel>
            <AlertDialogAction
              disabled={publishing}
              onClick={(event) => {
                event.preventDefault()
                void publish()
              }}
            >
              {publishing ? <Spinner className="size-4" /> : null}
              {publishing ? "Publishing…" : "Publish now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(issues)}
        onOpenChange={(open) => {
          if (!open) setIssues(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mb-1 grid size-9 place-items-center rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-400">
              <IconAlertTriangle className="size-4" />
            </div>
            <DialogTitle>Almost there — a few loose ends</DialogTitle>
            <DialogDescription>
              Publishing is paused so visitors don&apos;t see an unfinished page.
              Fix these, then publish again.
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
            {issues?.map((issue, index) => (
              <li
                key={`${issue.path}-${index}`}
                className="rounded-lg border bg-muted/30 px-3 py-2.5"
              >
                <p className="text-sm leading-relaxed">{issue.message}</p>
                {issue.sectionId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setView(issue.sectionId as string)
                      setIssues(null)
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Go to {issue.sectionLabel ?? "section"}
                    <IconArrowUpRight className="size-3" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="flex justify-end">
            <Button
              className="h-8 text-xs"
              onClick={() => setIssues(null)}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(successUrl)}
        onOpenChange={(open) => {
          if (!open) setSuccessUrl(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-1 grid size-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <IconCircleCheck className="size-5" />
            </div>
            <DialogTitle>Your portfolio is live.</DialogTitle>
            <DialogDescription>
              Share the link anywhere. Further draft edits stay private until
              you publish again.
            </DialogDescription>
          </DialogHeader>
          {successUrl ? (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
              <span className="min-w-0 flex-1 truncate font-mono text-xs">
                {successUrl}
              </span>
              <CopyUrlButton url={successUrl} />
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="h-9 text-sm"
              onClick={() => setSuccessUrl(null)}
            >
              Keep editing
            </Button>
            <Button
              className="h-9 text-sm"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="sr-only" aria-live="polite">
        {saveState === "saved"
          ? "All changes saved."
          : saveState === "saving"
            ? "Saving changes."
            : saveState === "unsaved"
              ? "Unsaved changes."
              : saveError}
      </div>

      <span className="hidden">{publicUrl}</span>
    </div>
  )
}
