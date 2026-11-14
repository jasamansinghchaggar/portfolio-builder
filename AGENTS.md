<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — MyFolio

MyFolio is a business-first portfolio builder. One account owns one portfolio,
writes it in a section-based editor, previews the draft, and publishes it to a
public URL. Draft edits never touch the live page until the owner publishes.
Public sites use the **Studio** design and include a contact form that delivers
enquiries to an in-app inbox. Admins can inspect and edit any portfolio and all
administrative changes are audited.

This file is the repository-wide orientation. Read it before changing code, then
read the relevant source file and the matching doc in `docs/`.

## Ground rules

- This repo uses **Next.js 16.4 / React 19.3** with App Router. Read the bundled
  Next guides under `node_modules/next/dist/docs/` before using an unfamiliar
  Next API.
- Next 16 async APIs: `params`, `searchParams`, `cookies()`, `headers()`, and
  route-handler context are Promises. Always `await` them.
- Middleware is now `proxy.ts` at the repo root. Do not add `middleware.ts`.
- Prefer Server Components. Add `"use client"` only for state, effects, browser
  APIs, event handlers, or third-party client libraries.
- Server Actions are the write path. They must re-check authentication and
  authorization themselves; route guards and hidden UI are not security
  boundaries.
- Run `npm run typecheck`, `npm run lint`, and `npm test` before finishing. Fix
  failures rather than suppressing them.
- Do not edit already-applied SQL migrations. Add a new timestamped migration.
- When docs and code disagree, code plus `supabase/migrations/` are the source of
  truth; update the stale doc in the same change.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (`eslint-config-next` core-web-vitals + TS) |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest watch mode |
| `npm run format` | Prettier for all TS/TSX |

## Stack

- Next.js 16 App Router, Server Components, Server Actions, `proxy.ts`
- React 19, TypeScript 5 with `strict`
- Tailwind CSS v4 (`app/globals.css`, no JS Tailwind config)
- shadcn/ui **base-mira** on Base UI primitives (`@base-ui/react`), Tabler icons
- Supabase Auth, Postgres, RLS, Storage; `@supabase/ssr` on the server
- `sharp` for image normalisation; Zod 4 for validation; Sonner for toasts
- Vitest 5 + `renderToStaticMarkup` for unit/render smoke tests

## Route map

```text
app/
  layout.tsx                    root metadata, fonts, theme, toaster
  page.tsx                      marketing home
  (auth)/                       login, register, forgot/reset password
  onboarding/                   create the one portfolio
  (app)/                        authenticated app shell
    dashboard/                  portfolio overview, publish state, checklist
    editor/                     autosaving section editor
    settings/                   profile and username
    messages/                   owner/admin enquiry inbox
    admin/                      portfolios, users, banners, admins
    admin/audit/                admin audit log
    admin/portfolios/[id]/      edit any portfolio as an admin
  preview/                      full-page draft preview shell
  preview/frame/                iframe target for responsive draft preview
  admin-preview/[id]/           admin draft preview outside the app shell
  p/[username]/                 public portfolio (path mode)
  p/[username]/opengraph-image  generated social image
  media/[id]/route.ts           gated media streaming
  auth/callback/route.ts        PKCE and token-hash email links
  template-preview/[id]/        template marketing preview
  robots.ts, sitemap.ts         SEO routes
proxy.ts                        session refresh + subdomain routing
```

`app/(app)/layout.tsx` is the fixed-header shell. `components/app/app-main.tsx`
chooses normal padded width or full-bleed editor width from the pathname. The
editor toolbar sticks below `--app-header-height`, never over it.

## Request and auth flow

- `proxy.ts` exports `proxy()` (Next 16 replacement for middleware). It refreshes
  Supabase cookies on every matched request, rewrites a portfolio subdomain's `/`
  to `/p/<username>`, and redirects app routes on subdomains back to the root
  domain.
- `lib/supabase/proxy.ts` owns `updateSession()` and the protected path list:
  `/dashboard`, `/editor`, `/settings`, `/admin`, `/onboarding`, `/preview`.
  Unauthenticated users are redirected to `/login?next=…` with session cookies
  copied onto the redirect.
- `/reset-password` is intentionally **not** protected: it is reached from an
  email link, handles an expired session itself, and would otherwise loop.
- Server code uses `getClaims()`, never `getSession()`. Claims are verified by
  the Supabase client; `proxy.ts` keeps cookies fresh.
- `lib/auth.ts` (server-only) provides `getAuthUserId()`, `getProfile()`, and
  `getMyPortfolio()` wrapped in React `cache()` for per-request deduplication,
  plus `requireUser()`, `requireAdmin()`, and `requirePortfolio()`.
