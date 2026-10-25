import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import { Brand } from "@/components/marketing/brand"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/lib/actions/auth"
import { getMyPortfolio, requireUser, getProfile } from "@/lib/auth"
import { TEMPLATE_IDS, type TemplateId } from "@/lib/portfolio/constants"

export const metadata: Metadata = {
  title: "Set up your portfolio",
  description: "Name your portfolio, choose a template, and start writing.",
}

type PageProps = {
  searchParams: Promise<{ template?: string | string[] }>
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const requested = Array.isArray(params.template)
    ? params.template[0]
    : params.template
  const templateId =
    requested && TEMPLATE_IDS.includes(requested as TemplateId)
      ? (requested as TemplateId)
      : "atlas"

  const { userId } = await requireUser("/onboarding")
  const portfolio = await getMyPortfolio(userId)
  if (portfolio) redirect("/dashboard")
  const profile = await getProfile(userId)

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
              <IconArrowLeft data-icon="inline-start" />
              Home
            </Button>
            <form action={logoutAction}>
              <Button variant="outline" size="sm" className="h-8 text-xs" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <OnboardingForm
          fullName={profile?.full_name ?? ""}
          templateId={templateId}
        />
      </main>
    </div>
  )
}
