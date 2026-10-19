import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Portfolio } from "@/lib/portfolio/schema";
import { PortfolioShowcase } from "@/components/portfolio-showcase";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();
    if (!supabase) return {};
    const { data } = await supabase
        .from("portfolios")
        .select("published")
        .eq("slug", slug)
        .not("published", "is", null)
        .maybeSingle();
    const portfolio = data?.published as Portfolio | null;
    if (!portfolio) return {};
    return {
        title: `${portfolio.name} — Forme`,
        description: String(
            portfolio.sections.find((section) => section.type === "hero")
                ?.content.subtitle ?? `Portfolio by ${portfolio.name}`,
        ),
        openGraph: {
            title: `${portfolio.name} — Forme`,
            description: `Portfolio by ${portfolio.name}`,
        },
    };
}

async function PublicPortfolio({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase
        .from("portfolios")
        .select("published")
        .eq("slug", slug)
        .not("published", "is", null)
        .maybeSingle();
    if (error || !data?.published) notFound();
    const portfolio = data.published as Portfolio;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const storage =
        serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL
            ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
                  auth: { autoRefreshToken: false, persistSession: false },
              }).storage.from("portfolio-media")
            : null;
    const sections = await Promise.all(
        portfolio.sections
            .filter((section) => section.visible)
            .map(async (section) => {
                if (typeof section.content.imagePath !== "string" || !storage)
                    return section;
                const { data: signed } = await storage.createSignedUrl(
                    section.content.imagePath,
                    60 * 60,
                );
                return signed?.signedUrl
                    ? {
                          ...section,
                          content: {
                              ...section.content,
                              imageUrl: signed.signedUrl,
                          },
                      }
                    : section;
            }),
    );
    return <PortfolioShowcase portfolio={{ ...portfolio, sections }} />;
}

export default PublicPortfolio;
