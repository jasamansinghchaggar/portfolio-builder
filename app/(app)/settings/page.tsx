import type { Metadata } from "next"
import {
  IconChevronDown,
  IconLock,
  IconLogout,
  IconUser,
} from "@tabler/icons-react"

import { CopyUrlButton } from "@/components/dashboard/copy-url-button"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { NameForm } from "@/components/settings/name-form"
import { UsernameForm } from "@/components/settings/username-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { logoutAction } from "@/lib/actions/auth"
import { getProfile, requirePortfolio } from "@/lib/auth"
import { publicPortfolioUrl } from "@/lib/config"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "Settings",
}

export default async function SettingsPage() {
  const { userId, portfolio } = await requirePortfolio("/settings")
  const profile = await getProfile(userId)
  const url = publicPortfolioUrl(portfolio.username)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Settings
        </p>
        <h1 className="mt-1.5 font-heading text-3xl font-semibold tracking-[-0.035em]">
          Account & address
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The details behind your page and your way in.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-muted">
                <IconUser className="size-3.5" />
              </span>
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>
              Your name and sign-in address. The name appears across your
              portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NameForm
              fullName={profile?.full_name ?? ""}
              email={profile?.email ?? ""}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Public address</CardTitle>
            <CardDescription>
              Where visitors find your page. Changing it breaks old links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsernameForm
              portfolioId={portfolio.id}
              username={portfolio.username}
              url={url}
            />
            <div className="mt-4 flex items-center gap-2 border-t pt-4">
              <CopyUrlButton url={url} label="Copy public link" />
              {portfolio.status === "published" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  render={<a href={url} target="_blank" rel="noreferrer" />}
                >
                  Open
                </Button>
              ) : (
                <span className="text-[0.65rem] text-muted-foreground">
                  Link activates when you publish.
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-muted">
                <IconLock className="size-3.5" />
              </span>
              <CardTitle>Password</CardTitle>
            </div>
            <CardDescription>
              Choose a new password. You&apos;ll stay signed in on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5 text-sm font-medium marker:hidden">
                Change password
                <IconChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="pt-4">
                <ResetPasswordForm email={profile?.email ?? ""} />
              </div>
            </details>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Member details and session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate font-medium">{profile?.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="font-medium">{formatDate(profile?.created_at)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Account type</dt>
                <dd className="font-medium capitalize">{profile?.role}</dd>
              </div>
            </dl>

            <form action={logoutAction} className="border-t pt-4">
              <Button
                type="submit"
                variant="outline"
                className="h-9 w-full text-sm"
              >
                <IconLogout data-icon="inline-start" />
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
