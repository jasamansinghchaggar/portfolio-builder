import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import { Brand } from "@/components/marketing/brand"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/lib/actions/auth"
import { getMyPortfolio, requireUser, getProfile } from "@/lib/auth"
import { DEFAULT_TEMPLATE_ID } from "@/lib/portfolio/templates"

export const metadata: Metadata = {
  title: "Set up your portfolio",
  description: "Name your business, add your details, and start building.",
}

export default async function OnboardingPage() {
  const { userId } = await requireUser("/onboarding")
  const profile = await getProfile(userId)
  if (profile?.role === "admin") redirect("/admin")
  const portfolio = await getMyPortfolio(userId)
  if (portfolio) redirect("/dashboard")

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(180,83,9,0.09),transparent_45%),radial-gradient(ellipse_at_85%_15%,rgba(15,118,110,0.06),transparent_40%)]"
      />
      <header className="relative border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Brand href="/" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <IconArrowLeft />
              Home
            </Button>
            <form action={logoutAction}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                type="submit"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <OnboardingForm
          fullName={profile?.full_name ?? ""}
          templateId={DEFAULT_TEMPLATE_ID}
        />
      </main>
    </div>
  )
}
