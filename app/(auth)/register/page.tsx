import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm } from "@/components/auth/register-form"
import { getAuthUserId } from "@/lib/auth"
import { resolveSafeNextPath } from "@/lib/config"
import { TEMPLATE_IDS, type TemplateId } from "@/lib/portfolio/constants"
import { getTemplate } from "@/lib/portfolio/templates"

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a free account, choose a template, and publish your portfolio.",
}

type PageProps = {
  searchParams: Promise<{
    template?: string | string[]
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

  const requested = single(params.template)
  const template =
    requested && TEMPLATE_IDS.includes(requested as TemplateId)
      ? getTemplate(requested as TemplateId)
      : null

  return (
    <AuthLayout
      title="Start with a blank page."
      description={
        template
          ? `Create your account and we'll set you up with the ${template.name} template.`
          : "Create your account and we'll help you choose a starting point."
      }
    >
      <RegisterForm template={template?.id} next={next ?? undefined} />
    </AuthLayout>
  )
}
