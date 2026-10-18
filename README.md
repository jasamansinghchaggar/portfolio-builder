# Forme

Forme is a template-based portfolio builder with Supabase-backed authentication, ownership-protected draft/published portfolios, a section editor, responsive previews, and published slug-based pages.

## Getting started

Use Node.js 20.9 or newer and npm:

```sh
npm install
npm run dev
```

Run both Supabase migrations in order: `supabase/migrations/202610180001_portfolios.sql` followed by `supabase/migrations/202610180002_profiles_media.sql`, then open `/auth` to register. If users existed before the migrations were applied, sign them out and back in once so their profile row is available. The protected editor is available at `/dashboard`; `/admin` is restricted by the `profiles.is_admin` flag.

## Supabase

Copy `.env.example` to `.env.local` and provide the Supabase project URL, publishable key, and site URL. Set `SUPABASE_SERVICE_ROLE_KEY` only in server deployment secrets for the admin overview and signed media URLs; never expose it to the browser. Supabase email confirmation and password recovery are used by `/auth`. The database migration enables RLS for owner access and published-only public reads.

## Deployment

Use a Vercel project with an apex domain and HTTPS enabled. Set `NEXT_PUBLIC_SITE_URL=https://forme.site`. Published portfolios are currently available at `https://forme.site/{slug}` and resolve through the published-only renderer without exposing drafts. Custom domains and subdomain URLs are future scope.

Supabase Storage is used for MVP media uploads through a private bucket with owner policies and signed download URLs.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS 4, shadcn/ui configuration, Supabase SSR client, Zod, and Lucide icons. Dependency ranges are set to current stable releases as of October 2026.
