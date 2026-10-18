import { NextResponse } from "next/server";
import { profileSchema } from "@/lib/portfolio/schema";
import { requireApiUser } from "@/lib/supabase/require-api-user";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("profiles").select("display_name, bio").eq("id", auth.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ displayName: data?.display_name ?? "", bio: data?.bio ?? "" });
}

export async function PUT(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { data, error } = await auth.supabase
    .from("profiles")
    .upsert({ id: auth.user.id, display_name: parsed.data.displayName, bio: parsed.data.bio }, { onConflict: "id" })
    .select("display_name, bio")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ displayName: data.display_name, bio: data.bio });
}
