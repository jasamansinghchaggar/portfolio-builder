'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const supabase = createSupabaseBrowserClient();
      const result =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
            });
      if (result.error) throw result.error;
      if (mode === 'signup')
        setMessage('Check your email to verify your account before signing in.');
      else
        window.location.assign(
          new URLSearchParams(window.location.search).get('next') || '/dashboard',
        );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!email.trim()) {
      setMessage('Enter your email address first.');
      return;
    }
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (error) throw error;
      setMessage('If an account exists for that email, a recovery link has been sent.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send recovery email.');
    }
  }

  return (
    <main className="auth-shell" id="auth-page">
      <Card className="auth-card">
        <CardHeader className="p-0 gap-4">
          <Link className="wordmark" href="/">
            forme<span>.</span>
          </Link>
          <Badge variant="secondary" className="hero-eyebrow w-fit">
            <i /> YOUR CREATIVE HOME
          </Badge>
          <div>
            <CardTitle className="auth-title">
              {mode === 'login' ? 'Welcome back.' : 'Start building.'}
            </CardTitle>
            <CardDescription className="mt-1.5">
              {mode === 'login'
                ? 'Sign in to continue shaping your portfolio.'
                : 'Create an account and make room for what you do.'}
            </CardDescription>
          </div>
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as 'login' | 'signup')}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1" id="auth-tab-login">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1" id="auth-tab-signup">
                Create account
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={busy} className="w-full" id="auth-submit">
              {busy ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Working…
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Log in' : 'Create account'}
                  <ArrowRight data-icon="inline-end" weight="bold" />
                </>
              )}
            </Button>
          </form>

          {mode === 'login' && (
            <Button
              variant="link"
              className="auth-link mt-3 px-0 text-muted-foreground"
              onClick={resetPassword}
              id="auth-forgot"
            >
              Forgot your password?
            </Button>
          )}

          {message && (
            <Alert className="mt-4" id="auth-message">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
