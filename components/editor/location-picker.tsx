"use client"

import { useId, useState } from "react"
import { IconExternalLink, IconMapPin, IconTrash } from "@tabler/icons-react"

import { FieldRow, FormSection, TextInput } from "@/components/editor/fields"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { resolveMapsLink } from "@/lib/actions/location"
import {
  MAP_TYPE_OPTIONS,
  ZOOM_PRESETS,
  buildMapEmbedUrl,
  buildOpenInMapsUrl,
  clampZoom,
  isGoogleMapsShortLink,
  locationName,
  nearestZoomPreset,
  parseMapInput,
  type ParsedMapLocation,
} from "@/lib/portfolio/location"
import type { Basics, SectionOfType } from "@/lib/portfolio/types"
import { cn } from "@/lib/utils"

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-input bg-background hover:bg-muted/60"
      )}
    >
      {children}
    </button>
  )
}

export function LocationPicker({
  section,
  basics,
  onChange,
  onOpenPageDetails,
}: {
  section: SectionOfType<"location">
  basics: Basics
  onChange: (section: SectionOfType<"location">) => void
  onOpenPageDetails?: () => void
}) {
  const inputId = useId()
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)

  const saved = Boolean(
    section.query.trim() ||
    (section.latitude !== null && section.longitude !== null)
  )
  const embedUrl = saved ? buildMapEmbedUrl(section) : ""
  const openHref = saved ? buildOpenInMapsUrl(section) : null
  const address = basics.address.trim() || basics.location.trim()
  const name = saved ? locationName(section) : ""
  // Avoid repeating the query as both the heading and the sub-line.
  const detail = [address, section.query.trim()].find(
    (value) => value && value !== name
  )

  /**
   * The label is filled from the place name and is owner-editable, so replace
   * it only while it is still the auto value; keep any custom name.
   */
  function nextLabel(place: string) {
    const label = section.label.trim()
    const isAuto = !label || label === section.query.trim()
    return isAuto ? place : label
  }

  function commit(parsed: ParsedMapLocation) {
    onChange({
      ...section,
      query: parsed.query,
      label: nextLabel(parsed.place),
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      zoom:
        parsed.zoom !== null && parsed.zoom !== undefined
          ? clampZoom(parsed.zoom)
          : section.zoom,
    })
    setDraft("")
    setError(null)
  }

  async function applyInput(value: string) {
    const trimmed = value.trim()
    if (!trimmed) {
      setError("Paste a Google Maps link or your address first.")
      return
    }

    setError(null)
    const parsed = parseMapInput(trimmed)

    if (!parsed.ok && isGoogleMapsShortLink(trimmed)) {
      setResolving(true)
      try {
        const resolved = await resolveMapsLink(trimmed)
        if (!resolved.ok) {
          setError(resolved.error)
          return
        }
        commit(resolved)
      } catch {
        setError(
          "Couldn't reach Google Maps. Open the map in your browser, copy the address from the address bar, and paste that instead."
        )
      } finally {
        setResolving(false)
      }
      return
    }

    if (!parsed.ok) {
      setError(parsed.error)
      return
    }

    commit(parsed)
  }

  function usePageAddress() {
    if (!address) {
      setError("Add an address in Page details first, or paste a map link.")
      return
    }
    onChange({
      ...section,
      query: address,
      label: nextLabel(""),
      latitude: null,
      longitude: null,
    })
    setDraft("")
    setError(null)
  }

  function clearLocation() {
    onChange({ ...section, query: "", latitude: null, longitude: null })
    setDraft("")
    setError(null)
  }

  return (
    <div className="space-y-6">
      <FormSection
        title="Map location"
        description="Paste a Google Maps link, an address, or coordinates. The map stays hidden on your website until a location is set."
      >
        {saved ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border bg-muted/20">
              <iframe
                src={embedUrl}
                title="Map preview"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-44 w-full border-0"
              />
            </div>
            <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/20 p-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                  <IconMapPin className="size-3.5 shrink-0 text-muted-foreground" />
                  {name}
                </p>
                {detail ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {detail}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {openHref ? (
                  <a
                    href={openHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "h-7 text-xs"
                    )}
                  >
                    <IconExternalLink />
                    Check
                  </a>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove location"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={clearLocation}
                >
                  <IconTrash />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 p-3">
            <p className="text-sm font-medium">No location set yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Visitors won&apos;t see this section until you add a map pin.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor={inputId} className="text-xs font-medium">
            {saved ? "Replace this location" : "Where can people find you?"}
          </label>
          <div className="flex gap-2">
            <Input
              id={inputId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  void applyInput(draft)
                }
              }}
              placeholder="Paste a Google Maps link, address, or coordinates"
              className="h-9 text-sm"
              aria-invalid={error ? true : undefined}
            />
            <Button
              type="button"
              size="lg"
              className="h-9 shrink-0"
              disabled={resolving}
              onClick={() => void applyInput(draft)}
            >
              {resolving ? <Spinner className="size-3" /> : null}
              {resolving ? "Finding…" : "Use location"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            On Google Maps, search for your business, then tap{" "}
            <strong>Share → Copy link</strong> and paste it above. An address or
            coordinates like{" "}
            <span className="font-mono text-[0.7rem]">28.4595, 77.0726</span>{" "}
            work too.
          </p>
          {error ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          ) : null}
          {error && isGoogleMapsShortLink(draft) ? (
            <a
              href={draft.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Open this link in Google Maps
            </a>
          ) : null}
          {address && address !== section.query.trim() ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full text-xs"
              onClick={usePageAddress}
            >
              Use my page address ({address})
            </Button>
          ) : null}
          {!address && onOpenPageDetails ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full text-xs"
              onClick={onOpenPageDetails}
            >
              Add an address in Page details
            </Button>
          ) : null}
        </div>
      </FormSection>

      <FormSection
        title="On the map"
        description="How the map and the information around it appear on your page."
      >
        <TextInput
          label="Location name"
          value={section.label}
          onChange={(label) => onChange({ ...section, label })}
          placeholder="Our studio"
          maxLength={120}
          hint="Shown above the map. Leave blank to use the place name."
        />

        <FieldRow>
          <div className="space-y-1.5">
            <span className="text-xs font-medium">Map style</span>
            <div className="grid grid-cols-2 gap-2">
              {MAP_TYPE_OPTIONS.map((option) => (
                <ChoiceButton
                  key={option.value}
                  active={section.mapType === option.value}
                  onClick={() =>
                    onChange({
                      ...section,
                      mapType: option.value,
                    })
                  }
                >
                  {option.label}
                </ChoiceButton>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-medium">Zoom</span>
            <div className="grid grid-cols-3 gap-2">
              {ZOOM_PRESETS.map((preset) => (
                <ChoiceButton
                  key={preset.value}
                  active={nearestZoomPreset(section.zoom) === preset.value}
                  onClick={() => onChange({ ...section, zoom: preset.value })}
                >
                  {preset.label}
                </ChoiceButton>
              ))}
            </div>
          </div>
        </FieldRow>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs">
            <Checkbox
              checked={section.showDirections}
              onCheckedChange={(checked) =>
                onChange({ ...section, showDirections: checked === true })
              }
            />
            Show a &ldquo;Get directions&rdquo; button
          </label>
          <label className="flex items-center gap-2 text-xs">
            <Checkbox
              checked={section.showOpenInMaps}
              onCheckedChange={(checked) =>
                onChange({ ...section, showOpenInMaps: checked === true })
              }
            />
            Show an &ldquo;Open in Google Maps&rdquo; link
          </label>
        </div>
      </FormSection>
    </div>
  )
}
