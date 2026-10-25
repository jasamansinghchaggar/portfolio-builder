"use client"

import Link from "next/link"
import { useActionState } from "react"
import { IconMailCheck } from "@tabler/icons-react"

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
import { registerAction } from "@/lib/actions/auth"
import { INITIAL_AUTH_STATE } from "@/lib/actions/state"

export function RegisterForm({
  template,
  next,
  initialFullName = "",
}: {
  template?: string
  next?: string
  initialFullName?: string
}) {
  const [state, formAction, pending] = useActionState(
    registerAction,
    INITIAL_AUTH_STATE
  )

  if (state.status === "success") {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border bg-card p-5">
          <span className="grid size-10 place-items-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <IconMailCheck className="size-5" />
          </span>
          <h2 className="mt-4 font-heading text-lg font-semibold">
            Check your inbox
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{state.email}</span>.
            Open it to confirm your account and start building.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Nothing there? Check spam, or wait a minute before requesting
            another link.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-10 w-full text-sm"
          render={<Link href="/login" />}
        >
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      {template ? <input type="hidden" name="template" value={template} /> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <FormFeedback status={state.status} message={state.message} />

      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="fullName">Full name</FieldLabel>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Avery Morgan"
            defaultValue={initialFullName}
            required
            maxLength={80}
            className="h-10 text-sm"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            defaultValue={state.email}
            required
            className="h-10 text-sm"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="8+ characters"
              required
              minLength={8}
              maxLength={72}
              className="h-10 text-sm"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm</FieldLabel>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              required
              minLength={8}
              maxLength={72}
              className="h-10 text-sm"
            />
          </Field>
        </div>
      </FieldGroup>

      <Button type="submit" className="h-10 w-full text-sm" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <FieldDescription className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </FieldDescription>
    </form>
  )
}
