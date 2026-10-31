"use client"

import { useActionState } from "react"

import { FormFeedback } from "@/components/auth/form-feedback"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PasswordInput } from "@/components/auth/password-input"
import { Spinner } from "@/components/ui/spinner"
import { updatePasswordAction } from "@/lib/actions/auth"
import { INITIAL_AUTH_STATE } from "@/lib/actions/state"

export function ResetPasswordForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    INITIAL_AUTH_STATE
  )

  return (
    <form action={formAction} className="space-y-5">
      <p className="rounded-lg border bg-muted/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
        Resetting the password for{" "}
        <span className="font-medium text-foreground">{email}</span>.
      </p>

      <FormFeedback status={state.status} message={state.message} />

      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            maxLength={72}
            className="h-10 text-sm"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat new password"
            required
            minLength={8}
            maxLength={72}
            className="h-10 text-sm"
          />
        </Field>
      </FieldGroup>

      <Button type="submit" className="h-10 w-full text-sm" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  )
}
