# Product and Technical Decisions

This file records agreed decisions and important decisions that must
remain consistent across product documents and implementation. Update it
when a decision is accepted, superseded, or revisited.

**Last updated:** 17 October 2026

## DEC-001 --- Portfolio creation approach

**Status:** Accepted for MVP

**Decision:** Combine template-based creation with section-based
customisation.

**Details:** - Users choose from predefined templates. - Users add,
edit, remove, reorder, and hide supported sections. - Users can
customise a defined set of design properties. - The MVP will not include
a free-form visual canvas.

**Reason:** Provides meaningful flexibility while keeping implementation
and editing experience manageable.

**Consequences:** Portfolio content must be independent of
template-specific presentation.

## DEC-002 --- Target audience

**Status:** Accepted

**Decision:** Support individuals and organisation-branded portfolios.

**MVP limitation:** One account manages one portfolio. Multi-member
organisation workspaces are out of scope.

**Reason:** The product should be generally useful without requiring
team collaboration infrastructure.

## DEC-003 --- Portfolio count per account

**Status:** Accepted

**Decision:** One portfolio per account in the MVP.

**Future consideration:** Multiple portfolios may be considered later.

## DEC-004 --- Draft and published content

**Status:** Accepted

**Decision:** Editing and publishing are separate operations. Draft
changes must not silently change the currently published portfolio.
Users explicitly publish changes and can unpublish their portfolio.

**Reason:** Lets users prepare and review changes before they affect the
public site.

## DEC-005 --- Public URL model

**Status:** Accepted

**Decision:** Use a slug path under the platform's main domain for each
published portfolio, for example `forme.site/username`.

**Technical direction:** Resolve the slug through the public
`/[slug]` route and read only the published document.

**Follow-up:** Subdomain URLs and custom domains remain future scope.

## DEC-006 --- Custom domains

**Status:** Deferred

**Decision:** Users connecting their own domains, such as
`portfolio.example.org`, are outside the MVP.

## DEC-007 --- Technology stack

**Status:** Accepted as the planning baseline

**Decision:** - Next.js - TypeScript - Tailwind CSS - shadcn/ui -
PostgreSQL - Supabase Auth - Supabase Storage - Next.js server-side code
and Route Handlers - Zod - React Hook Form - Vercel hosting, subject to
validation of the required subdomain setup and plan limitations

**Follow-up:** Confirm configuration and cost before deployment.

## DEC-008 --- Admin dashboard scope

**Status:** Accepted

**Decision:** The initial admin dashboard will provide basic overview
metrics and user/portfolio listings with search or basic filtering.

**Explicit exclusions:** - Moderation and abuse reporting - Platform
settings and audit logs

**Security note:** These exclusions do not remove the need for secure
admin authentication and server-side authorisation.

## DEC-009 --- Database schema

**Status:** Open / not finalised

**Decision:** Do not finalise tables, relationships, or section-content
storage until the database-design stage in the agreed document sequence.

**Implementation update (18 October 2026):** The MVP implementation uses
one `profiles` row per auth user and one `portfolios` row per owner. Draft
content and published content are separate JSON documents on the portfolio
row, with row-level security for owners and a published-only public read
policy. This is the smallest schema that preserves the required privacy
boundary and can be normalised later without changing the public contract.

## DEC-010 --- Folder structure

**Status:** Open / not finalised

**Decision:** Refine the project structure during technical planning. Do
not add dedicated MVP modules for moderation/reporting or platform
settings/audit logs.

## DEC-011 --- Documentation order

**Status:** Accepted

**Decision:** Follow this sequence strictly: 1. Product scope 2. PRD 3.
User flows and information architecture 4. UI/UX design 5. Database
schema and technical architecture 6. Implementation plan 7. Testing and
deployment

**Reason:** Each stage should build on the decisions and outputs from
the previous stage.

## DEC-012 --- Maintain this decision record

**Status:** Accepted

**Decision:** Keep this `DECISIONS.md` file in the project repository
and update it as decisions are made or changed.

## DEC-013 --- MVP exclusions

**Status:** Accepted

The following are outside the MVP: - Free-form drag-and-drop canvas -
Multiple portfolios per account - Multi-user organisation
collaboration - Custom domains - Payments and subscriptions -
AI-generated portfolios/content - Advanced analytics - Moderation and
abuse reporting - Platform settings and audit logs - Full version
history and complex approval workflows
