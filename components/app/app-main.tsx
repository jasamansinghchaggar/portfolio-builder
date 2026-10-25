"use client"

import { usePathname } from "next/navigation"

export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEditor = pathname === "/editor" || pathname.startsWith("/editor/")

  return (
    <main
      className={
        isEditor
          ? "w-full pt-[var(--app-header-height)] pb-0"
          : "mx-auto w-full max-w-6xl px-4 pt-[calc(var(--app-header-height)+1.5rem)] pb-6 sm:px-6 sm:pb-8"
      }
    >
      {children}
    </main>
  )
}
