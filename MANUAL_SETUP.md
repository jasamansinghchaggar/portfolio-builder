# Manual setup

These steps happen in dashboards and infrastructure, not in code. Use separate
Supabase projects for local and production when possible.

## Switching an existing install to a new project

Use this when the app already runs and you are replacing its Supabase project.

1. **Create the new project** and copy its Project URL and publishable key.
2. **Apply every migration** listed under [Local](#local) to the new project.
   A fresh database needs the whole list, not just the newest file. The CLI
   records each file in `supabase_migrations.schema_migrations`; the SQL editor
   does not.
3. **Update credentials** in both env files:
   - `.env.local` for local development
   - `.env.prod` for your records, plus Vercel → Settings → Environment
     Variables for the deployed app (Vercel does not read `.env.prod`)

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://<new-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<new-publishable-key>
   ```
4. **Regenerate types** so they match the new project:
   ```bash
   npx supabase gen types typescript --project-id <new-project-ref> --schema public \
     > lib/supabase/database.types.ts
   ```
5. **Recreate dashboard settings** that are not stored in SQL: Auth Site URL,
   redirect URLs, SMTP, and the first admin (step 5 under Local).
6. **Verify** the private `portfolio-media` bucket and its policies exist, then
   smoke-test register → onboarding → editor → publish → public page → admin
   toggles.

The old project can stay running until the new one passes the smoke test.

## Local

1. **Create/select a Supabase project** and apply every migration in filename
   order:
   - `supabase/migrations/20261024000000_initial_schema.sql`
   - `supabase/migrations/20261024000100_publish_separate_snapshot.sql`
   - `supabase/migrations/20261025000000_fix_revision_ambiguity.sql`
   - `supabase/migrations/20261028000000_business_platform.sql`
   - `supabase/migrations/20261031000000_portfolio_admin_controls.sql`

   With the Supabase CLI:
   ```bash
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```
   Or paste each file into the SQL editor, one at a time, in the same order.
   The `initial_schema` file already contains the foreign keys that an older
   remote-only `profile_foreign_keys` migration added, so there is no separate
   migration for it.

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

1. **Apply all five migrations** to the production Supabase project (same list
   as Local; see [Switching an existing install to a new project](#switching-an-existing-install-to-a-new-project)).

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
