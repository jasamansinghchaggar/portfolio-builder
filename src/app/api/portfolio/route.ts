import { NextResponse } from "next/server";
import { portfolioSchema, validatePortfolioSlug } from "@/lib/portfolio/schema";
import { requireApiUser } from "@/lib/supabase/require-api-user";
import { refreshPortfolioImageUrls } from "@/lib/portfolio/media";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("portfolios").select("*").eq("owner_id", auth.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.draft) return NextResponse.json(data);

  const parsed = portfolioSchema.safeParse(data.draft);
  if (!parsed.success) return NextResponse.json(data);

  const draft = await refreshPortfolioImageUrls(parsed.data, async (path) => {
    const { data: signed } = await auth.supabase.storage
      .from("portfolio-media")
      .createSignedUrl(path, 60 * 60);
    return signed?.signedUrl ?? null;
  });

  return NextResponse.json({ ...data, draft });
}

export async function PUT(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const input = await request.json().catch(() => null);
  const parsed = portfolioSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const slug = validatePortfolioSlug(parsed.data.slug);
  if (!slug.valid) return NextResponse.json({ error: slug.message }, { status: 400 });
  const { data: existing, error: existingError } = await auth.supabase.from("portfolios").select("id").eq("owner_id", auth.user.id).maybeSingle();
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  const values = {
    name: parsed.data.name,
    slug: slug.slug,
    kind: parsed.data.kind,
    template: parsed.data.template,
    accent: parsed.data.accent,
    draft: parsed.data,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = existing
    ? await auth.supabase.from("portfolios").update(values).eq("id", existing.id).eq("owner_id", auth.user.id).select().single()
    : await auth.supabase.from("portfolios").insert({ ...values, owner_id: auth.user.id }).select().single();
  if (error) {
    const status = error.code === "23505" ? 409 : error.code === "23503" ? 422 : 500;
    return NextResponse.json({ error: error.message, hint: error.code === "23503" ? "Run the Supabase profile and portfolio migrations, then sign in again." : undefined }, { status });
  }
  return NextResponse.json(data);
}
