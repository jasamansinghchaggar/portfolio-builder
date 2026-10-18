import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Portfolio } from "@/lib/portfolio/schema";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return {};
  const { data } = await supabase.from("portfolios").select("published").eq("slug", slug).not("published", "is", null).maybeSingle();
  const portfolio = data?.published as Portfolio | null;
  if (!portfolio) return {};
  return {
    title: `${portfolio.name} — Forme`,
    description: String(portfolio.sections.find((section) => section.type === "hero")?.content.subtitle ?? `Portfolio by ${portfolio.name}`),
    openGraph: { title: `${portfolio.name} — Forme`, description: `Portfolio by ${portfolio.name}` },
  };
}

async function PublicPortfolio({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.from("portfolios").select("published").eq("slug", slug).not("published", "is", null).maybeSingle();
  if (error || !data?.published) notFound();
  const portfolio = data.published as Portfolio;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const storage = serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } }).storage.from("portfolio-media")
    : null;
  const sections = await Promise.all(portfolio.sections.filter((section) => section.visible).map(async (section) => {
    if (typeof section.content.imagePath !== "string" || !storage) return section;
    const { data: signed } = await storage.createSignedUrl(section.content.imagePath, 60 * 60);
    return signed?.signedUrl ? { ...section, content: { ...section.content, imageUrl: signed.signedUrl } } : section;
  }));
  return <main className={`public-portfolio public-${portfolio.template}`} style={{ "--accent": portfolio.accent } as React.CSSProperties}>
    <header><span className="eyebrow">{portfolio.kind === "organization" ? "ORGANIZATION" : "PORTFOLIO"}</span><h1>{portfolio.name}</h1></header>
    {sections.map((section) => <section key={section.id}><span className="eyebrow">{section.title}</span><h2>{String(section.content.headline ?? section.content.body ?? "")}</h2>{typeof section.content.imageUrl === "string" && /^https?:\/\//i.test(section.content.imageUrl) && <img src={section.content.imageUrl} alt="" loading="lazy" />}{typeof section.content.url === "string" && /^https?:\/\//i.test(section.content.url) && <a href={section.content.url} target="_blank" rel="noreferrer noopener">Visit link ↗</a>}</section>)}
  </main>;
}

export default PublicPortfolio;
