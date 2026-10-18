"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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

  return <main className="auth-shell"><section className="auth-card">
    <Link className="wordmark" href="/">forme<span>.</span></Link>
    <span className="eyebrow">YOUR CREATIVE HOME</span>
    <h1>{mode === "login" ? "Welcome back." : "Start building."}</h1>
    <p>{mode === "login" ? "Sign in to continue shaping your portfolio." : "Create an account and make room for what you do."}</p>
    <form onSubmit={submit}>
      <label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <button className="button button-dark" disabled={busy}>{busy ? "Working…" : mode === "login" ? "Log in" : "Create account"}</button>
    </form>
    {mode === "login" && <button className="text-link auth-link" onClick={resetPassword}>Forgot your password?</button>}
    {message && <p className="notice">{message}</p>}
    <button className="auth-switch" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Create an account" : "Already have an account? Log in"}</button>
  </section></main>;
}
