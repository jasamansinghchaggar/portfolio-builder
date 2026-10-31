"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/auth/password-input"
import { adminCreateAdminAction } from "@/lib/actions/admin"
import { formatDate } from "@/lib/format"
import type { Profile } from "@/lib/supabase/database.types"

export function AdminManager({
  initialAdmins,
}: {
  initialAdmins: Pick<Profile, "id" | "email" | "full_name" | "created_at">[]
}) {
  const router = useRouter()
  const [admins, setAdmins] = useState(initialAdmins)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, startTransition] = useTransition()

  function handleCreate() {
    if (!fullName.trim() || !email.trim() || !password) {
      toast.error("All fields are required")
      return
    }
    startTransition(async () => {
      try {
        const result = await adminCreateAdminAction({
          fullName,
          email,
          password,
        })
        if (!result.ok) {
          toast.error("Couldn't create administrator", {
            description: result.error,
          })
          return
        }
        toast.success("Administrator created", {
          description:
            "They must change the temporary password on first sign-in.",
        })
        setAdmins((current) => [
          ...current,
          {
            id: result.userId,
            email: email.trim().toLowerCase(),
            full_name: fullName.trim(),
            created_at: new Date().toISOString(),
          },
        ])
        setFullName("")
        setEmail("")
        setPassword("")
        router.refresh()
      } catch {
        toast.error("Couldn't create administrator", {
          description: "Check your connection and try again.",
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="font-heading text-base font-semibold">
          Create administrator
        </h2>
        <p className="text-xs text-muted-foreground">
          The new account is created with admin access and skips portfolio
          onboarding. Share the credentials securely; they can change their
          password after signing in.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Full name
            </label>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Avery Morgan"
              maxLength={80}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Temporary password
          </label>
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            maxLength={72}
          />
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={handleCreate} disabled={pending}>
            {pending ? "Creating…" : "Create administrator"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No administrators found.
                </td>
              </tr>
            ) : null}
            {admins.map((admin) => (
              <tr key={admin.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">
                  {admin.full_name || "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{admin.email}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(admin.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}