- `must_change_password` redirects to `/reset-password` before any owner/admin
  flow. Admins are redirected away from `/dashboard`, `/editor`, and
  `/onboarding` to `/admin`; `/settings` remains reachable by direct URL but is
  unlinked for admins.
- Redirect helpers must preserve a safe `next` path via
  `resolveSafeNextPath()`. Never redirect to a protocol-relative or external
  path from user input.

## Data access and security

There is **no service-role key in normal runtime paths**. The only privileged
client is `createServiceClient()` in `lib/supabase/server.ts`, used for:

1. creating an administrator from the admin UI when
   `SUPABASE_SERVICE_ROLE_KEY` is configured, and
2. the `/media/[id]` storage fallback when the anon client cannot download a
   public object.

Keep it server-only and never import it into a Client Component.

Clients:

- `lib/supabase/server.ts` — `createClient()` with the user's RLS session;
  `createServiceClient()` bypasses RLS.
- `lib/supabase/public.ts` — cached anon client with `persistSession: false`;
  used only for public RPCs and public storage reads.
- `lib/supabase/database.types.ts` — hand-maintained Supabase types. Keep it in
  sync whenever the schema changes.

Public reads never query `portfolios` or `portfolio_media` directly. They call
narrow `SECURITY DEFINER` RPCs through `lib/portfolio/queries.ts`:

- `get_public_portfolio(p_username)`
- `get_public_media(p_id)`
- `get_public_portfolios()`
- `get_public_settings()`
- `get_public_promo_banners()`

`get_public_portfolio` returns only a published, non-disabled portfolio and
validates content with `portfolioContentSchema.safeParse()` before rendering.
Public pages are `force-dynamic` / `revalidate = 0` so a draft/publish transition
cannot leak through a stale cache.

## Content model

`lib/portfolio/schemas.ts` is the canonical content contract; everything else is
derived from it.

- `PortfolioContent` has `version: 2`, `templateId`, `basics`, `design`,
  `sections`, and optional per-usage `mediaCrops`.
- Version 1 drafts and legacy template IDs are upgraded transparently on parse.
  Legacy IDs (`atlas`, `signal`, `mono`, `bloom`) remain valid input but always
  become `studio`. Only Studio is exposed in the UI.
- `basics` (Page details) is the single source for business name, owner, role,
  headline, tagline, location, address, phone, WhatsApp, email, avatar, hero
  image, and logo. Hero and contact editors show a summary plus an “Edit page
  details” link instead of duplicating fields. Legacy hero/contact fields remain
  only for old drafts.
- `sections` is a discriminated union of 20 section types. Each type may appear
  at most once, section IDs must be unique, and each section has `visible`.
- `lib/portfolio/defaults.ts` creates sections/items and coerces stored JSON.
  `lib/portfolio/sections.ts` owns visibility, substance checks, navigation,
  contact helpers, phone/WhatsApp normalisation, and labels.
- `lib/portfolio/validation.ts` provides small Zod schemas for on-blur editor
  validation. It is non-blocking for autosave; the full content schema is the
  server-side gate.
- `lib/portfolio/constants.ts` owns type lists, labels, descriptions, design
  options, and the default section set.

URL rules: `lib/config.ts` owns `RESERVED_USERNAMES`, the username pattern,
normalisation, public URL construction, and `isSubdomainHost()`. A username is
3–30 lowercase letters/numbers/single hyphens, cannot start/end with a hyphen,
cannot contain `--`, and cannot be reserved.

## Draft, publish, and revisions

- One portfolio per account (`portfolios.user_id` is unique). Creation goes
  through `create_portfolio`; never insert the row directly.
- `draft_content` is the only content the editor mutates. `published_content` is
  an immutable snapshot produced at publish time. Public routes read the
  snapshot only.
- `revision` is optimistic concurrency. Every save/publish/unpublish sends the
  revision it read; the RPC only writes if it still matches and otherwise
  raises `revision_conflict`. The editor surfaces a conflict instead of
  overwriting another session.
- Publishing:
  1. validates visible content with `validateForPublish()`,
  2. strips hidden sections in `buildPublishedContent()`,
  3. collects `published_media_ids` from visible sections and `basics`,
  4. calls `publish_portfolio` with draft, snapshot, media IDs, and revision.
- `unpublish_portfolio` clears the public snapshot while keeping the draft.
- Sensitive writes are `SECURITY DEFINER` RPCs with `set search_path = ''`,
  ownership checks via `auth.uid()`, stable exception messages, and revoked
  direct table writes. Keep new RPCs consistent with that pattern.
- The editor autosaves after a debounce. It flushes pending saves before in-app
  navigation, warns on `beforeunload`, and makes a best-effort save on unmount.
  Do not add a second save path that bypasses revision checks.
