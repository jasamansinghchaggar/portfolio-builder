import { AppHeader } from "@/components/app/app-header"
import { AppMain } from "@/components/app/app-main"
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
      <AppMain>{children}</AppMain>
    </div>
  )
}
