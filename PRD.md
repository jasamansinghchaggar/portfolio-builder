# Product Requirements Document (PRD) --- Dynamic Portfolio Builder

**Document version:** 0.1\
**Status:** Initial draft based on the agreed product scope\
**Project type:** Internal project\
**Last updated:** 17 October 2026

## 1. Purpose

This document defines the initial product requirements for a web
platform where individuals can create, customise, and
publish portfolio websites. It defines the MVP user experience, feature
requirements, and acceptance criteria. Detailed user flows, information
architecture, UI/UX, database schema, and technical architecture will be
produced in the following stages.

## 2. Product summary

Users sign in to a central platform, create one portfolio, select a template, manage predefined sections, customise supported design settings, preview changes, and publish the result to a unique URL of the platform's main domain.

Administrators use a separate, simple dashboard to view registered users and portfolio status.

## 3. Goals

- Make portfolio creation possible without coding.
- Provide meaningful customisation through templates and sections.
- Let users preview changes before publishing.
- Serve published portfolios at stable, shareable subdomain URLs.
- Keep the user and admin experiences straightforward.
- Enforce ownership and privacy boundaries.

## 4. Non-goals

The MVP will not include: - A free-form drag-and-drop website canvas - Multiple portfolios per account - Custom domains - Payments, subscriptions, or billing - AI portfolio generation - Advanced analytics - Moderation or abuse reporting - Platform settings or audit logs - Full version history or complex approval workflows

## 5. Personas

### Persona A: Individual portfolio owner

Wants to present skills, projects, experience, education, and contact information in a professional public page.

### Persona B: Administrator

Needs a simple overview of platform usage and the ability to find users and portfolios, inspect their statuses, and access relevant records.

### Persona C: Public visitor

Wants to open a portfolio link, view its published content on desktop or mobile, and follow relevant project or contact links.

## 6. Core concepts and states

### Portfolio states

- **Draft:** Editable content not currently exposed as a public portfolio.
- **Published:** A published version is available at the assigned public URL.
- **Unpublished:** The portfolio is not currently publicly accessible. A previously published portfolio may retain saved content for later republishing.

The implementation must define the exact transition rules. Editing a published portfolio must not silently overwrite the currently live version before the user publishes the changes.

### Account and portfolio limits

- One portfolio per account in the MVP.
- One account manages each portfolio.

## 7. Functional requirements

Priority definitions: **P0** = required for MVP; **P1** = important if time allows; **Future** = explicitly deferred.

### 7.1 Authentication and onboarding

**FR-AUTH-01 --- Registration (P0)**\
The system shall allow a user to create an account using the selected authentication method.

**FR-AUTH-02 --- Login and logout (P0)**\
The system shall allow a registered user to sign in and securely sign out.

**FR-AUTH-03 --- Session protection (P0)**\
The system shall protect dashboard routes and reject unauthenticated requests to protected operations.

**FR-AUTH-04 --- Profile setup (P0)**\
The system shall collect the minimum information required to create a portfolio and account profile while on-boarding.

**FR-AUTH-05 --- Password recovery and verification (P0 where supported by the chosen authentication flow)**\
The system shall provide appropriate account recovery and email verification capabilities through the selected authentication setup.

### 7.2 Portfolio creation

**FR-PORT-01 --- Create portfolio (P0)**\
An authenticated user shall be able to create one portfolio associated with their account.

**FR-PORT-02 --- Select template (P0)**\
The user shall be able to select an available template (the tmeplates will be prebuild html templates, use ejs for this). The initial release should target approximately three to five templates.

**FR-PORT-03 --- Enforce account limit (P0)**\
The system shall prevent creation of a second portfolio by the same account in the MVP.

**FR-PORT-04 --- Username assignment (P0)**\
The system shall assign or collect a unique, valid portfolio identifier for public URL routing. Reserved names, invalid characters, and collisions must be rejected.

### 7.3 Section editor

**FR-EDIT-01 --- Add supported sections (P0)**\
The user shall be able to add supported section types to their portfolio.

**FR-EDIT-02 --- Edit section content (P0)**\
The user shall be able to edit the fields defined for each section type.

