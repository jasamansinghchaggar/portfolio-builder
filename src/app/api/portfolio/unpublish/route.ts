import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/supabase/require-api-user";

export async function POST() {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("portfolios").update({ published: null, published_at: null, updated_at: new Date().toISOString() }).eq("owner_id", auth.user.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
