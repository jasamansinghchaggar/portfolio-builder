import type { Metadata } from "next"

import { PreviewShell } from "@/components/editor/preview-shell"
import { requirePortfolio } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Preview draft",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function PreviewPage() {
  const { portfolio } = await requirePortfolio("/preview")
  return <PreviewShell username={portfolio.username} />
}
