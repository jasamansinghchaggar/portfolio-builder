import type { Metadata } from "next"
import Link from "next/link"
import { IconLockExclamation } from "@tabler/icons-react"

import { AuthLayout } from "@/components/auth/auth-layout"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your account.",
}

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null

  if (!email) {
    return (
      <AuthLayout
        title="This link has expired."
        description="Password reset links are single-use and expire after one hour."
      >
        <div className="space-y-5">
          <span className="grid size-11 place-items-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <IconLockExclamation className="size-5" />
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Request a new link and we&apos;ll email it to the address on your
            account.
          </p>
          <Button
            className="h-10 w-full text-sm"
            nativeButton={false}
            render={<Link href="/forgot-password?expired=1" />}
          >
            Request a new link
          </Button>
          <Button
            variant="ghost"
            className="h-9 w-full text-sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Back to sign in
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Choose a new password."
      description="Make it memorable, unique, and at least eight characters."
    >
      <ResetPasswordForm email={email} />
    </AuthLayout>
  )
}
