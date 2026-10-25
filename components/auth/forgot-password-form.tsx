"use client"

import Link from "next/link"
import { useActionState } from "react"
import { IconMailForward } from "@tabler/icons-react"

import { FormFeedback } from "@/components/auth/form-feedback"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { forgotPasswordAction } from "@/lib/actions/auth"
import { INITIAL_AUTH_STATE } from "@/lib/actions/state"

export function ForgotPasswordForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    INITIAL_AUTH_STATE
  )

  if (state.status === "success") {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border bg-card p-5">
          <span className="grid size-10 place-items-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <IconMailForward className="size-5" />
          </span>
          <h2 className="mt-4 font-heading text-lg font-semibold">
            Link sent
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {state.message}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Sent to {state.email}. Don&apos;t see it? Check spam or try again in
            a minute.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-10 w-full text-sm"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <FormFeedback status={state.status} message={state.message} />

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            defaultValue={state.email ?? initialEmail}
            required
            className="h-10 text-sm"
          />
        </Field>
      </FieldGroup>

      <Button type="submit" className="h-10 w-full text-sm" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        {pending ? "Sending…" : "Send reset link"}
      </Button>

      <Button
        variant="ghost"
        className="h-9 w-full text-sm text-muted-foreground"
        nativeButton={false}
        render={<Link href="/login" />}
      >
        Back to sign in
      </Button>
    </form>
  )
}
