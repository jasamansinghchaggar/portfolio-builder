"use client"

import Link from "next/link"
import { useState } from "react"
import {
  IconArrowLeft,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconExternalLink,
  IconPencil,
  IconRefresh,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Device = "desktop" | "tablet" | "mobile"

const DEVICES: {
  id: Device
  label: string
  icon: typeof IconDeviceDesktop
  width: string
}[] = [
  { id: "desktop", label: "Desktop", icon: IconDeviceDesktop, width: "100%" },
  { id: "tablet", label: "Tablet", icon: IconDeviceTablet, width: "768px" },
  { id: "mobile", label: "Mobile", icon: IconDeviceMobile, width: "390px" },
]

export function PreviewShell({ username }: { username: string }) {
  const [device, setDevice] = useState<Device>("desktop")
  const [frameKey, setFrameKey] = useState(0)
  const active = DEVICES.find((item) => item.id === device) ?? DEVICES[0]

  return (
    <div className="flex h-dvh flex-col bg-[#14110e] text-[#f7f3ec]">
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2 sm:px-4">
        <Button
          variant="ghost"
          className="h-8 text-xs text-[#cabfae] hover:bg-white/10 hover:text-white"
          nativeButton={false}
          render={<Link href="/editor" />}
        >
          <IconArrowLeft data-icon="inline-start" />
          Editor
        </Button>

        <span className="mx-1 hidden h-5 w-px bg-white/10 sm:block" />

        <div className="hidden items-center gap-1 sm:flex">
          <span className="font-mono text-[0.65rem] tracking-[0.14em] text-[#7d7264] uppercase">
            Draft preview
          </span>
          <span className="font-mono text-xs text-[#cabfae]">/{username}</span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div className="flex items-center rounded-lg border border-white/10 bg-white/4 p-0.5">
            {DEVICES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-pressed={device === item.id}
                onClick={() => setDevice(item.id)}
                className={cn(
                  "grid size-7 place-items-center rounded-md transition-colors",
                  device === item.id
                    ? "bg-[#f7f3ec] text-[#191510]"
                    : "text-[#a89c8c] hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="size-4" />
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Reload preview"
            title="Reload preview"
            className="text-[#cabfae] hover:bg-white/10 hover:text-white"
            onClick={() => setFrameKey((value) => value + 1)}
          >
            <IconRefresh />
          </Button>

          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Open preview in a new tab"
            title="Open in a new tab"
            className="text-[#cabfae] hover:bg-white/10 hover:text-white"
            nativeButton={false}
            render={
              <a href="/preview/frame" target="_blank" rel="noreferrer" />
            }
          >
            <IconExternalLink />
          </Button>

          <Button
            className="ml-1 h-8 bg-[#f7f3ec] text-xs text-[#191510] hover:bg-white"
            nativeButton={false}
            render={<Link href="/editor" />}
          >
            <IconPencil data-icon="inline-start" />
            Edit
          </Button>
        </div>
      </header>

      <div className="relative flex-1 overflow-auto p-3 sm:p-5">
        <div
          className="mx-auto h-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-white/10 transition-[width] duration-300"
          style={{ width: active.width, maxWidth: "100%" }}
        >
          <iframe
            key={frameKey}
            src="/preview/frame"
            title="Portfolio draft preview"
            className="h-full min-h-160 w-full border-0"
          />
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-2 text-[0.65rem] text-[#7d7264]">
        <span>
          Previewing saved draft content. Publishing is a separate step.
        </span>
        <span className="hidden font-mono tracking-[0.12em] uppercase sm:inline">
          {active.label}
        </span>
      </footer>
    </div>
  )
}
