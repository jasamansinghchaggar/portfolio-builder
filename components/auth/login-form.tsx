"use client"

import Link from "next/link"
import { useActionState } from "react"

import { FormFeedback } from "@/components/auth/form-feedback"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { loginAction } from "@/lib/actions/auth"
import { INITIAL_AUTH_STATE } from "@/lib/actions/state"

export function LoginForm({
  next,
  initialEmail = "",
  expired = false,
}: {
  next?: string
  initialEmail?: string
  expired?: boolean
}) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    INITIAL_AUTH_STATE
  )

  return (
    <form action={formAction} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {expired && !state.message ? (
        <FormFeedback
          status="error"
          message="That sign-in or reset link has expired. Request a new one below."
        />
      ) : null}

      <FormFeedback status={state.status} message={state.message} />

      <FieldGroup className="gap-4">
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

        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
            className="h-10 text-sm"
          />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        className="h-10 w-full text-sm"
        disabled={pending}
      >
        {pending ? <Spinner className="size-4" /> : null}
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <FieldDescription className="text-center text-sm">
        New to Folio?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-medium text-foreground underline underline-offset-4"
        >
          Create an account
        </Link>
      </FieldDescription>
    </form>
  )
}
