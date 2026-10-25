import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"
import { getAuthUserId } from "@/lib/auth"
import { resolveSafeNextPath } from "@/lib/config"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to edit and publish your portfolio.",
}

type PageProps = {
  searchParams: Promise<{
    next?: string | string[]
    auth_error?: string | string[]
    email?: string | string[]
  }>
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams
  const next = resolveSafeNextPath(single(params.next))
  const { userId } = await getAuthUserId()
  if (userId) redirect(next ?? "/dashboard")

  return (
    <AuthLayout
      title="Welcome back."
      description="Sign in to pick up your portfolio where you left it."
      footer={
        <p className="text-center text-xs">
          Trouble signing in?{" "}
          <Link
            href="/forgot-password"
            className="text-foreground underline underline-offset-4"
          >
            Reset your password
          </Link>
          .
        </p>
      }
    >
      <LoginForm
        next={next ?? undefined}
        initialEmail={single(params.email) ?? ""}
        expired={single(params.auth_error) === "expired"}
      />
    </AuthLayout>
  )
}
