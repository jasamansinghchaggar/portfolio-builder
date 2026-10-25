# Manual setup

These steps happen in dashboards and infrastructure, not in code. Use separate
Supabase projects for local and production when possible.

## Local

1. **Create/select a Supabase project** and apply all migrations:
   - `supabase/migrations/20261024000000_initial_schema.sql`
   - `supabase/migrations/20261024000100_publish_separate_snapshot.sql`
   - `supabase/migrations/20261025000000_fix_revision_ambiguity.sql`

2. **Create `.env.local`** from `.env.example` and set:
   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=Folio
   NEXT_PUBLIC_PORTFOLIO_URL_MODE=path
   NEXT_PUBLIC_ROOT_DOMAIN=
   ```

3. **Supabase Auth URLs** — set:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`

4. **Email testing** — either keep email confirmation off for faster local
   testing, or use a real inbox. Built-in Supabase email has tight rate limits;
   custom SMTP is optional locally.

5. **Admin account** — after registering your local user, run:
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'you@example.com';
   ```
   Sign out and back in, then open `/admin`.

6. **Run the app**:
   ```bash
   npm run dev
   ```
   Check register → verify (if enabled) → onboarding → editor → preview →
   publish → public `/p/<username>` → unpublish.

## Production (Vercel)

1. **Apply all three migrations** to the production Supabase project.

2. **Set Vercel environment variables**:
   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   NEXT_PUBLIC_APP_NAME=Folio
   NEXT_PUBLIC_PORTFOLIO_URL_MODE=path
   NEXT_PUBLIC_ROOT_DOMAIN=
   ```
   `NEXT_PUBLIC_SITE_URL` must have no trailing slash.

3. **Supabase Auth URLs** — set:
   - Site URL: `https://yourdomain.com`
   - Redirect URL: `https://yourdomain.com/auth/callback`

4. **Email delivery** — configure custom SMTP in Supabase and keep email
   confirmation enabled. If using custom templates, point links at:
   ```text
   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/onboarding
   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
   ```

5. **Subdomain mode only** (optional):
   - Set `NEXT_PUBLIC_PORTFOLIO_URL_MODE=subdomain`
   - Set `NEXT_PUBLIC_ROOT_DOMAIN=yourdomain.com`
   - Add a wildcard domain `*.yourdomain.com` in Vercel and the DNS record
     Vercel provides.
   - `https://yourdomain.com/p/<username>` continues to work as a fallback.

6. **Admin account** — promote the production account:
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'you@example.com';
   ```

7. **Deploy and smoke test** in a private browser window:
   - Register and confirm the email.
   - Create a portfolio, upload an image and a CV, and publish.
   - Open the public URL and confirm draft-only changes are not visible.
   - Unpublish and confirm the public URL returns 404.
   - Sign in as the admin and open `/admin`.

8. **Optional** — run the Supabase security/performance advisors after launch.
   Public RPC warnings are expected; those functions only return published data.
