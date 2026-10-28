"use server"

import { z } from "zod"

import { createPublicClient } from "@/lib/supabase/public"
import { normalizeUsername, USERNAME_PATTERN } from "@/lib/config"

const messageSchema = z.object({
  username: z.string().trim().min(3).max(30),
  name: z.string().trim().min(1).max(120),
  email: z
    .string()
    .trim()
    .max(254)
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Enter a valid email address."
    ),
  phone: z.string().trim().max(40),
  message: z.string().trim().min(1).max(4000),
})

export async function sendPortfolioMessageAction(input: {
  username: string
  name: string
  email: string
  phone: string
  message: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const username = normalizeUsername(input.username)
  if (!USERNAME_PATTERN.test(username) || username.includes("--")) {
    return { ok: false, error: "This portfolio is unavailable." }
  }

  const parsed = messageSchema.safeParse({ ...input, username })
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Check the form and try again."
    return { ok: false, error: first }
  }

  if (!parsed.data.email && !parsed.data.phone) {
    return {
      ok: false,
      error: "Add an email address or phone number so we can reply.",
    }
  }

  const supabase = createPublicClient()
  const { error } = await supabase.rpc("send_portfolio_message", {
    p_username: parsed.data.username,
    p_name: parsed.data.name,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone,
    p_message: parsed.data.message,
  })

  if (error) {
    if (error.message === "rate_limited") {
      return {
        ok: false,
        error: "Too many messages from this address. Please try again later.",
      }
    }
    return {
      ok: false,
      error: "Could not send your message. Please try again or contact us directly.",
    }
  }

  return { ok: true }
}
