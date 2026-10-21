# Implementation Plan

**Status:** Stage 6 — planning baseline  
**Related documents:** [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md), [PRD.md](PRD.md), [USER_FLOWS.md](USER_FLOWS.md), [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md), [DECISIONS.md](DECISIONS.md)

This plan distinguishes capabilities visible in the repository from work still required for a complete MVP. The current code is an implementation baseline, not evidence that every acceptance criterion has been tested or is deployment-ready.

## Current implementation snapshot

Observed in the repository at the time this plan was prepared:

- **Implemented:** Next.js/TypeScript application; landing page; Supabase authentication helpers and auth/reset/callback routes; protected owner dashboard; profile and single-portfolio draft APIs; schema validation; section editing, ordering, visibility, template/accent selection, preview, media upload, explicit publish/unpublish; published-only public rendering by slug; basic admin dashboard with server-side admin check; Supabase migrations and focused schema/migration tests.
- **Partially implemented / needs acceptance review:** onboarding completeness, error and recovery states, public-media URL lifetime, admin search/filter correctness at scale, slug reservation/collision handling, accessibility and responsive behaviour, and cross-flow security boundaries.
- **Not established as complete:** production deployment and environment setup; final domain/hosting decision; comprehensive automated and browser testing; monitoring, backup, recovery, privacy/retention operations, and release readiness.

This snapshot is based on source inspection. It does not claim that the application was built, deployed, or verified end to end.

## Milestones

### M0 — Confirm planning inputs

- [x] Product scope and MVP exclusions recorded in `PRODUCT_SCOPE.md` and `DECISIONS.md`.
- [x] Initial functional requirements recorded in `PRD.md`.
- [x] User journeys and application structure documented in Stage 3 documents.
- [ ] Complete the UI/UX design stage and confirm screen states and responsive behaviour.
- [ ] Complete the database schema and technical architecture stage before treating current schema or hosting choices as final.

**Exit criteria:** Product decisions, screens, data contracts, and technical constraints are reviewed and consistent.

### M1 — Authentication, account, and access control

- [x] Supabase auth entry, callback, reset, session helpers, and protected dashboard route exist.
- [x] Profile read/update operations are scoped to the signed-in user.
- [ ] Verify sign-up, verification, sign-in/out, password recovery, expired sessions, and error recovery against the configured Supabase project.
- [ ] Review server-side authorisation and row-level security for owner, admin, and public access.
- [ ] Confirm profile completion and account deletion/retention requirements.

**Exit criteria:** Authentication and authorisation scenarios pass against a configured environment; users cannot access another owner's data.

### M2 — Portfolio draft and editor

- [x] One-portfolio-per-owner draft API, Zod validation, section catalog, templates, appearance controls, preview, and media upload exist.
- [ ] Confirm all PRD section types and fields, including individual and organisation-branded use cases.
- [ ] Verify add/edit/remove/reorder/show/hide behaviour and validation for invalid or incomplete content.
- [ ] Decide and implement the final save/autosave behaviour, unsaved-change handling, and network-failure recovery.
- [ ] Review slug rules, reserved slugs, collisions, and user-facing edits.
- [ ] Complete UI/UX review for keyboard access, screen readers, mobile layouts, and empty/loading/error states.

**Exit criteria:** An owner can produce and recover a valid draft without exposing it publicly.

### M3 — Preview, publishing, and public pages

- [x] Separate draft and published JSON documents; explicit publish/unpublish endpoints; slug-based published-page route exist.
- [ ] Verify a draft edit never changes the public snapshot before republishing.
- [ ] Verify unpublished and unknown slugs return no portfolio content.
- [ ] Confirm media access remains valid and appropriately protected for published pages.
- [ ] Validate metadata, external links, responsive presentation, and all supported templates.
- [ ] Decide whether the existing path-based URL is retained; do not implement subdomains until the technical architecture confirms DNS, host, and HTTPS support.

**Exit criteria:** Public visitors see only the intended published snapshot, reliably and responsively.

### M4 — Administrator visibility

- [x] Basic metrics, user/portfolio lists, search/status controls, and server-side admin check exist.
- [ ] Verify non-admin denial and ensure privileged service credentials are used only server-side.
- [ ] Validate list completeness, filtering semantics, privacy, pagination/limits, and error states.
- [ ] Keep moderation/reporting, platform settings, audit logs, and billing excluded from MVP unless decisions change.

**Exit criteria:** An authorised administrator can find the intended records without exposing privileged access or excessive personal data.

### M5 — Verification, deployment, and release

- [x] Focused schema and migration tests exist in the repository.
- [ ] Add/complete unit, API, integration, and end-to-end coverage for the acceptance criteria in `PRODUCT_SCOPE.md` and `PRD.md`.
- [ ] Run formatting, lint, type checking, production build, migrations, and relevant tests in a reproducible environment.
- [ ] Test privacy boundaries: owner isolation, admin checks, draft invisibility, slug collision, and unpublish behaviour.
- [ ] Configure secrets, Supabase project, storage policies, deployment, domain/DNS, HTTPS, and environment-specific redirects.
- [ ] Confirm hosting cost/limits and whether wildcard subdomains are supported before selecting the final URL model.
- [ ] Document operational checks, backups/recovery, rollback, data retention, and support ownership.
- [ ] Perform release review against all MVP success criteria and record unresolved limitations.

**Exit criteria:** Required tests pass, the production configuration is documented, and each MVP success criterion has a verification result.

## Dependency order

1. Finish UI/UX decisions and resolve open product questions that affect screens or flows.
2. Complete database schema and technical architecture, including the public URL and hosting approach.
3. Close editor, security, and public-publishing acceptance gaps.
4. Complete admin review and cross-flow verification.
5. Configure deployment and operational readiness; release only after acceptance criteria are evidenced.

## Definition of done

A milestone is complete only when its acceptance criteria are implemented, reviewed, and verified in the intended environment. A checked item above records code observed in the repository; it is not a substitute for test evidence. Update this plan and `DECISIONS.md` when scope or accepted decisions change.
