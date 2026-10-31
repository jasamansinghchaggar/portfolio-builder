import type { Metadata } from "next"

import { BannerManager } from "@/components/admin/banner-manager"
import { requireAdmin } from "@/lib/auth"
import { adminListPromoBannersAction } from "@/lib/actions/admin"

export const metadata: Metadata = {
  title: "Promo banners",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminBannersPage() {
  await requireAdmin()

  const result = await adminListPromoBannersAction()
  const banners = result.ok ? result.banners : []

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Admin
        </p>
        <h1 className="mt-1.5 font-heading text-3xl font-semibold tracking-[-0.035em]">
          Promo banners
        </h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Create, edit, reorder, and remove the rotating messages shown on the
          public promo bar. Changes apply to every portfolio that shows the
          banner.
        </p>
      </div>

      <BannerManager initialBanners={banners} />
    </div>
  )
}