import type { TemplateId } from "./constants"
import type { DesignSettings } from "./schemas"

export type TemplateMeta = {
  id: TemplateId
  name: string
  tagline: string
  description: string
  bestFor: string[]
  accent: string
  palette: [string, string, string]
  fontPair: DesignSettings["fontPair"]
  appearance: DesignSettings["appearance"]
  corners: DesignSettings["corners"]
  backdrop: DesignSettings["backdrop"]
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "atlas",
    name: "Atlas",
    tagline: "An editorial folio with room to breathe.",
    description:
      "A warm, magazine-inspired layout led by a serif headline, generous whitespace, and quiet details. Made for people whose work deserves a story.",
    bestFor: ["Designers", "Writers", "Consultants"],
    accent: "#b45309",
    palette: ["#f7f3ec", "#1f1b16", "#b45309"],
    fontPair: "editorial",
    appearance: "light",
    corners: "soft",
    backdrop: "clean",
  },
  {
    id: "signal",
    name: "Signal",
    tagline: "A technical portfolio with a signal.",
    description:
      "A dark, high-contrast layout with monospaced labels, crisp cards, and a structured grid. Built for engineers and builders who like their work on display.",
    bestFor: ["Engineers", "Founders", "Data"],
    accent: "#22d3ee",
    palette: ["#071014", "#e8f6f7", "#22d3ee"],
    fontPair: "technical",
    appearance: "dark",
    corners: "sharp",
    backdrop: "grid",
  },
  {
    id: "mono",
    name: "Mono",
    tagline: "Type-first. Nothing in the way.",
    description:
      "A stark, confident layout where scale and rhythm do the talking. Dense project lists, oversized headings, and zero decoration.",
    bestFor: ["Art directors", "Developers", "Students"],
    accent: "#18181b",
    palette: ["#ffffff", "#111111", "#18181b"],
    fontPair: "modern",
    appearance: "light",
    corners: "sharp",
    backdrop: "clean",
  },
  {
    id: "bloom",
    name: "Bloom",
    tagline: "A soft landing for bold work.",
    description:
      "A warm, rounded layout with pastel washes, pill-shaped tags, and friendly type. Perfect for people whose practice is built on care and craft.",
    bestFor: ["Illustrators", "Photographers", "Coaches"],
    accent: "#be185d",
    palette: ["#fff7f2", "#2a1a21", "#be185d"],
    fontPair: "classic",
    appearance: "light",
    corners: "round",
    backdrop: "glow",
  },
]

export const DEFAULT_TEMPLATE_ID: TemplateId = "atlas"

export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((template) => template.id === id) ?? TEMPLATES[0]
}

export function templateDesign(id: TemplateId): DesignSettings {
  const template = getTemplate(id)
  return {
    accent: template.accent,
    fontPair: template.fontPair,
    appearance: template.appearance,
    corners: template.corners,
    backdrop: template.backdrop,
  }
}
