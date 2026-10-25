import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import type { Database } from "./database.types"

let publicClient: ReturnType<typeof createSupabaseClient<Database>> | null =
  null

export function createPublicClient() {
  if (publicClient) return publicClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    )
  }

  publicClient = createSupabaseClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return publicClient
}
