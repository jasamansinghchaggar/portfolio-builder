import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { IconArrowLeft, IconArrowUpRight } from "@tabler/icons-react"

import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer"
import { Button } from "@/components/ui/button"
import { createSampleContent } from "@/lib/portfolio/sample"
import { TEMPLATES } from "@/lib/portfolio/templates"

export const dynamic = "force-static"
export const dynamicParams = false

type PageProps = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return TEMPLATES.map((template) => ({ id: template.id }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const template = TEMPLATES.find((item) => item.id === id)
  if (!template) {
    return { title: "Template not found" }
  }
  return {
    title: `${template.name} template`,
    description: template.description,
    alternates: { canonical: `/template-preview/${template.id}` },
  }
}

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { id } = await params
  const template = TEMPLATES.find((item) => item.id === id)
  if (!template) notFound()

  const content = createSampleContent(template.id)

  return (
    <div className="bg-background">
      <div className="border-b bg-muted/40">
        <div className="mx-auto flex w-full max-w-295 flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/#templates" />}
            >
              <IconArrowLeft />
              Templates
            </Button>
            <div className="h-5 w-px bg-border" />
            <div>
              <p className="text-sm font-medium">{template.name}</p>
              <p className="text-xs text-muted-foreground">
                {template.tagline}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/register?template=${template.id}`} />}
          >
            Use this template
            <IconArrowUpRight />
          </Button>
        </div>
      </div>
      <PortfolioRenderer content={content} preview />
    </div>
  )
}
