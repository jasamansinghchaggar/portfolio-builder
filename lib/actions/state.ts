import type { PublishIssue } from "@/lib/portfolio/publish"

export type ActionState = {
  status: "idle" | "error" | "success"
  message?: string
}

export const INITIAL_ACTION_STATE: ActionState = { status: "idle" }

export type SaveResult =
  | { ok: true; revision: number; savedAt: string }
  | { ok: false; error: string; conflict?: boolean }

export type PublishResult =
  | {
      ok: true
      revision: number
      publishedAt: string
      url: string
    }
  | { ok: false; error?: string; issues?: PublishIssue[] }

export type AuthFormState = {
  status: "idle" | "error" | "success"
  message?: string
  email?: string
}

export const INITIAL_AUTH_STATE: AuthFormState = { status: "idle" }
