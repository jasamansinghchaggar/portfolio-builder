import { cn } from "@/lib/utils"
import type { TemplateMeta } from "@/lib/portfolio/templates"

export function TemplateThumbnail({
  template,
  className,
}: {
  template: TemplateMeta
  className?: string
}) {
  const [background, foreground, accent] = template.palette
  const displayClass =
    template.id === "atlas" || template.id === "bloom"
      ? "font-serif"
      : template.id === "signal"
        ? "font-mono"
        : "font-heading"

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative aspect-[4/3] overflow-hidden border border-black/10 text-left shadow-sm",
        className
      )}
      style={{ background, color: foreground }}
    >
      {template.id === "studio" ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-black/10 px-3 py-2 text-[6px]">
            <span className="flex items-center gap-1 font-semibold">
              <span
                className="grid size-3.5 place-items-center rounded-full text-[5px] font-bold text-white"
                style={{ background: accent }}
              >
                QS
              </span>
              Quinn Studio
            </span>
            <span className="opacity-60">Services · Work · Contact</span>
          </div>
          <div
            className="flex flex-1 flex-col justify-center px-3.5 text-white"
            style={{
              background: `linear-gradient(135deg, ${foreground} 0%, ${accent} 160%)`,
            }}
          >
            <p
              className="text-[6px] font-semibold tracking-[0.16em] uppercase"
              style={{ color: accent }}
            >
              Interior design studio
            </p>
            <p
              className={cn(
                "mt-1 text-[17px] leading-[0.95] font-semibold tracking-tight",
                displayClass
              )}
            >
              Quinn
              <br />
              Studio
            </p>
            <p className="mt-1 text-[5px] opacity-75">
              Avery Quinn · Calm, considered spaces
            </p>
            <span
              className="mt-2 w-fit rounded-full px-2 py-0.5 text-[5px] font-semibold"
              style={{ background: accent, color: "#fff" }}
            >
              Chat on WhatsApp
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 px-2 py-1.5 text-center text-[4.5px] font-medium opacity-70">
            <span>Call us</span>
            <span>WhatsApp</span>
            <span>Email</span>
            <span>Share</span>
          </div>
        </div>
      ) : null}

      {template.id === "atlas" ? (
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between border-b border-black/10 pb-2 text-[6px] uppercase tracking-[0.18em] opacity-60">
            <span>Avery Quinn</span>
            <span>Work · About · Contact</span>
          </div>
          <div className="grid flex-1 grid-cols-[1.25fr_0.75fr] items-center gap-3 pt-3">
            <div>
              <p
                className="mb-1.5 text-[6px] uppercase tracking-[0.16em]"
                style={{ color: accent }}
              >
                Independent designer
              </p>
              <p
                className={cn(
                  "text-[19px] leading-[0.95] font-medium tracking-tight",
                  displayClass
                )}
              >
                Calm, useful
                <br />
                products.
              </p>
              <div className="mt-2.5 flex gap-1">
                <span
                  className="rounded-sm px-1.5 py-1 text-[5px] font-semibold"
                  style={{ background: accent, color: "#fff" }}
                >
                  View work
                </span>
                <span className="rounded-sm border border-black/20 px-1.5 py-1 text-[5px]">
                  About
                </span>
              </div>
            </div>
            <div
              className="h-[78%] rounded-t-full"
              style={{
                background: `linear-gradient(160deg, color-mix(in srgb, ${accent} 20%, ${background}), ${background})`,
                border: `1px solid color-mix(in srgb, ${foreground} 14%, transparent)`,
              }}
            >
              <div className="flex h-full items-center justify-center">
                <span className={cn("text-3xl opacity-30", displayClass)}>AQ</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {template.id === "signal" ? (
        <div className="flex h-full flex-col p-4">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(${foreground}22 1px, transparent 1px), linear-gradient(90deg, ${foreground}22 1px, transparent 1px)`,
              backgroundSize: "18px 18px",
              maskImage: "linear-gradient(to bottom, black, transparent 80%)",
            }}
          />
          <div className="relative flex items-center justify-between text-[6px] uppercase tracking-[0.18em] opacity-60">
            <span>avery.dev</span>
            <span>01 — 04</span>
          </div>
          <div className="relative mt-4 flex-1">
            <p
              className="mb-2 w-fit border px-1.5 py-0.5 text-[5px] uppercase tracking-[0.14em]"
              style={{ borderColor: `${accent}66`, color: accent }}
            >
              Product engineer
            </p>
            <p className={cn("max-w-[80%] text-[18px] leading-[0.95]", displayClass)}>
              Building systems that feel simple.
            </p>
            <div
              className="absolute right-0 bottom-0 w-[42%] border p-2"
              style={{ borderColor: `${accent}44`, background: `${accent}0d` }}
            >
              <div className="mb-1 h-1 w-6" style={{ background: accent }} />
              <p className="text-[5px] leading-relaxed opacity-60">
                TypeScript · React · Postgres
              </p>
            </div>
          </div>
          <div className="relative mt-3 flex gap-2 border-t border-white/10 pt-2 text-[5px] uppercase tracking-wider opacity-50">
            <span>Projects</span>
            <span>Experience</span>
            <span>Contact</span>
          </div>
        </div>
      ) : null}

      {template.id === "mono" ? (
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between text-[6px] uppercase tracking-[0.18em]">
            <span>AQ</span>
            <span>Portfolio 2026</span>
          </div>
          <div className="my-auto">
            <p className={cn("text-[23px] leading-[0.85] font-semibold tracking-tighter", displayClass)}>
              Less,
              <br />
              but better.
            </p>
            <div className="mt-2 h-px w-full bg-black/70" />
            <p className="mt-1 max-w-[80%] text-[6px] leading-relaxed opacity-60">
              Product designer focused on the quiet parts of an interface.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-black/20 pt-2 text-[5px]">
            <span>01 / Northwind</span>
            <span className="text-right">2026</span>
            <span>02 / Fieldnotes</span>
            <span className="text-right">2025</span>
          </div>
        </div>
      ) : null}

      {template.id === "bloom" ? (
        <div className="flex h-full flex-col p-3.5">
          <div className="flex items-center justify-between text-[6px] uppercase tracking-[0.18em] opacity-60">
            <span>Avery Quinn</span>
            <span>Work · About</span>
          </div>
          <div
            className="relative mt-2 flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-black/5 px-4 text-center"
            style={{
              background: `radial-gradient(circle at 20% 0%, ${accent}22, transparent 60%), ${background}`,
            }}
          >
            <div
              className="mb-2 grid size-8 place-items-center rounded-full text-[8px] font-semibold"
              style={{ background: `${accent}22`, color: accent }}
            >
              AQ
            </div>
            <p className={cn("max-w-[18ch] text-[16px] leading-[1.02]", displayClass)}>
              Work made with care and a little colour.
            </p>
            <span
              className="mt-2 rounded-full px-2 py-1 text-[5px] font-semibold text-white"
              style={{ background: accent }}
            >
              Say hello
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
