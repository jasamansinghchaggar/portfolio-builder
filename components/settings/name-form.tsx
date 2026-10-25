"use client"

import { useActionState } from "react"

import { FormFeedback } from "@/components/auth/form-feedback"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { updateProfileAction } from "@/lib/actions/portfolio"
import { INITIAL_ACTION_STATE } from "@/lib/actions/state"

export function NameForm({
  fullName,
  email,
}: {
  fullName: string
  email: string
}) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    INITIAL_ACTION_STATE
  )

  return (
    <form action={formAction} className="space-y-4">
      <FormFeedback status={state.status} message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="settings-name">Full name</FieldLabel>
          <Input
            id="settings-name"
            name="fullName"
            defaultValue={fullName}
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            className="h-9 text-sm"
          />
          <FieldDescription>Shown on your portfolio page.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="settings-email">Email</FieldLabel>
          <Input
            id="settings-email"
            value={email}
            readOnly
            disabled
            className="h-9 text-sm"
          />
          <FieldDescription>
            Sign-in address. Changing it isn&apos;t supported yet.
          </FieldDescription>
        </Field>
      </div>

      <Button type="submit" className="h-9 text-sm" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  )
}
