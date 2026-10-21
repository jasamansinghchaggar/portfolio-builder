# User Flows

**Status:** Stage 3 — user-flow baseline  
**Related documents:** [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md), [PRD.md](PRD.md), [DECISIONS.md](DECISIONS.md)

This document describes the MVP journeys and their outcomes. The application already implements portions of these journeys; the implementation plan records current coverage separately.

## Actors

- **Visitor:** browses the product or a published portfolio.
- **Portfolio owner:** manages one individual or organisation-branded portfolio.
- **Administrator:** views basic user and portfolio information.

## 1. Create an account and enter the dashboard

1. Visitor opens the product landing page.
2. Visitor chooses sign up or sign in and submits credentials.
3. The authentication provider validates the request and establishes a session.
4. On success, the user enters the dashboard. On failure, the form explains the issue and allows retry.
5. A returning signed-in user opening an auth page is redirected to the dashboard.

**Outcome:** An authenticated owner can access only their own portfolio and profile operations.

## 2. Create or update a portfolio draft

1. Owner opens the dashboard; the system loads their profile and portfolio, or presents the initial editor state if none exists.
2. Owner enters profile details and chooses an individual or organisation-branded presentation where supported.
3. Owner selects one of the available templates.
4. Owner adds supported sections, edits their content, changes order, hides/shows or removes sections, and selects supported visual options.
5. Owner optionally uploads media for supported sections.
6. Owner saves the draft. Validation errors identify the fields or constraints that need attention.
7. The system confirms that the saved draft remains private until explicitly published.

**Outcome:** The account has at most one saved draft. Saving changes does not replace an existing published version.

## 3. Preview and publish

1. Owner opens preview from the editor and selects desktop or mobile presentation.
2. Owner closes preview and adjusts content as needed.
3. Owner chooses Publish.
4. The system validates the draft and saves a published snapshot.
5. The dashboard confirms publication and provides the public URL when configured.
6. Owner opens the public URL to review the live result.

**Outcome:** Visitors can read the published snapshot. Further draft edits stay separate until the owner publishes again.

## 4. Unpublish

1. Owner chooses Unpublish for a currently published portfolio.
2. The system clears public availability while retaining the editable draft.
3. The dashboard confirms that the URL no longer displays the portfolio.

**Outcome:** The owner can continue editing and publish again later.

## 5. Visit a public portfolio

1. Visitor opens a portfolio URL using its unique slug under the platform domain.
2. The application resolves the slug and retrieves only published content.
3. If a published portfolio exists, the visitor sees visible sections in their configured order, using the selected template and supported media.
4. If the slug is unknown or the portfolio is unpublished, the visitor receives a not-found response.
5. Project, contact, and resume links behave according to their content and browser capabilities.

**Outcome:** Unpublished draft data is never rendered to a public visitor.

## 6. Administrator reviews platform records

1. Administrator signs in and opens the admin dashboard.
2. The application checks admin status on the server.
3. If the check fails, access is denied or the user returns to the regular dashboard.
4. An authorised administrator reviews overview counts and user/portfolio lists.
5. Administrator searches or filters the displayed records.

**Outcome:** Basic visibility is available to authorised administrators. Moderation, reporting, platform settings, and audit logs remain outside MVP scope.

## Shared failure and recovery behaviour

- Unauthenticated protected-page or API requests return to authentication or an unauthorised response.
- Validation and save failures keep the owner in the editor and provide a recoverable error.
- Publish and unpublish failures must not falsely report a changed live state.
- Media upload failures are shown in the editor; existing portfolio text remains editable.
- Missing configuration or unavailable backend services are surfaced as setup or service errors, not as successful saves.

## Decisions to confirm in later stages

- Exact onboarding fields, account verification, and password recovery rules.
- Whether draft saving is manual, automatic, or both, including recovery after network loss.
- Confirmation requirements for destructive section removal and unpublishing.
- Public URL naming, reserved slugs, and final hosting/domain configuration.
- Retention and account-deletion behaviour.