- Preview uses `/preview/frame` in an iframe (and `/admin-preview/[id]` for
  admins) so media queries and mobile widths behave like the public page.

## Media

- Bucket `portfolio-media` is **private**. Never make it public.
- Uploads go through `prepareUpload()` in `lib/portfolio/upload.ts`: max 5 MB,
  JPEG/PNG/WebP/PDF only, images re-encoded to WebP (max 1600×1600, quality 80),
  PDFs signature-checked, filenames sanitised for display only.
- Owner storage path: `<user_id>/<portfolio_id>/<uuid>.<ext>`. Admin uploads
  write into the target owner's folder and rows.
- Media rows keep `focal_x`/`focal_y` plus optional per-usage crops in
  `mediaCrops`. Use `lib/portfolio/media.ts` helpers rather than raw numbers.
- Files are served only through `/media/[id]`. It allows public reads only when
  the portfolio is published, not disabled, and the ID is in
  `published_media_ids`; otherwise it requires owner/admin auth. Public responses
  get long-lived cache headers, private responses `no-store`.
- Deleting media is refused while the ID appears in the draft, the published
  snapshot, or `published_media_ids`. Remove it from content and save first.
- `next.config.ts` allows a 6 MB Server Action body, covering the 5 MB file plus
  multipart overhead.

## Admin

- Admin is a server-checked role on `profiles.role`. Promotion is manual SQL, or
  the `/admin` → Admins tab when a service-role key is configured. There is no
  self-service elevation.
- Admin portfolio edits reuse `components/editor/editor.tsx` with `admin` set,
  which swaps in `admin_*` server actions. Saves/publishes call
  `admin_save_portfolio_draft`, `admin_publish_portfolio`, and
  `admin_unpublish_portfolio`.
- Every admin mutation writes `admin_audit_log` inside the same database
  function, with actor profile/email. The log is visible at `/admin/audit`.
- `portfolios.is_disabled` is an access gate independent of `status`; disabled
  portfolios behave as not found everywhere public while keeping their data.
- `portfolios.promo_bar_enabled` controls the fixed promo bar per portfolio.
  Global messages live in `promo_banners` and are edited at `/admin/banners`;
  active messages are exposed only through `get_public_promo_banners()`, with
  built-in fallbacks when none exist.
- `platform_settings.show_attribution` and per-portfolio `show_attribution`
  control the public attribution line.
- Toggle RPCs (`admin_set_portfolio_enabled`,
  `admin_set_portfolio_promo_bar`, `admin_set_portfolio_attribution`) do not bump
  `revision`, so an open editor is not forced into a conflict.
- Admin MFA/step-up auth is not implemented. Do not claim it is.

## UI and styling

- Tailwind v4 with design tokens in `app/globals.css` (`--background`,
  `--foreground`, `--primary`, `--muted`, etc.). Use tokens (`bg-muted`,
  `text-muted-foreground`, `border-border`) instead of raw colours.
- Add UI primitives to `components/ui` using the existing **base-mira / Base UI**
  style. Do not introduce Radix-based components or a second visual system.
- App code imports `cn` from `@/lib/utils`; generated `components/ui` files may
  import `cn` directly from the `cn` package (`lib/utils.ts` re-exports it).
- Use Tabler icons (`@tabler/icons-react`). Keep icon sizing via the existing
  `size-*` classes.
- Feature components live in `components/<feature>/` and are kebab-case. Route
  files stay thin: fetch/guard on the server, pass data to a client component.
- The product UI uses Source Sans 3 for body and Source Serif 4 for headings;
  Portfolio font pairs are configured in `app/layout.tsx` and `globals.css`.
- The audience skews older and business-first. Prefer plain, reassuring copy over
  developer jargon. Keep touch targets and type sizes generous.
- `AppHeader` is fixed and the editor toolbar sticky. Use the existing
  `--app-header-height` / `--editor-header-height` variables; do not hardcode
  header offsets in pages.
- No arbitrary user HTML. Content is typed JSON rendered as React text/props.
  URLs are restricted to `http:`, `https:`, `mailto:`, `tel:`, or `#anchors`.

## Database and migrations

- `supabase/migrations/` is applied in filename order. Read
  `docs/SETUP.md` for local/production setup. Never rewrite an applied
  migration; add a new timestamped one.
- Core tables: `profiles`, `portfolios`, `portfolio_media`,
  `portfolio_messages`, `admin_audit_log`, `promo_banners`,
  `platform_settings`, `reserved_usernames`.
- Enums: `app_role` (`user`, `admin`), `portfolio_status` (`draft`, `published`,
  `unpublished`), `media_kind` (`avatar`, `project`, `resume`, `general`).