**FR-EDIT-03 --- Remove sections (P0)**\
The user shall be able to remove a section after an appropriate interaction.

**FR-EDIT-04 --- Reorder sections (P0)**\
The user shall be able to change the order in which sections appear.

**FR-EDIT-05 --- Show or hide sections (P0)**\
The user shall be able to hide a section from the public presentation without necessarily deleting its content.

**FR-EDIT-06 --- Validate section content (P0)**\
The system shall validate section fields and reject malformed or unsupported content.

**FR-EDIT-07 --- Section library (P0)**\
The initial library should support core sections such as Hero, About, Projects, Experience, Skills, Education, Certifications, Services, Testimonials, Achievements, Contact, and Resume/CV. Team and Case Studies may be included to support organisation-branded portfolios, subject to final MVP planning.

### 7.4 Template and design customisation

**FR-DESIGN-01 --- Template rendering (P0)**\
The public renderer shall present portfolio content according to the selected template.

**FR-DESIGN-02 --- Content/presentation separation (P0)**\
Portfolio content shall be stored independently from template-specific presentation rules.

**FR-DESIGN-04 --- Template switching (P0)**\
The system should preserve compatible content when a user changes templates.Unsupported fields must not be silently lost.

**FR-DESIGN-05 --- Free-form canvas (Future)**\
The MVP shall not provide arbitrary drag-and-drop positioning or
unrestricted element placement.

### 7.5 Preview, saving, and publishing

**FR-PUB-01 --- Preview (P0)**\
The user shall be able to preview the portfolio before publishing.

**FR-PUB-02 --- Responsive preview (P0)**\
The editor shall provide a way to inspect the portfolio in desktop and
mobile layouts.

**FR-PUB-03 --- Save draft (P0)**\
The system shall save editable changes as draft content and provide a
visible save status or error state.

**FR-PUB-04 --- Explicit publish action (P0)**\
The user shall explicitly publish a portfolio or publish changes to an
existing portfolio.

**FR-PUB-05 --- Published version isolation (P0)**\
Editing draft content shall not change the currently published portfolio
until the user completes the publish action.

**FR-PUB-06 --- Unpublish (P0)**\
The owner shall be able to unpublish a portfolio. The public URL must no
longer expose the portfolio content after the change takes effect.

**FR-PUB-07 --- Publication validation (P0)**\
Before publishing, the system shall validate required content and reject
invalid publication states with actionable feedback.

**FR-PUB-08 --- Publish feedback (P0)**\
After a successful publish, the user shall receive the public URL and a
clear success state. The system must not display success if publishing
failed.

### 7.6 Public portfolio experience

**FR-PUBLIC-01 --- Public URL routing (P0)**\
A published portfolio shall be accessible through a unique URL
under the platform's main domain.

**FR-PUBLIC-02 --- Correct portfolio resolution (P0)**\
The application shall resolve the incoming hostname to the corresponding
portfolio and render only that portfolio's published content.

**FR-PUBLIC-03 --- Draft privacy (P0)**\
Public visitors shall not be able to retrieve draft or unpublished
portfolio content through the public page or public-facing data
endpoints.

**FR-PUBLIC-04 --- Responsive page (P0)**\
Public portfolio pages shall work on common desktop and mobile viewport
sizes.

**FR-PUBLIC-05 --- External links (P0)**\
Supported project, social, and contact links shall render correctly and
be handled safely.

**FR-PUBLIC-06 --- SEO metadata (P1)**\
The system should support suitable page titles, descriptions, and
social-sharing metadata for published portfolios.

**FR-PUBLIC-07 --- Custom domains (Future)**\
Users may eventually connect domains they own. This is not required for
the MVP.

### 7.7 User dashboard

**FR-DASH-01 --- Portfolio overview (P0)**\
The dashboard shall show the user's portfolio and its current state.

**FR-DASH-02 --- Edit portfolio (P0)**\
The dashboard shall provide access to the portfolio editor.

**FR-DASH-03 --- Publication controls (P0)**\
The dashboard shall provide preview, publish, and unpublish actions as
applicable.

**FR-DASH-04 --- Basic settings (P0)**\
The user shall be able to manage relevant account and profile settings.

