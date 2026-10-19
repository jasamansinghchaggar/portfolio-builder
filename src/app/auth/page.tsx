"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const result = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (result.error) throw result.error;
      if (mode === "signup") setMessage("Check your email to verify your account before signing in.");
      else window.location.assign(new URLSearchParams(window.location.search).get("next") || "/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset` });
      if (error) throw error;
      setMessage("If an account exists for that email, a recovery link has been sent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send recovery email.");
    }
  }

  return <main className="auth-shell"><Card className="auth-card">
    <CardHeader className="p-0">
      <Link className="wordmark mb-4" href="/">forme<span>.</span></Link>
      <span className="eyebrow">YOUR CREATIVE HOME</span>
      <CardTitle className="auth-title">{mode === "login" ? "Welcome back." : "Start building."}</CardTitle>
      <CardDescription>{mode === "login" ? "Sign in to continue shaping your portfolio." : "Create an account and make room for what you do."}</CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FieldGroup>
          <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
          <Field><FieldLabel htmlFor="password">Password</FieldLabel><Input id="password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></Field>
        </FieldGroup>
        <Button type="submit" disabled={busy}>{busy ? "Working…" : mode === "login" ? "Log in" : "Create account"}</Button>
      </form>
      {mode === "login" && <Button variant="link" className="auth-link mt-3 px-0" onClick={resetPassword}>Forgot your password?</Button>}
      {message && <Alert className="mt-4"><AlertDescription>{message}</AlertDescription></Alert>}
      <Button variant="ghost" className="auth-switch mt-4 justify-start px-0" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Create an account" : "Already have an account? Log in"}</Button>
    </CardContent>
  </Card></main>;
}
