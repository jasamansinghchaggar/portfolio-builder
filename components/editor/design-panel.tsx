"use client"

import { IconCheck, IconMoon, IconSun } from "@tabler/icons-react"

import { FormSection } from "@/components/editor/fields"
import { TemplateThumbnail } from "@/components/marketing/template-thumbnail"
import { Input } from "@/components/ui/input"
import { ACCENT_PRESETS } from "@/lib/portfolio/colors"
import type {
  Appearance,
  CornerStyle,
  FontPair,
  TemplateId,
} from "@/lib/portfolio/constants"
import type { DesignSettings } from "@/lib/portfolio/types"
import { TEMPLATES, templateDesign } from "@/lib/portfolio/templates"
import { cn } from "@/lib/utils"

const FONT_PAIRS: { value: FontPair; label: string; note: string }[] = [
  { value: "modern", label: "Modern", note: "Poppins + Source Sans 3" },
  { value: "editorial", label: "Editorial", note: "Source Serif 4 + Source Sans 3" },
  { value: "classic", label: "Classic", note: "Merriweather + Lato" },
  { value: "technical", label: "Technical", note: "Libre Franklin + IBM Plex Sans" },
]

const CORNERS: { value: CornerStyle; label: string }[] = [
  { value: "sharp", label: "Sharp" },
  { value: "soft", label: "Soft" },
  { value: "round", label: "Round" },
]

function ChoiceButton({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-input bg-background hover:bg-muted/60",
        className
      )}
    >
      {children}
    </button>
  )
}

export function DesignPanel({
  templateId,
  design,
  onChange,
}: {
  templateId: TemplateId
  design: DesignSettings
  onChange: (templateId: TemplateId, design: DesignSettings) => void
}) {
  return (
    <div className="space-y-7">
      <FormSection
        title="Template"
        description="Your portfolio uses the Studio design. It adapts to your colours, type, and corner style."
      >
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((template) => {
            const active = template.id === templateId
            return (
              <button
                key={template.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(template.id, templateDesign(template.id))}
                className={cn(
                  "group relative rounded-lg border p-1.5 text-left transition-all",
                  active
                    ? "border-foreground ring-1 ring-foreground"
                    : "hover:border-foreground/30"
                )}
              >
                <TemplateThumbnail
                  template={template}
                  className="rounded-md"
                />
                <div className="flex items-center justify-between gap-1 px-0.5 pb-0.5 pt-1.5">
                  <span className="text-[0.7rem] font-medium">
                    {template.name}
                  </span>
                  {active ? (
                    <span className="grid size-4 place-items-center rounded-full bg-foreground text-background">
                      <IconCheck className="size-2.5" />
                    </span>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </FormSection>

      <FormSection
        title="Accent colour"
        description="Used for links, buttons, tags, and small details."
      >
        <div className="flex flex-wrap gap-1.5">
          {ACCENT_PRESETS.map((preset) => {
            const active = design.accent === preset.value
            return (
              <button
                key={preset.value}
                type="button"
                title={preset.name}
                aria-label={preset.name}
                aria-pressed={active}
                onClick={() => onChange(templateId, { ...design, accent: preset.value })}
                className={cn(
                  "grid size-7 place-items-center rounded-full border-2 transition-transform hover:scale-105",
                  active ? "border-foreground" : "border-transparent"
                )}
                style={{ background: preset.value }}
              >
                {active ? (
                  <IconCheck className="size-3.5 text-white drop-shadow" />
                ) : null}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Custom accent colour"
            value={design.accent}
            onChange={(event) =>
              onChange(templateId, { ...design, accent: event.target.value })
            }
            className="h-9 w-10 cursor-pointer rounded border border-input bg-background p-1"
          />
          <Input
            value={design.accent}
            onChange={(event) => {
              const value = event.target.value.trim()
              if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                onChange(templateId, { ...design, accent: value.toLowerCase() })
              }
            }}
            aria-label="Accent hex value"
            className="h-9 w-28 font-mono text-xs"
          />
          <span className="text-xs text-muted-foreground">Hex</span>
        </div>
      </FormSection>

      <FormSection title="Type pairing">
        <div className="grid grid-cols-2 gap-2">
          {FONT_PAIRS.map((pair) => (
            <ChoiceButton
              key={pair.value}
              active={design.fontPair === pair.value}
              onClick={() =>
                onChange(templateId, { ...design, fontPair: pair.value })
              }
            >
              <span className="block">{pair.label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[0.65rem] font-normal",
                  design.fontPair === pair.value
                    ? "text-background/70"
                    : "text-muted-foreground"
                )}
              >
                {pair.note}
              </span>
            </ChoiceButton>
          ))}
        </div>
      </FormSection>

      <FormSection title="Appearance">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "light" as Appearance, label: "Light", icon: IconSun },
              { value: "dark" as Appearance, label: "Dark", icon: IconMoon },
            ] satisfies { value: Appearance; label: string; icon: typeof IconSun }[]
          ).map((item) => (
            <ChoiceButton
              key={item.value}
              active={design.appearance === item.value}
              onClick={() =>
                onChange(templateId, { ...design, appearance: item.value })
              }
            >
              <span className="flex items-center gap-1.5">
                <item.icon className="size-3.5" />
                {item.label}
              </span>
            </ChoiceButton>
          ))}
        </div>
      </FormSection>

      <FormSection title="Corners">
        <div className="grid grid-cols-3 gap-2">
          {CORNERS.map((corner) => (
            <ChoiceButton
              key={corner.value}
              active={design.corners === corner.value}
              onClick={() =>
                onChange(templateId, { ...design, corners: corner.value })
              }
            >
              {corner.label}
            </ChoiceButton>
          ))}
        </div>
      </FormSection>
    </div>
  )
}
