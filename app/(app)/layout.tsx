import { AppHeader } from "@/components/app/app-header"
import { getMyPortfolio, getProfile, requireUser } from "@/lib/auth"
import { initials } from "@/lib/portfolio/sections"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await requireUser()
  const [profile, portfolio] = await Promise.all([
    getProfile(userId),
    getMyPortfolio(userId),
  ])

  return (
    <div className="min-h-screen bg-muted/25">
      <AppHeader
        fullName={profile?.full_name ?? ""}
        email={profile?.email ?? ""}
        isAdmin={profile?.role === "admin"}
        hasPortfolio={Boolean(portfolio)}
        status={portfolio?.status ?? null}
        initials={initials(profile?.full_name ?? "")}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
