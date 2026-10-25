import type { Metadata } from "next"
import Link from "next/link"

import { AuthLayout } from "@/components/auth/auth-layout"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a password reset link for your account.",
}

type PageProps = {
  searchParams: Promise<{ email?: string | string[]; expired?: string | string[] }>
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams
  const expired = single(params.expired) === "1"

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter the email on your account and we'll send a link to set a new password."
      footer={
        <p className="text-center text-xs">
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4"
          >
            Back to sign in
          </Link>
          .
        </p>
      }
    >
      <div className="space-y-5">
        {expired ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            That reset link is invalid or has expired. Request a fresh one
            below.
          </p>
        ) : null}
        <ForgotPasswordForm initialEmail={single(params.email) ?? ""} />
      </div>
    </AuthLayout>
  )
}
