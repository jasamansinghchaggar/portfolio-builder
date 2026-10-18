"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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

  return <main className="auth-shell"><section className="auth-card">
    <Link className="wordmark" href="/">forme<span>.</span></Link>
    <span className="eyebrow">ACCOUNT SECURITY</span>
    <h1>Choose a new password.</h1>
    <p>Use at least eight characters, then return to sign in.</p>
    <form onSubmit={submit}>
      <label>New password<input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <button className="button button-dark" disabled={busy}>{busy ? "Saving…" : "Update password"}</button>
    </form>
    {message && <p className="notice">{message}</p>}
    <Link className="text-link" href="/auth">Back to sign in</Link>
  </section></main>;
}
