"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const { error } = await createSupabaseBrowserClient().auth.updateUser({ password });
      if (error) throw error;
      setMessage("Your password has been updated. You can now sign in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update your password.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-shell"><Card className="auth-card">
    <CardHeader className="p-0">
      <Link className="wordmark mb-4" href="/">forme<span>.</span></Link>
      <span className="eyebrow">ACCOUNT SECURITY</span>
      <CardTitle className="auth-title">Choose a new password.</CardTitle>
      <CardDescription>Use at least eight characters, then return to sign in.</CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FieldGroup><Field><FieldLabel htmlFor="new-password">New password</FieldLabel><Input id="new-password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></Field></FieldGroup>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Update password"}</Button>
      </form>
      {message && <Alert className="mt-4"><AlertDescription>{message}</AlertDescription></Alert>}
      <Button asChild variant="link" className="mt-4 px-0"><Link href="/auth">Back to sign in</Link></Button>
    </CardContent>
  </Card></main>;
}
