"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getAuthUserId } from "@/lib/auth"

async function isAdmin(
  supabase: Awaited<ReturnType<typeof getAuthUserId>>["supabase"],
  userId: string
) {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()
  return data?.role === "admin"
}

export async function markMessageReadAction(formData: FormData): Promise<void> {
  const messageId = String(formData.get("messageId") ?? "")
  const read = formData.get("read") === "1"
  if (!z.uuid().safeParse(messageId).success) return

  const { supabase, userId } = await getAuthUserId()
  if (!userId) return

  if (await isAdmin(supabase, userId)) {
    await supabase.rpc("admin_mark_message_read", {
      p_message_id: messageId,
      p_read: read,
    })
  } else {
    await supabase
      .from("portfolio_messages")
      .update({ read_at: read ? new Date().toISOString() : null })
      .eq("id", messageId)
  }

  revalidatePath("/messages")
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  const messageId = String(formData.get("messageId") ?? "")
  if (!z.uuid().safeParse(messageId).success) return

  const { supabase, userId } = await getAuthUserId()
  if (!userId) return

  await supabase.from("portfolio_messages").delete().eq("id", messageId)
  revalidatePath("/messages")
}