### 7.8 Admin dashboard

**FR-ADMIN-01 --- Admin-only access (P0)**\
The system shall restrict admin pages and operations to authorised
administrators, with access enforced on the server.

**FR-ADMIN-02 --- Overview metrics (P0)**\
The dashboard shall display total registered users, total portfolios,
and published/draft counts.

**FR-ADMIN-03 --- User list (P0)**\
An administrator shall be able to view and search registered users and
relevant non-sensitive account information.

**FR-ADMIN-04 --- Portfolio list (P0)**\
An administrator shall be able to view portfolios, their owners, status,
creation/update timestamps, and public URL where available.

**FR-ADMIN-05 --- Basic filtering (P1)**\
The dashboard should support basic filtering by portfolio status and
search by user or portfolio identifier.

### 7.9 Media

**FR-MEDIA-01 --- Upload supported media (P0)**\
Users should be able to upload supported profile and portfolio images
within configured file limits.

**FR-MEDIA-02 --- File validation (P0)**\
Uploads must be validated for allowed file types and size limits.
User-provided filenames and content must not be trusted.

**FR-MEDIA-03 --- Ownership (P0)**\
Users must not be able to replace, delete, or access private media
belonging to another user.

## 8. Non-functional requirements

### Security and privacy

- Enforce ownership checks on server-side operations.
- Configure database and storage access policies.
- Keep unpublished portfolio content private.
- Validate and sanitise user input before rendering.
- Do not render arbitrary user-provided HTML or scripts.
- Keep secrets and privileged service credentials on the server.
- Ensure admin access cannot be obtained by changing frontend routes
  or client-side state alone.
- Make public/private field boundaries explicit.

### Performance

- Optimise public portfolio images.
- Avoid unnecessary client-side JavaScript on public pages.
- Use caching where safe and appropriate.
- Ensure cached content does not leak between different portfolios or
  expose unpublished changes.

### Reliability

- Show save progress and failures.
- Prevent publishing partially saved content.

### Accessibility

- Support keyboard navigation for core forms and dashboard flows.
- Provide labels and useful validation messages.
- Use semantic headings and accessible colour contrast in templates.

### Maintainability

- Use TypeScript types and runtime validation for section content.
- Keep content models separate from template rendering.
- Keep shared components reusable.
- Document important product and technical decisions in
  `DECISIONS.md`.

## 9. High-level acceptance criteria

The MVP is ready for internal evaluation when:

1. A user can register, log in, and access their own dashboard.
2. A user can create one portfolio and select a template.
3. A user can add, edit, remove, hide, and reorder supported sections.
4. A user can customise the supported design options.
5. A user can preview the portfolio at desktop and mobile sizes.
6. A user can save a draft and see whether saving succeeded.
7. Draft edits do not alter the currently published version.
8. A user can publish and unpublish a portfolio.
9. The published portfolio resolves through the correct subdomain.
10. Unpublished content is not available to public visitors.
11. A user cannot edit or access another user's private portfolio data.
12. An administrator can view basic user and portfolio information.
13. Admin-only operations are enforced server-side.
14. Core flows are covered by tests.

## 10. Dependencies and assumptions

- The platform will have one main domain.
- The stack direction is:
    - Next.js
    - TypeScript
    - Tailwind CSS
    - Shadcn reuseble components -> MCP added, use CLI to add new components
    - Supabase Auth and Storage (PostgreSQL providing) -> MCP added
    - Vercel hosting.
- One account manages one portfolio in the MVP.
- Organisation portfolios are managed by one account.
- The exact database schema is intentionally not defined in this PRD.
- The final section fields, template designs, username rules, and
  deletion behaviour will be refined in later stages.

## 11. Risks

---

Risk Mitigation direction

---

Draft content accidentally becoming Separate draft and published data public paths and test access controls

User content causing unsafe Use typed schemas, validation, and rendering safe rendering practices

Template changes breaking content Keep content separate from presentation and test template compatibility

Organisation scope expanding too Keep one owner per portfolio and far defer team features

Autosave failures losing work Provide save state, retry/error feedback, and test failure paths
