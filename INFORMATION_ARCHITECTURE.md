# Information Architecture

**Status:** Stage 3 — information-architecture baseline  
**Related documents:** [USER_FLOWS.md](USER_FLOWS.md), [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md), [PRD.md](PRD.md), [DECISIONS.md](DECISIONS.md)

The structure below reflects the MVP boundaries and the routes present in the current application. It does not finalise the database schema or hosting design.

## Application areas

```text
Public
├── Landing page (/)
├── Published portfolio (/{slug}; current canonical renderer: /p/{slug})
└── Not found / unavailable portfolio

Authentication
├── Sign up / sign in (/auth)
├── Authentication callback (/auth/callback)
└── Password reset (/auth/reset)

Portfolio owner (authenticated)
├── Dashboard and editor (/dashboard)
│   ├── Portfolio overview and publication status
│   ├── Section editor
│   ├── Template and supported appearance controls
│   ├── Desktop/mobile preview
│   └── Save, publish, and unpublish actions
└── Profile settings (within the dashboard)

Administrator (authenticated and server-authorised)
└── Admin overview (/admin)
    ├── Summary metrics
    ├── Portfolio list and status filter/search
    └── User list
```

## Navigation and access rules

| Area | Entry | Access | Main destinations/actions |
|---|---|---|---|
| Public landing | `/` | Anyone | Sign in or sign up; product overview |
| Public portfolio | `/{slug}` | Anyone; published content only | View visible sections and portfolio links |
| Authentication | `/auth` | Anyone | Sign in, sign up, request password reset |
| Password reset | `/auth/reset` | Valid reset session | Set a new password; return to sign in |
| Owner dashboard | `/dashboard` | Signed-in owner | Edit own profile and one portfolio; preview and manage publication |
| Admin dashboard | `/admin` | Signed-in administrator, server check required | View and filter basic user and portfolio records |

The current public route `/{slug}` delegates rendering to `/p/{slug}`. Public pages resolve by slug and load the published document. The accepted MVP URL model is a path under the platform domain. Subdomain and custom-domain routing are future work unless changed in `DECISIONS.md`.

## Dashboard content hierarchy

```text
Dashboard
├── Account/profile details
├── Portfolio status and public URL (if published)
├── Editor
│   ├── Portfolio identity and slug
│   ├── Ordered sections
│   │   ├── Section title and type
│   │   ├── Content fields and optional media
│   │   └── Visibility, reorder, and remove controls
│   ├── Template selection
│   ├── Accent/style controls
│   └── Preview mode (desktop or mobile)
└── Save draft / Publish / Unpublish / Sign out
```

Sections remain structured content independent of the selected template. The current section catalog and supported fields are defined in application code and may evolve during UI/UX design.

## Admin content hierarchy

```text
Admin overview
├── Counts: users, portfolios, published portfolios, drafts
├── Portfolios
│   ├── Name and slug
│   ├── Owner
│   ├── Publication status and URL
│   └── Search and status filter
└── Users
    ├── Display name and account identifier
    ├── Portfolio association
    └── Created date
```

Admin access must continue to be enforced server-side. The MVP does not include moderation/reporting, platform settings, audit logs, or advanced role management.

## Route and API inventory (current code)

| Route | Purpose |
|---|---|
| `/` | Product landing page |
| `/auth`, `/auth/callback`, `/auth/reset` | Authentication and recovery |
| `/dashboard` | Owner dashboard and editor |
| `/admin` | Basic admin overview and lists |
| `/{slug}` and `/p/{slug}` | Published portfolio rendering |
| `GET/PUT /api/profile` | Read and update the signed-in user's profile |
| `GET/PUT /api/portfolio` | Read and save the signed-in user's portfolio draft |
| `POST /api/portfolio/publish` | Publish the saved draft |
| `POST /api/portfolio/unpublish` | Remove public availability |
| `POST /api/portfolio/media` | Upload portfolio media |

## Out of scope for this structure

- Multiple portfolios per account or collaborative organisation workspaces.
- Free-form page canvas, custom domains, billing, or advanced analytics.
- Moderation, abuse reporting, platform settings, and audit-log screens.
- Final database entities, relationships, or storage representation; those belong to the later database and architecture stage.
