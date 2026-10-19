import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect('/auth?next=/dashboard');
  return { supabase, user: data.user };
}
