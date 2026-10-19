'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const { error } = await createSupabaseBrowserClient().auth.updateUser({ password });
      if (error) throw error;
      setMessage('Your password has been updated. You can now sign in.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update your password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell" id="reset-page">
      <Card className="auth-card">
        <CardHeader className="p-0 gap-4">
          <Link className="wordmark" href="/">
            forme<span>.</span>
          </Link>
          <Badge variant="secondary" className="hero-eyebrow w-fit">
            <i /> ACCOUNT SECURITY
          </Badge>
          <div>
            <CardTitle className="auth-title">Choose a new password.</CardTitle>
            <CardDescription className="mt-1.5">
              Use at least eight characters, then return to sign in.
            </CardDescription>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={busy} className="w-full" id="reset-submit">
              {busy ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Saving…
                </>
              ) : (
                <>
                  Update password
                  <ArrowRight data-icon="inline-end" weight="bold" />
                </>
              )}
            </Button>
          </form>

          {message && (
            <Alert className="mt-4" id="reset-message">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Separator className="mt-4" />

          <Button asChild variant="ghost" className="mt-3 px-0" id="reset-back">
            <Link href="/auth">
              <ArrowLeft data-icon="inline-start" weight="bold" />
              Back to sign in
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
