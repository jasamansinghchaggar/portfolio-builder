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

The template IDs (`atlas`, `signal`, `mono`, `bloom`, `studio`) and the content
model are still separate from presentation, so the PRD requirement to preserve
content across template changes is met.

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

## The app header is fixed; editor chrome is sticky beneath it

The authenticated header is `position: fixed` with a shared
`--app-header-height` variable (mobile includes a second nav row). Standard app
pages reserve that space plus normal top padding. The editor is the exception:
its main element is full-bleed so the toolbar's background and border span the
viewport, while both the app header and the editor toolbar contents are
constrained to `max-w-6xl`. The editor toolbar sticks at
`top: var(--app-header-height)` with a lower z-index than the app header, so it
can never cover it. `AppMain` decides between the padded and full-bleed
variants from the pathname, which avoids duplicating the layout in a route
group.

## The Studio template is the only visible design

The product now targets small businesses and service providers, so the four
portfolio templates were replaced in the UI by one business-first design,
**Studio**. The legacy IDs (`atlas`, `signal`, `mono`, `bloom`) remain valid in
stored JSON so existing drafts are not lost, but:

- `TEMPLATES` exports only Studio, so the editor and marketing pages cannot
  choose a legacy layout.
- `getTemplate()` falls back to Studio for any legacy ID.
- The content schema upgrades every draft to `templateId: "studio"` on read.
- Legacy section types stay valid and render inside the Studio layout, so a
  user who had projects/experience/skills keeps that content.

Keeping the old IDs as input-only aliases avoided a destructive migration while
guaranteeing that no visitor or editor sees the retired designs.

## Typography is tuned for readability

The audience includes middle-aged and older business owners, so the app no
longer uses the previous geometric/editorial pair by default. The UI now uses
Source Sans 3 for body copy at `1.0625rem`/`1.65` and Source Serif 4 for
headings; both are highly legible at normal viewing distance.

Portfolio font pairs were remapped to similarly sturdy families: Modern
(Poppins + Source Sans 3), Editorial (Source Serif 4 + Source Sans 3), Classic
(Merriweather + Lato), and Technical (Libre Franklin + IBM Plex Sans). The
editor describes each pair by its actual fonts instead of the old names.

## Contact enquiries are stored in the database

The public contact form writes to `portfolio_messages` through the
`send_portfolio_message` SECURITY DEFINER function. This was chosen over a
`mailto:` link or an external form service because:

- business owners get an in-app inbox (`/messages`) with read/unread state,
- the platform keeps a record even if an email bounces,
- the anon key never receives table inserts; the function checks the portfolio
  is published, validates contact details, and applies a light rate limit.

Owners read only their own messages through RLS. Admins see every message and
can open the target portfolio.

## The promotion banner is platform-owned and non-dismissible

Every public portfolio renders a fixed `PromoBar` above the site. It rotates
short platform messages and links to the marketing site. It is excluded from
the editor and draft preview so owners are not distracted while working.

The banner exposes `--pf-promo-height`, and the Studio navigation sticks below
it (`top: var(--pf-promo-height)`). The public wrapper reserves the same height,
so the banner never covers the navigation or the top of the page.

## Admins can edit any portfolio, with an audit trail

The admin workspace is no longer read-only. A role-checked route at
`/admin/portfolios/[id]` reuses the owner editor with an `admin` flag. In that
mode:

- saves and publishes call `admin_*` RPCs that check `public.is_admin()`,
- media uploads write into the owner's storage folder and rows,
- preview uses the standalone `/admin-preview/[id]` route (outside the app shell),
- unpublishing is available from the editor toolbar,
- every save/publish/unpublish writes to `admin_audit_log` inside the same
  database function as the change.

No service-role key and no impersonation are used. The owner's session and
password are never touched; the admin acts with their own authenticated session
and the database records their profile and email. The audit log is visible at
`/admin/audit`.

MFA and step-up authentication for admins are intentionally deferred.

## Admins get an admin-only workspace

An admin has no personal portfolio to manage, so the app never shows owner
navigation to one. The header lists only Admin, Messages, and Audit log, and the
brand links to `/admin`. `/dashboard`, `/editor`, and `/onboarding` redirect
admins to `/admin` instead of rendering owner flows. `/settings` still works for
changing a password or name but is intentionally unlinked, so it is reachable
only by typing the URL.

Hiding links is only presentation; every admin route re-checks
`profiles.role` on the server.

Admins also get a sign-out button in the app header, since `/settings` is
unlinked and an admin has no other obvious way back to the public site.

## Portfolio interaction details

A profile image uploaded in page details (`basics.avatarMediaId`) renders as a
circular portrait above the hero heading, so the field has a visible purpose on
the public site. It is skipped when the file is missing or not an image, and it
stays inside the published media set because publishing already collects the
avatar id.

The quick-action row on a Studio site keeps one visual rhythm: every tile is an
icon circle above a label, and Share and Save contact use the same circle,
spacing, and padding as Call, WhatsApp, Email, and Website. Share uses a
dedicated `action` variant so the two contexts (hero header pill and quick
action) can differ without forking the component.

The mobile menu button uses a real menu icon that swaps to a close icon, sized
and centred in a 44px box with no inherited gaps or line-height offsets.

## Known limitations

- Email delivery uses Supabase’s default SMTP until a custom provider is set.
- There is no account deletion flow; Supabase cascade rules are the cleanup
  path if an operator removes a user.
- Admin MFA and step-up authentication are not implemented yet.
- Abuse reports use a temporary `mailto:` address in the public disclaimer.
- Custom domains, multiple portfolios, and drag-and-drop layout are explicitly
  out of scope for the MVP.
