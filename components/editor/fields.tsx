"use client"

import { useId, useState, type ReactNode } from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  sanitizeEmailInput,
  sanitizePhoneInput,
} from "@/lib/portfolio/validation"

export function EditorField({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label?: string
  hint?: ReactNode
  error?: ReactNode
  htmlFor?: string
  children: ReactNode
  className?: string
}) {
  return (
    <Field className={cn("gap-1.5", className)}>
      {label ? <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel> : null}
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <FieldDescription>{hint}</FieldDescription>
      ) : null}
    </Field>
  )
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  validate,
  type = "text",
  maxLength,
  id,
  className,
  inputClassName,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: ReactNode
  /** Returns a validation message, or `undefined` when the value is valid. */
  validate?: (value: string) => string | undefined
  type?: string
  maxLength?: number
  id?: string
  className?: string
  inputClassName?: string
}) {
  const [touched, setTouched] = useState(false)
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const errorId = `${fieldId}-error`
  const error = touched && validate ? validate(value) : undefined

  return (
    <EditorField
      label={label}
      hint={hint}
      error={error ? <span id={errorId}>{error}</span> : undefined}
      htmlFor={fieldId}
      className={className}
    >
      <Input
        id={fieldId}
        type={type}
        inputMode={
          type === "tel" ? "numeric" : type === "email" ? "email" : undefined
        }
        value={value}
        onChange={(event) => {
          const nextValue =
            type === "tel"
              ? sanitizePhoneInput(event.target.value)
              : type === "email"
                ? sanitizeEmailInput(event.target.value)
                : event.target.value
          onChange(nextValue)
        }}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn("h-9 text-sm", inputClassName)}
      />
    </EditorField>
  )
}

export function TextAreaInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 4,
  maxLength,
  id,
  className,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: ReactNode
  rows?: number
  maxLength?: number
  id?: string
  className?: string
}) {
  return (
    <EditorField label={label} hint={hint} htmlFor={id} className={className}>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="min-h-20 text-sm"
      />
    </EditorField>
  )
}

export function LinesInput({
  label,
  value,
  onChange,
  placeholder = "One per line",
  hint = "One per line.",
  rows = 4,
  id,
  className,
}: {
  label?: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  hint?: ReactNode
  rows?: number
  id?: string
  className?: string
}) {
  return (
    <EditorField label={label} hint={hint} htmlFor={id} className={className}>
      <Textarea
        id={id}
        value={value.join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          )
        }
        placeholder={placeholder}
        rows={rows}
        className="min-h-20 text-sm"
      />
    </EditorField>
  )
}

export function FieldRow({
  children,
  columns = 2,
  className,
}: {
  children: ReactNode
  columns?: 2 | 3
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div>
        <h4 className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {title}
        </h4>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