- RLS is enabled. Owners read their own rows; admins use role-checked policies;
  public visitors use the public RPCs only.
- Write functions must remain `SECURITY DEFINER`, set `search_path = ''`, use
  fully-qualified objects, validate JSON size/shape, check `auth.uid()` and
  ownership, and `raise exception` with the stable messages the app maps:
  `not_authenticated`, `portfolio_not_found`, `revision_conflict`,
  `invalid_content`, `invalid_media`, `username_unavailable`/`username_taken`,
  `not_admin`, `rate_limited`.
- `revoke` direct table/function access from `anon`/`authenticated` and grant
  only the intended RPCs. Keep the public surface narrow.
- After schema changes, update `lib/supabase/database.types.ts`, the server
  actions, and any affected docs/tests.

## Validation and error handling

- Validate every external input with Zod. Server-side validation is the gate;
  client-side validation is UX only.
- Server Actions return discriminated unions (`{ ok: true, ... }` or
  `{ ok: false, error }`) or the `ActionState` shape in
  `lib/actions/state.ts`. Do not throw for expected user errors.
- Map database error messages to human copy in the action module. Never expose
  raw SQL, keys, or stack traces to the browser.
- Auth actions use `redirect()`; do not wrap redirects in `try/catch` that
  swallows the redirect error.
- After a mutation, call `revalidatePath()` for every affected surface
  (dashboard, editor, public page, admin, preview as applicable).
- Media and content returned to the client must be serialisable and free of
  secrets.

## Conventions

- Formatting is Prettier: no semicolons, double quotes, 2 spaces, 80 columns,
  LF, Tailwind class sorting via `prettier-plugin-tailwindcss`. Do not hand-fight
  formatting.
- File names are kebab-case; React components are PascalCase exports; functions
  and variables are camelCase; types are PascalCase; database names are
  snake_case.
- Use the `@/*` alias for cross-directory imports. Keep `lib/` framework-free
  where possible; server-only modules start with `import "server-only"`.
- Keep route files thin. Put reusable logic in `lib/portfolio`, `lib/actions`, or
  `lib/supabase`; put feature UI in `components/<feature>`.
- Comments explain **why** a non-obvious choice exists, not what the line does.
  Architectural rationale belongs in `docs/DECISIONS.md`.
- `docs/SECTIONS.md` documents every content section and field. Update it when a
  section or field changes. `docs/PRD.md` is product intent; `docs/SETUP.md` is
  operator setup. Keep all three consistent with code.
- Available repo skills: `shadcn` for UI/component work, `supabase` and
  `supabase-postgres-best-practices` for database/RLS/migration work. Load them
  when the task matches.

## Environment

Copy `.env.example` to `.env.local`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Publishable (anon) key; the only key used by normal app paths |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Server-only; admin creation and public-media fallback |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical origin, no trailing slash |
| `NEXT_PUBLIC_APP_NAME` | no | Brand name, defaults to `MyFolio` |
| `NEXT_PUBLIC_PORTFOLIO_URL_MODE` | no | `path` (default) or `subdomain` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | subdomain mode | Root domain for portfolio subdomains |

`NEXT_PUBLIC_*` values are inlined into the client bundle. Never put a secret in
one. `SUPABASE_SERVICE_ROLE_KEY` must never reach a Client Component.

Public URL modes:

- `path`: `<SITE_URL>/p/<username>` (default, best for local development).
- `subdomain`: `<username>.<ROOT_DOMAIN>`, with `/p/<username>` still working.
  Requires a wildcard domain/DNS record; `proxy.ts` handles the rewrite.

## Tests

- `vitest.config.ts` uses the `node` environment and `@` alias; tests live in
  `tests/**/*.test.{ts,tsx}`.
- Cover pure logic: schemas, username rules, publish snapshot/validation, media
  collection, section helpers, config, auth-error mapping.
- `tests/render.test.tsx` uses `renderToStaticMarkup` and mocks `next/image` for
  renderer smoke tests (Studio design, hidden sections, escaped markup).
- Tests do not spin up a database. RLS/RPC behaviour must be verified against a
  Supabase project; add automated coverage before expanding the security surface.
- Add or update tests with every behaviour change in `lib/portfolio` or
  `lib/config`.

## Known limitations / out of scope

- No account-deletion flow; Supabase cascades are the cleanup path.
- No admin MFA or step-up authentication.
- No custom domains, multiple portfolios per account, or drag-and-drop layout.
- Abuse reports use a temporary `mailto:` address in the public disclaimer.
- Auth email is delivered by Resend over Supabase custom SMTP; the built-in
  provider is not used in production. See `docs/SETUP.md` and
  `docs/DECISIONS.md`.