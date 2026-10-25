import type { CSSProperties } from "react"

export type AccentPreset = {
  name: string
  value: string
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { name: "Ink", value: "#18181b" },
  { name: "Cobalt", value: "#1d4ed8" },
  { name: "Ocean", value: "#0369a1" },
  { name: "Teal", value: "#0f766e" },
  { name: "Forest", value: "#3f6212" },
  { name: "Copper", value: "#b45309" },
  { name: "Coral", value: "#e11d48" },
  { name: "Plum", value: "#7e22ce" },
  { name: "Orchid", value: "#c026d3" },
  { name: "Berry", value: "#be123c" },
  { name: "Sand", value: "#a16207" },
  { name: "Slate", value: "#475569" },
] as const

function channel(value: number) {
  const normalized = value / 255
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim())
  if (!match) return null
  return [
    Number.parseInt(match[1], 16),
    Number.parseInt(match[2], 16),
    Number.parseInt(match[3], 16),
  ]
}

export function relativeLuminance(hex: string) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(a: string, b: string) {
  const first = relativeLuminance(a)
  const second = relativeLuminance(b)
  const light = Math.max(first, second)
  const dark = Math.min(first, second)
  return (light + 0.05) / (dark + 0.05)
}

/** Picks ink or white for text placed on top of an accent colour. */
export function onAccentColor(accent: string) {
  const white = contrastRatio(accent, "#ffffff")
  const ink = contrastRatio(accent, "#111111")
  return white >= ink ? "#ffffff" : "#111111"
}

export function accentIsLowContrast(accent: string, background: string) {
  return contrastRatio(accent, background) < 2.4
}

export type PortfolioStyle = CSSProperties &
  Record<`--pf-${string}`, string>

export function designStyle(accent: string): PortfolioStyle {
  return {
    "--pf-accent": accent,
    "--pf-on-accent": onAccentColor(accent),
  }
}
