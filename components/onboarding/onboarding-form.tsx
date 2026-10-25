"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import {
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconLoader2,
  IconLock,
} from "@tabler/icons-react"

import { TemplateThumbnail } from "@/components/marketing/template-thumbnail"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { checkUsernameAction, createPortfolioAction } from "@/lib/actions/portfolio"
import { INITIAL_ACTION_STATE } from "@/lib/actions/state"
import { normalizeUsername, usernameError } from "@/lib/config"
import { TEMPLATES } from "@/lib/portfolio/templates"
import type { TemplateId } from "@/lib/portfolio/constants"
import { cn } from "@/lib/utils"

type Availability =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "invalid" | "taken"; message: string }

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/g, "")
}

export function OnboardingForm({
  fullName,
  templateId,
  suggestedUsername,
}: {
  fullName: string
  templateId: TemplateId
  suggestedUsername?: string
}) {
  const [state, formAction, pending] = useActionState(
    createPortfolioAction,
    INITIAL_ACTION_STATE
  )
  const [name, setName] = useState(fullName)
  const [template, setTemplate] = useState<TemplateId>(templateId)
  const [usernameInput, setUsernameInput] = useState(() =>
    suggestedUsername ? slugify(suggestedUsername) : ""
  )
  const [usernameTouched, setUsernameTouched] = useState(Boolean(suggestedUsername))
  const [check, setCheck] = useState<{
    username: string
    availability: Availability
  } | null>(null)

  const username = usernameTouched ? usernameInput : slugify(name)
  const cleanUsername = normalizeUsername(username)
  const localError = useMemo(
    () => (cleanUsername ? usernameError(cleanUsername) : null),
    [cleanUsername]
  )

  const availability: Availability = !cleanUsername
    ? { state: "idle" }
    : localError
      ? { state: "invalid", message: localError }
      : check?.username === cleanUsername
        ? check.availability
        : { state: "checking" }

  useEffect(() => {
    if (!cleanUsername || localError) return

    let cancelled = false
    const timer = setTimeout(async () => {
      const result = await checkUsernameAction(cleanUsername)
      if (cancelled) return
      setCheck({
        username: cleanUsername,
        availability: result.available
          ? { state: "available" }
          : {
              state: "taken",
              message: result.message ?? "That username isn't available.",
            },
      })
    }, 450)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [cleanUsername, localError])

  const usernameBlocked =
    !cleanUsername ||
    availability.state === "invalid" ||
    availability.state === "taken"
  const templateMeta = TEMPLATES.find((item) => item.id === template) ?? TEMPLATES[0]

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="templateId" value={template} />

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-7">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-800 dark:text-amber-400">
              Step 1 of 2
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-[1.02] font-semibold tracking-[-0.04em]">
              Give the page
              <br />
              a name.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              This is the groundwork. Everything here can be changed later in
              the editor.
            </p>
          </div>

          <div className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
            <Field>
              <FieldLabel htmlFor="fullName">Your name</FieldLabel>
              <Input
                id="fullName"
                name="fullName"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                placeholder="Avery Morgan"
                required
                minLength={2}
                maxLength={80}
                className="h-10 text-sm"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="username">Your portfolio address</FieldLabel>
              <div className="flex items-center overflow-hidden rounded-md border border-input bg-input/20 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
                <span className="shrink-0 border-r border-input/70 bg-muted/60 px-2.5 py-2 text-xs text-muted-foreground">
                  /p/
                </span>
                <Input
                  id="username"
                  name="username"
                  value={username}
                  onChange={(event) => {
                    setUsernameTouched(true)
                    setUsernameInput(normalizeUsername(event.target.value))
                  }}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="avery-morgan"
                  required
                  minLength={3}
                  maxLength={30}
                  aria-invalid={
                    availability.state === "invalid" ||
                    availability.state === "taken"
                  }
                  className="h-10 rounded-none border-0 bg-transparent text-sm focus-visible:ring-0 dark:bg-transparent"
                />
                <span className="grid w-8 shrink-0 place-items-center">
                  {availability.state === "checking" ? (
                    <IconLoader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : availability.state === "available" ? (
                    <IconCircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : availability.state === "invalid" ||
                    availability.state === "taken" ? (
                    <IconCircleX className="size-4 text-destructive" />
                  ) : null}
                </span>
              </div>
              <FieldDescription>
                {availability.state === "invalid" || availability.state === "taken"
                  ? availability.message
                  : availability.state === "available"
                    ? "That address is yours."
                    : "Lowercase letters, numbers, and single hyphens. This becomes your public link."}
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="headline">
                Headline <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="headline"
                name="headline"
                placeholder="Product designer & occasional writer"
                maxLength={160}
                className="h-10 text-sm"
              />
              <FieldDescription>
                A short line that says what you do. You can refine it in the
                editor.
              </FieldDescription>
            </Field>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-dashed bg-muted/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <IconLock className="mt-0.5 size-4 shrink-0" />
            <p>
              Your draft is private. Nothing appears at your public address
              until you explicitly publish.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-800 dark:text-amber-400">
              Step 2 of 2
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.03em]">
              Pick a starting point.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Switch templates whenever you like — your words stay put.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Portfolio template"
            className="grid gap-3 sm:grid-cols-2"
          >
            {TEMPLATES.map((item) => {
              const selected = item.id === template
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTemplate(item.id)}
                  className={cn(
                    "group relative rounded-xl border bg-card p-2.5 text-left transition-all",
                    selected
                      ? "border-foreground shadow-md ring-1 ring-foreground"
                      : "hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm"
                  )}
                >
                  <TemplateThumbnail template={item} className="rounded-lg" />
                  <div className="px-1 pb-0.5 pt-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading text-sm font-semibold">
                        {item.name}
                      </span>
                      <span
                        className={cn(
                          "grid size-4 place-items-center rounded-full border",
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-muted-foreground/40 text-transparent"
                        )}
                      >
                        <IconCheck className="size-3" />
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[0.7rem] leading-relaxed text-muted-foreground">
                      {item.tagline}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="rounded-xl border bg-muted/30 px-4 py-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                {templateMeta.name}
              </span>{" "}
              — {templateMeta.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">
          Not sure yet? Start anywhere. The template is never permanent.
        </p>
        <Button
          type="submit"
          className="h-11 px-6 text-sm"
          disabled={pending || usernameBlocked}
        >
          {pending ? <Spinner className="size-4" /> : null}
          {pending ? "Building your page…" : "Create my portfolio"}
        </Button>
      </div>
    </form>
  )
}
