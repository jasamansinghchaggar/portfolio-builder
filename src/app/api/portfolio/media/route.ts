import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/supabase/require-api-user";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  const extension = allowedTypes.get(file.type);
  if (!extension || file.size > maxBytes) {
    return NextResponse.json({ error: "Use a JPG, PNG, or WebP image up to 5 MB." }, { status: 400 });
  }
  const path = `${auth.user.id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await auth.supabase.storage.from("portfolio-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: signed, error: signedError } = await auth.supabase.storage
    .from("portfolio-media")
    .createSignedUrl(path, 60 * 60);
  if (signedError) return NextResponse.json({ error: signedError.message }, { status: 500 });
  return NextResponse.json({ path, url: signed.signedUrl });
}
