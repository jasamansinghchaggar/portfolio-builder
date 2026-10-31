import "server-only"

import { notFound, redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/supabase/database.types"

export async function getAuthUserId() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error) return { supabase, userId: null as string | null }
  const userId =
    typeof data?.claims?.sub === "string" ? data.claims.sub : null
  return { supabase, userId }
}

export async function requireUser(nextPath?: string) {
  const { supabase, userId } = await getAuthUserId()
  if (!userId) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""
    redirect(`/login${next}`)
  }
  const profile = await getProfile(userId)
  if (profile?.must_change_password && nextPath !== "/reset-password") {
    redirect("/reset-password")
  }
  return { supabase, userId }
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()
  return data as Profile | null
}

export async function requireAdmin() {
  const { supabase, userId } = await requireUser("/admin")
  const profile = await getProfile(userId)
  if (profile?.must_change_password) redirect("/reset-password")
  if (profile?.role !== "admin") {
    notFound()
  }
  return { supabase, userId, profile }
}

export async function getMyPortfolio(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()
  return data
}

export async function requirePortfolio(nextPath?: string) {
  const { supabase, userId } = await requireUser(nextPath)
  const profile = await getProfile(userId)
  if (profile?.must_change_password) redirect("/reset-password")
  if (profile?.role === "admin") redirect("/admin")
  const portfolio = await getMyPortfolio(userId)
  if (!portfolio) redirect("/onboarding")
  return { supabase, userId, portfolio }
}
