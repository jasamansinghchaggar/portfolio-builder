# Folio — dynamic portfolio builder

Folio is a small portfolio platform built with Next.js. An account owns one
portfolio, writes it in a section-based editor, previews it, and publishes it to
a public address. Draft edits never touch the live page until the owner
publishes. An admin dashboard lists users and portfolios.

## Stack

- Next.js 16 (App Router, Server Actions, `proxy.ts`)
- TypeScript, Tailwind CSS v4, shadcn/ui (Base UI)
- Supabase Auth, Postgres, Row Level Security, and Storage
- `sharp` for server-side image normalisation
- Vitest for the core content/publish logic

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill in the Supabase values, then:
npm run dev
```

Open <http://localhost:3000>.

### Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Supabase publishable (anon) key. Only the public key is used by the app. |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical app origin, no trailing slash. Used for auth redirects, metadata, and share URLs. |
| `NEXT_PUBLIC_APP_NAME` | no | Brand name. Defaults to `Folio`. |
| `NEXT_PUBLIC_PORTFOLIO_URL_MODE` | no | `path` (default) or `subdomain`. |
| `NEXT_PUBLIC_ROOT_DOMAIN` | subdomain mode | Root domain used for portfolio subdomains, e.g. `example.com`. |

> Dashboard and infrastructure steps for local and production are collected in
> [`MANUAL_SETUP.md`](./MANUAL_SETUP.md).

## Supabase setup

1. Create a Supabase project.
2. Apply the SQL migrations in order:
   - `supabase/migrations/20261024000000_initial_schema.sql`
   - `supabase/migrations/20261024000100_publish_separate_snapshot.sql`
   - `supabase/migrations/20261025000000_fix_revision_ambiguity.sql`
3. In **Authentication → URL configuration**, set the Site URL to
   `NEXT_PUBLIC_SITE_URL` and add these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain/auth/callback`

The app handles both Supabase link styles at `/auth/callback`:

- `?code=…` (default PKCE email links), and
- `?token_hash=…&type=…` (custom email templates using `{{ .TokenHash }}`).

If you customise the email templates, point the links at:

```text
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/onboarding
```

Use `type=recovery&next=/reset-password` for the password recovery template.

Email confirmation can be enabled or disabled in Supabase. With confirmation
enabled, registration shows a “check your inbox” state; with it disabled, the
user is signed in and sent straight to onboarding.

### Storage

The migrations create a private `portfolio-media` bucket and its policies.
Files are only readable publicly after an image/CV is referenced by a published
portfolio snapshot (`published_media_ids`). Do not make the bucket public.

### Admin access

Admin is a server-checked role on `public.profiles`. Promote an account once
from the Supabase SQL editor:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

Sign out and back in, then open `/admin`. There is no in-app way to grant admin.

## Public URL modes

### Path mode (default, best for local development)

Set:

```dotenv
NEXT_PUBLIC_PORTFOLIO_URL_MODE=path
```

Published portfolios are served at `/p/<username>`, e.g.
`http://localhost:3000/p/avery-morgan`.

### Subdomain mode (production)

Set:

```dotenv
NEXT_PUBLIC_PORTFOLIO_URL_MODE=subdomain
NEXT_PUBLIC_ROOT_DOMAIN=example.com
NEXT_PUBLIC_SITE_URL=https://example.com
```

Add a wildcard domain (`*.example.com`) to the Vercel project and configure the
DNS record Vercel gives you. `proxy.ts` rewrites a portfolio hostname’s `/` to
`/p/<username>` and redirects app routes back to the root domain. A published
portfolio remains reachable at `/p/<username>` as a fallback.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm test           # Vitest
npm run test:watch # Vitest in watch mode
```

## Project layout

```text
app/                 routes: marketing, auth, onboarding, app shell, public pages
components/editor/   editor shell, section forms, design/media panels
components/portfolio/ public renderer and template CSS
lib/actions/         server actions (auth, portfolio, media)
lib/portfolio/       Zod schemas, defaults, publish rules, templates, media helpers
lib/supabase/        browser/server/proxy clients and database types
supabase/migrations/ database schema, policies, RPCs, storage policies
tests/               unit and render smoke tests
```

## How publishing works

- The editor autosaves the draft through `save_portfolio_draft`, with an
  optimistic revision check. A conflict is surfaced instead of silently
  overwriting another tab’s work.
- Publishing validates visible content, strips hidden sections, records the
  referenced media IDs, and stores a separate immutable published snapshot.
- Public pages read only `get_public_portfolio` / `get_public_media` output.
  They never read `draft_content`.
- Unpublishing clears the public snapshot while keeping the draft.

See `DECISIONS.md` for the reasoning and trade-offs.

## Tests

`npm test` covers:

- username/reserved-name/redirect safety rules,
- Zod content validation (unsafe URLs, duplicate sections, palette values),
- draft/published isolation, media collection, and publish validation,
- renderer smoke tests across all four templates, hidden sections, and escaped
  markup.

The tests do not spin up a database. RLS/RPC behaviour should also be verified
against the Supabase project (see `DECISIONS.md`).

## Deployment checklist

1. Apply all three migrations to the production Supabase project.
2. Add the production `/auth/callback` URL in Supabase.
3. Set all environment variables in Vercel.
4. For subdomain mode, add `*.your-domain` and its DNS record in Vercel.
5. Deploy, register a test account, publish a portfolio, and confirm the public
   page and media load in a private browser window.
6. Optionally run a Supabase security/performance advisor review.
