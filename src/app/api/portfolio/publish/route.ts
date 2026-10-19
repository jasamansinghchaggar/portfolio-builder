import { NextResponse } from 'next/server';
import { portfolioSchema } from '@/lib/portfolio/schema';
import { requireApiUser } from '@/lib/supabase/require-api-user';

export async function POST() {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { data: portfolio, error: readError } = await auth.supabase
    .from('portfolios')
    .select('*')
    .eq('owner_id', auth.user.id)
    .single();
  if (readError || !portfolio)
    return NextResponse.json(
      { error: 'Create and save a portfolio before publishing.' },
      { status: 404 },
    );
  const parsed = portfolioSchema.safeParse(portfolio.draft);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { data, error } = await auth.supabase
    .from('portfolios')
    .update({
      published: parsed.data,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', portfolio.id)
    .eq('owner_id', auth.user.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const url = site ? `${site}/${parsed.data.slug}` : null;
  return NextResponse.json({ portfolio: data, url });
}
