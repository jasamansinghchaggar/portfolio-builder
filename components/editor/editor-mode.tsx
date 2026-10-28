"use client"

import { createContext, useContext, type ReactNode } from "react"

type EditorModeValue = {
  admin: boolean
  portfolioId: string | null
}

const EditorModeContext = createContext<EditorModeValue>({
  admin: false,
  portfolioId: null,
})

export function EditorModeProvider({
  admin,
  portfolioId,
  children,
}: EditorModeValue & { children: ReactNode }) {
  return (
    <EditorModeContext.Provider value={{ admin, portfolioId }}>
      {children}
    </EditorModeContext.Provider>
  )
}

export function useEditorMode() {
  return useContext(EditorModeContext)
}
