import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function requireApiUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase)
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 }),
    };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user)
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
    };
  return { ok: true as const, supabase, user: data.user };
}
