# Decisions

A running log of product and technical decisions for the MVP. Each entry records
the choice and why it was made.

## Templates are React components, not EJS

The PRD suggested prebuilt HTML templates rendered with EJS. The implementation
uses React/Next components and a shared CSS design system instead.

Why:

- The public page and the in-editor draft preview must render the same markup.
  Sharing React components guarantees that.
- Template switching, responsive behaviour, metadata, and media optimisation are
  easier to keep correct in one component tree.
- EJS would add a second rendering runtime and make preview/public drift more
  likely.

The template IDs (`atlas`, `signal`, `mono`, `bloom`) and the content model are
still separate from presentation, so the PRD requirement to preserve content
across template changes is met.

## One portfolio per account

`portfolios.user_id` is unique, and creation goes through the
`create_portfolio` RPC. The RPC verifies ownership through `auth.uid()` and also
rejects a second portfolio server-side. The unique constraint is the final
guard against races.

## Drafts and published snapshots are separate columns

`draft_content` is the only content the editor mutates. `published_content` is a
snapshot produced at publish time; public reads use it exclusively. Hidden
sections are removed from the snapshot rather than merely hidden by the
renderer, so private content is never sent to visitors.

Publishing also stores `published_media_ids`. Media files stay private in
Storage and are only served publicly when their ID is in that list for a
currently published portfolio. This keeps a draft image private until the
section using it is published.

## Sensitive writes use SECURITY DEFINER RPCs

Portfolio creation, draft saves, username changes, publish, and unpublish are
Postgres functions. Each checks `auth.uid()` against the portfolio owner and
uses the supplied revision for optimistic concurrency. Direct table writes are
revoked from clients.

Why: RLS can restrict rows but cannot easily enforce revision checks and the
“publish only what was saved” rule atomically. Keeping the invariants in the
database avoids a client bypassing server actions.

Reads still use RLS: owners can read their own portfolio/media rows; public
visitors cannot read tables directly and must go through the public RPCs.

## No service-role key in the app

There is no privileged Supabase key in the runtime environment. Anonymous
public pages call narrowly scoped SECURITY DEFINER functions:
`get_public_portfolio`, `get_public_portfolios`, and `get_public_media`. Admin
data is read through normal authenticated RLS and an explicit server-side role
check.

## Auth uses `getClaims()` on the server

Next.js server components and actions use `supabase.auth.getClaims()` rather
than `getSession()`. Claims are validated by the Supabase client and the proxy
refreshes cookies, so route guards do not trust an unverified client session.

`proxy.ts` (Next 16’s replacement for middleware) refreshes sessions for all
app routes and protects `/dashboard`, `/editor`, `/settings`, `/admin`,
`/onboarding`, and `/preview`. `/reset-password` is intentionally excluded: it is
reached from an email link, handles a missing/expired session itself, and would
otherwise redirect-loop.

## Public URL modes

Portfolio URLs are configurable because subdomains need DNS and wildcard-domain
setup that local development does not have.

- `path` (default): `SITE_URL/p/<username>`.
- `subdomain`: `<username>.ROOT_DOMAIN`, with `/p/<username>` still working.

`proxy.ts` rewrites only `/` on a portfolio hostname and redirects app routes to
the root domain. `/media` stays available on both hosts.

## Template and design settings live in the content snapshot

`templateId` and `design` are part of `PortfolioContent`. That makes template
switching a draft edit like any other, so it cannot change the live page until
the owner publishes.

## Preview uses a dedicated iframe route

The editor preview is an iframe pointing at `/preview/frame`, with `/preview` as
a full-page shell. The iframe gets a real viewport, so the public CSS media
queries respond correctly when previewing mobile width. The frame reads the
saved draft; preview first flushes pending saves.

## Autosave with visible conflict handling

Edits autosave after a short debounce. Each save sends the current revision; the
RPC only writes if the revision matches. On conflict the editor stops
autosaving and offers “Load latest” or “Keep mine” rather than overwriting
another session. A save-status indicator and retry path cover network failures.
In-app link clicks flush pending edits before navigating, `beforeunload` warns
on tab close, and unmount triggers a best-effort save for back/forward moves.

## Media is normalised server-side

Images are validated and re-encoded to WebP with `sharp` (max 5 MB input,
limited dimensions). PDFs are checked by signature before being stored. Files
are served through `/media/[id]`, which checks the published-media rule and
streams from the private bucket. User-provided filenames are only display
metadata, never paths.

## Public pages are dynamic and non-cacheable

Portfolio HTML is rendered per request with `no-store`. This avoids leaking a
draft/published transition through a stale cache, at the cost of some latency.
The data-access helpers use React `cache()` for per-request deduplication only.

## No arbitrary user HTML

All content is stored as typed JSON and rendered as React text/props. URLs are
restricted to `http:`, `https:`, `mailto:`, or in-page `#anchors`. There is no
raw HTML field, which removes the need for a sanitiser on the public page.

## Admin role is manual

The MVP has no user-management UI. An operator promotes accounts with one SQL
statement against `profiles.role`. The `/admin` page re-checks the role on the
server and renders `notFound()` for non-admins, so hiding a link is not the
security boundary.

## Tests focus on pure logic plus renderer smoke tests

Vitest covers the pieces most likely to regress without a browser: schemas,
username rules, publish snapshot/sanitisation, media collection, and SSR output
for every template. Database RLS/RPC tests are not automated in this MVP; they
are verified manually against the Supabase project and should be added before
the platform grows beyond a single-owner portfolio.

## Known limitations

- Email delivery uses Supabase’s default SMTP until a custom provider is set.
- There is no account deletion flow; Supabase cascade rules are the cleanup
  path if an operator removes a user.
- Admin access is read-only by design.
- Custom domains, multiple portfolios, and drag-and-drop layout are explicitly
  out of scope for the MVP.
