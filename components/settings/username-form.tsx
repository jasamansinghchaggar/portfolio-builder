"use client"

import { useActionState, useState } from "react"
import { IconLink, IconWorld } from "@tabler/icons-react"

import { FormFeedback } from "@/components/auth/form-feedback"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { changeUsernameAction } from "@/lib/actions/portfolio"
import { INITIAL_ACTION_STATE } from "@/lib/actions/state"
import { normalizeUsername, portfolioUrlModeLabel } from "@/lib/config"

export function UsernameForm({
  portfolioId,
  username,
  url,
}: {
  portfolioId: string
  username: string
  url: string
}) {
  const [state, formAction, pending] = useActionState(
    changeUsernameAction,
    INITIAL_ACTION_STATE
  )
  const [confirmed, setConfirmed] = useState(false)
  const [value, setValue] = useState(username)
  const changed = normalizeUsername(value) !== username

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Current address
        </p>
        <p className="mt-1 flex items-center gap-1.5 truncate font-mono text-xs">
          <IconLink className="size-3.5 shrink-0 text-muted-foreground" />
          {url}
        </p>
        <p className="mt-1.5 flex items-center gap-1 text-[0.65rem] text-muted-foreground">
          <IconWorld className="size-3" />
          {portfolioUrlModeLabel()}
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="portfolioId" value={portfolioId} />

        <FormFeedback status={state.status} message={state.message} />

        <Field>
          <FieldLabel htmlFor="settings-username">Username</FieldLabel>
          <Input
            id="settings-username"
            name="username"
            value={value}
            onChange={(event) => setValue(normalizeUsername(event.target.value))}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            minLength={3}
            maxLength={30}
            className="h-9 text-sm"
          />
          <FieldDescription>
            Lowercase letters, numbers, and single hyphens.
          </FieldDescription>
        </Field>

        {changed ? (
          <label className="flex items-start gap-2.5 rounded-lg border border-amber-600/25 bg-amber-500/5 px-3 py-2.5 text-xs leading-relaxed">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="mt-0.5"
            />
            <span>
              I understand the current link stops working and any shared links
              will need updating.
            </span>
          </label>
        ) : null}

        <Button
          type="submit"
          variant="outline"
          className="h-9 text-sm"
          disabled={pending || !changed || !confirmed}
        >
          {pending ? <Spinner className="size-4" /> : null}
          {pending ? "Updating…" : "Update address"}
        </Button>
      </form>
    </div>
  )
}
