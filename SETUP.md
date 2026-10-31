# Setup

First-time setup to run this project on your machine.

## Prerequisites

- Node.js 20+ and npm
- A Supabase project (free tier is fine)
- Git

## 1. Clone and install

```bash
git clone https://github.com/jasamansinghchaggar/portfolio-builder.git
cd portfolio-builder
npm install
```

## 2. Create a Supabase project

1. Create a new project in the Supabase dashboard.
2. Copy the **Project URL** and the **publishable (anon) key** from
   Project Settings → API.
3. (Optional, for admin creation) copy the **service role / secret key**.

## 3. Apply the database migrations

Apply every file in `supabase/migrations/` in filename order. With the
Supabase CLI:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Or paste each file into the SQL editor, one at a time, in this order:

1. `supabase/migrations/20261024000000_initial_schema.sql`
2. `supabase/migrations/20261024000100_publish_separate_snapshot.sql`
3. `supabase/migrations/20261025000000_fix_revision_ambiguity.sql`
4. `supabase/migrations/20261028000000_business_platform.sql`
5. `supabase/migrations/20261031000000_portfolio_admin_controls.sql`
6. `supabase/migrations/20261101000000_promo_banners.sql`
7. `supabase/migrations/20261102000000_must_change_password.sql`

The migrations create the tables, RLS policies, RPCs, the private
`portfolio-media` storage bucket, and its policies.

## 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-only; needed for admin creation
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Folio
NEXT_PUBLIC_PORTFOLIO_URL_MODE=path
NEXT_PUBLIC_ROOT_DOMAIN=
```

## 5. Configure Supabase Auth URLs

In the Supabase dashboard (Authentication → URL configuration):

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

## 6. Create an admin account

Register a normal account, then promote it:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

Sign out and back in, then open `/admin`. (With `SUPABASE_SERVICE_ROLE_KEY`
set, you can also create admins from `/admin` → **Admins** tab.)

## 7. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## Useful commands

```bash
npm run build        # production build
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm test             # Vitest
```

## Production (Vercel)

1. Apply all seven migrations to the production Supabase project.
2. Set the same environment variables in Vercel (including
   `SUPABASE_SERVICE_ROLE_KEY`), with `NEXT_PUBLIC_SITE_URL` pointing at your
   domain (no trailing slash).
3. Set Supabase Auth URLs to your production domain and its `/auth/callback`.
4. Configure custom SMTP in Supabase for production email delivery.
5. Deploy, register a test account, publish a portfolio, and confirm the public
   page and media load in a private browser window.
EOF
echo created