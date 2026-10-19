# Product Scope --- Dynamic Portfolio Builder

**Document version:** 0.1\
**Status:** Baseline for PRD\
**Project type:** Internal project\
**Last updated:** 17 October 2026

## 1. Product vision

Build a multi-user web platform that enables individuals and
organisations to create, customise, and publish professional portfolio
websites without writing code or deploying a separate website
themselves.

The platform provides a user dashboard for portfolio creation and
management, a public portfolio experience served from the platform's
domain, and a simple administrator dashboard for visibility into users
and portfolios.

## 2. Problem statement

Creating and maintaining a portfolio website can require design skills,
web development knowledge, hosting configuration, and ongoing
maintenance. The platform should reduce this effort through reusable
templates, configurable sections, and a straightforward publishing
workflow.

## 3. Target users

### Primary audiences

- Individuals: students, developers, designers, freelancers, job
  seekers, professionals, and creators.
- Organisations: small businesses, agencies, and teams that want a
  public-facing portfolio or showcase of their work.

### MVP organisational model

An organisation-branded portfolio can be managed by one account.
Multi-member team access and collaboration are out of scope for the MVP.

## 4. Product principles

1.  **Easy to start:** Users should be able to create a useful first
    draft without technical knowledge.
2.  **Content separated from presentation:** Portfolio content should
    not be tied to a single template.
3.  **Flexible within clear boundaries:** Users can choose templates and
    manage predefined sections, but the MVP will not provide a free-form
    canvas.
4.  **Preview before publishing:** Users can review changes before they
    affect the live portfolio.
5.  **Secure by default:** Users can only edit portfolios they own;
    private drafts must not be publicly accessible.
6.  **Simple operations:** The initial admin dashboard should focus on
    user and portfolio visibility rather than advanced platform
    administration.

## 5. Core user experience

1.  A visitor signs up or logs in.
2.  The user completes basic profile information.
3.  The user selects a template.
4.  The user adds, edits, removes, hides, and reorders supported
    sections.
5.  The user customises supported design options.
6.  The user previews the portfolio in desktop and mobile layouts.
7.  The user saves a draft and explicitly publishes it when ready.
8.  The platform assigns a public subdomain URL.
9.  The user can return later, edit the draft, and publish changes.
10. The user can unpublish the portfolio.

## 6. Portfolio creation model

### Template-based

The MVP will launch with a small set of approximately three to five
templates. The exact number and designs will be finalised during design
planning.

### Section-based

Users can manage predefined sections, including: - Hero - About -
Projects - Experience - Skills - Education - Certifications - Services -
Testimonials - Achievements - Contact - Resume/CV -
Organisation-oriented sections such as Team and Case Studies, where
practical for the MVP

The initial section library should be useful to both individuals and
organisations without becoming too large to build and maintain.

### Customisation

The MVP may support a defined set of design controls such as accent
colours, font choices, and selected layout settings. Free-form
drag-and-drop positioning of arbitrary elements is out of scope.

## 7. Portfolio URL and domain approach

Published portfolios will be served from subdomains of one
platform-owned main domain. For example, `username.example.com`.

The platform will need hostname-to-portfolio resolution and suitable
DNS, hosting, and HTTPS configuration. A wildcard subdomain approach is
the intended direction, subject to confirmation against the selected
hosting plan.

Users will not need to purchase a separate domain for each platform
subdomain. The platform's main domain and hosting may still incur costs.

### Future enhancement

Allow users to connect domains they already own, such as
`portfolio.example.org`. Custom-domain support is not part of the MVP.

## 8. User dashboard scope

The MVP user dashboard should include: - Overview and portfolio status -
Portfolio editor - Template selection - Section management - Supported
design customisation - Preview - Draft saving and publishing controls -
Basic account/profile settings

## 9. Admin dashboard scope

The MVP admin dashboard should provide simple visibility into: - Total
registered users - Total portfolios - Published and draft portfolio
counts - User list and basic user details - Portfolio list, owner,
status, timestamps, and public URL where available - Basic search and
filtering

Administrative access must be protected and enforced server-side.

### Explicit exclusions

The MVP excludes: - Moderation and abuse-reporting workflows - Platform
settings and audit logs - Advanced role and permission management beyond
what is needed for secure admin access - Billing, subscriptions, and
payment processing

These exclusions do not remove the need for fundamental security,
ownership checks, and safe data handling.

## 10. Initial technical direction

The proposed stack is: - Next.js - TypeScript - Tailwind CSS -
shadcn/ui - PostgreSQL - Supabase Auth - Supabase Storage - Next.js
server-side code and Route Handlers - Zod - React Hook Form - Vercel
hosting, subject to validating subdomain and wildcard-domain support for
the chosen plan

This is the agreed direction for planning, not a final deployment
configuration.

## 11. MVP boundaries

### In scope

- One portfolio per account
- Individual and organisation-branded portfolios
- One account manages each portfolio
- Authentication and onboarding
- Template selection
- Predefined section-based editor
- Reordering and visibility controls for sections
- Supported style customisation
- Preview
- Draft and published states
- Explicit publish/unpublish actions
- Public portfolio subdomains
- Responsive public pages
- Basic user dashboard
- Simple admin dashboard
- Fundamental access control and input validation

### Out of scope

- Free-form visual canvas
- Multiple portfolios per account
- Multi-user organisation workspaces
- Custom domains
- Payments and subscriptions
- AI-generated portfolios or content
- Advanced analytics
- Moderation and abuse reporting
- Platform settings and audit logs
- Full version history
- Complex approval workflows

## 12. Success criteria for the internal MVP

The MVP can be considered functionally ready for internal evaluation
when: 1. A user can register and log in. 2. A user can create one
portfolio and select a template. 3. A user can add and edit supported
sections. 4. A user can reorder and hide sections. 5. A user can preview
the portfolio responsively. 6. A user can save changes as a draft
without changing the live version. 7. A user can publish and unpublish a
portfolio. 8. A published portfolio resolves to the correct subdomain. 9. A user cannot edit another user's portfolio. 10. Public visitors
cannot access unpublished draft content. 11. An administrator can view
and search users and portfolios. 12. The main flows have documented and
passing tests.

## 13. Dependencies and risks

- The chosen hosting plan must support the required wildcard-subdomain
  setup or a workable equivalent.
- Public URL routing must map each hostname to the correct portfolio.
- Draft and published content must be separated reliably.
- Template and section schemas must remain compatible as templates
  evolve.
- Organisation-focused content must work without introducing team
  collaboration into the MVP.
- The platform must prevent users from injecting unsafe markup or
  accessing other users' data.

## 14. Items to finalise later

- Main domain name and DNS provider
- Exact hosting plan and cost
- Final template designs and count
- Final list and fields for each section type
- Username/subdomain rules and reserved names
- Exact onboarding fields
- Draft autosave behaviour and failure states
- Analytics scope, if any
- Retention and deletion behaviour
- Final database schema and relationships
- Detailed technical architecture and deployment configuration
