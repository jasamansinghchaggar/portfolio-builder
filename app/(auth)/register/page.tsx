import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm } from "@/components/auth/register-form"
import { getAuthUserId } from "@/lib/auth"
import { resolveSafeNextPath } from "@/lib/config"
import { getTemplate } from "@/lib/portfolio/templates"

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a free account and publish a business website with the Studio design.",
}

type PageProps = {
  searchParams: Promise<{
    next?: string | string[]
  }>
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams
  const next = resolveSafeNextPath(single(params.next))
  const { userId } = await getAuthUserId()
  if (userId) redirect(next ?? "/dashboard")

  const template = getTemplate("studio")

  return (
    <AuthLayout
      title="Start with a blank page."
      description="Create your account and we'll set you up with the Studio design."
    >
      <RegisterForm template={template.id} next={next ?? undefined} />
    </AuthLayout>
  )
}
