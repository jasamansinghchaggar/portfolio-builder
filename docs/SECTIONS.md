# Portfolio sections manual

Every portfolio is built from a set of sections. Each section type can appear **at most
once** in a portfolio, and every section has a **visibility** toggle (show/hide) and a
stable `id`. Hidden sections are removed from the published snapshot, so they never
reach visitors. Sections render on the public page in the author's chosen order
(the hero first, then the rest).

This file documents each section, its purpose, where it renders, and every field it
asks for (with what that field is for). Limits come from `lib/portfolio/schemas.ts`.

## Common fields on every section

- `id` — unique UUID (auto-generated). Used to key the section in lists and diffs.
- `visible` — boolean. Whether the section renders on the public page.
- `title` — section heading (max 80). Shown above the section's content.

## Page details (`basics`) — shared across sections

Not a section, but feed the hero, contact, and footer:

- `fullName` — the person's name (max 80).
- `businessName` — business/brand name (max 120).
- `ownerName` — display name for the owner (max 120).
- `role` — job title or role (max 160).
- `headline` — one-line headline (max 160).
- `tagline` — short tagline (max 240).
- `location` — city/region (max 120).
- `address` — full postal address (max 240).
- `email` — contact email.
- `phone` — 10-digit local phone number.
- `whatsapp` — 10-digit WhatsApp number.
- `avatarMediaId` — uploaded avatar/profile photo.
- `heroMediaId` — uploaded hero/background image.
- `logoMediaId` — uploaded logo.

---

## Sections

### 1. Hero (`hero`)
- **Purpose:** First impression — identity, tagline, and primary call-to-action.
- **Renders:** Top of the page (always first). Reads copy from page details.

Fields:

- `imageMediaId` — optional background image behind the hero (uploaded media).

### 2. About (`about`)
- **Purpose:** Introduce the business/person and what they do.
- **Renders:** Just below the hero; includes a message card and highlight chips.

Fields:

- `title` — heading for the about block (max 80).
- `body` — main descriptive text (max 5000).
- `highlights` — short bullet points shown as chips (up to 12, max 160 each).
- `tag` — small label/eyebrow above the heading (max 80).
- `messageTitle` — heading for the message card (max 120).
- `message` — short message shown in the card (max 600).

### 3. Mission (`mission`)
- **Purpose:** State mission, vision, and values as titled cards.
- **Renders:** Mid-page content block after About.

Fields:

- `title` — section heading (max 80).
- `intro` — short intro paragraph (max 400).
- `items` — up to 12 cards, each with:
  - `title` — card heading (max 120).
  - `text` — card body (max 600).

### 4. Services (`services`)
- **Purpose:** List offered services with a call-to-action panel.
- **Renders:** Mid-page; cards in a grid, followed by the CTA panel.

Fields:

- `title` — section heading (max 80).
- `intro` — short intro paragraph (max 400).
- `items` — up to 50 service cards, each with:
  - `title` — service name (max 120).
  - `description` — service details (max 1000).
- `ctaText` — copy for the call-to-action panel (max 600).
- `ctaLabel` — button label on the panel (max 40, default "Get in touch").
- `ctaUrl` — link the CTA button points to.

### 5. Events (`events`)
- **Purpose:** Announcements, events, or news items with optional lists and quotes.
- **Renders:** Mid-page content block.

Fields:

- `title` — section heading (max 80).
- `intro` — short intro paragraph (max 400).
- `items` — up to 30 event cards, each with:
  - `title` — event name (max 140).
  - `theme` — theme/label (max 160).
  - `text` — description (max 1000).
  - `meta` — up to 8 short meta lines, e.g. date/venue (max 60 each).
  - `list` — up to 12 bullet lines (max 200 each).
  - `quote` — highlighted quote (max 400).

### 6. Products (`products`)
- **Purpose:** Showcase products with price, image, and purchase link.
- **Renders:** Mid-page; product cards in a grid.

Fields:

- `title` — section heading (max 80).
- `intro` — short intro paragraph (max 400).
- `items` — up to 50 product cards, each with:
  - `title` — product name (max 140).
  - `description` — product details (max 1000).
  - `price` — price text (max 60).
  - `imageMediaId` — uploaded product image.
  - `url` — optional purchase/info link.

### 7. Gallery (`gallery`)
- **Purpose:** Image grid with captions.
- **Renders:** Mid-page media section.

Fields:

- `title` — section heading (max 80).
- `intro` — short intro paragraph (max 400).
- `items` — up to 60 images, each with:
  - `title` — image title (max 140).
  - `caption` — caption text (max 300).
  - `imageMediaId` — uploaded image.

### 8. Videos (`videos`)
- **Purpose:** Embedded YouTube videos.
- **Renders:** Mid-page media section.

Fields:

- `title` — section heading (max 80).
- `intro` — short intro paragraph (max 400).
- `items` — up to 24 videos, each with:
  - `title` — video title (max 140).
  - `youtubeId` — YouTube video ID or URL (max 200).

### 9. Payment (`payment`)
- **Purpose:** Show UPI ID and payment QR for receiving payments.
- **Renders:** Mid-page, usually near contact/CTA.

Fields:

- `title` — section heading (max 80).
- `subtitle` — supporting text (max 240).
- `heading` — heading above the QR (max 120).
- `upiId` — UPI ID (max 120).
- `payeeName` — name on the payment (max 120).
- `qrMediaId` — uploaded QR image.

### 10. Social links (`socials`)
- **Purpose:** Links to social profiles.
- **Renders:** Mid-page or footer area as icon links.

Fields:

- `title` — section heading (max 80).
- `intro` — short intro paragraph (max 400).
- `items` — up to 20 links, each with:
  - `platform` — platform name (max 40).
  - `url` — profile link.

### 11. Contact (`contact`)
- **Purpose:** Contact details plus an enquiry form that stores messages.
- **Renders:** Lower page; includes the contact card and form.

Fields:

- `title` — section heading (max 80).
- `message` — intro message (max 1200).
- `email` — contact email.
- `phone` — 10-digit local phone number.
- `location` — location label (max 120).
- `links` — up to 20 custom links, each with:
  - `label` — link text (max 60).
  - `url` — link.
- `subtitle` — supporting text (max 240).
- `whatsapp` — 10-digit WhatsApp number.
- `address` — full address (max 240).
- `formTitle` — heading for the enquiry form (max 80, default "Send us a message").
- `formNote` — note under the form (max 240).

### 12. QR codes (`qr`)
- **Purpose:** Shareable QR codes (portfolio link + optional socials).
- **Renders:** Lower page / footer area.

Fields:

- `title` — section heading (max 80).
- `intro` — short intro paragraph (max 400).
- `whatsappUrl` — optional WhatsApp link override.
- `instagramUrl` — optional Instagram link override.

### 13. Projects (`projects`)
- **Purpose:** Showcase projects with tags, links, and images.
- **Renders:** Mid-page; project cards.

Fields:

- `title` — section heading (max 80).
- `intro` — short intro paragraph (max 400).
- `items` — up to 50 project cards, each with:
  - `title` — project name (max 120).
  - `description` — project details (max 1200).
  - `tags` — up to 12 tags (max 40 chars each).
  - `url` — optional project link.
  - `repoUrl` — optional repository link.
  - `imageMediaId` — uploaded image.
  - `featured` — boolean; mark as featured.
  - `year` — year label (max 20).

### 14. Experience (`experience`)
- **Purpose:** Work history timeline.
- **Renders:** Mid-page; timeline/list.

Fields:

- `title` — section heading (max 80).
- `items` — up to 50 entries, each with:
  - `role` — job title (max 120).
  - `company` — employer (max 120).
  - `location` — location (max 120).
  - `startDate` — start date (max 40).
  - `endDate` — end date (max 40).
  - `current` — boolean; currently in this role.
  - `description` — role details (max 1200).
  - `highlights` — up to 12 highlights (max 300 chars each).

### 15. Skills (`skills`)
- **Purpose:** Grouped skill lists.
- **Renders:** Mid-page; grouped chips/lists.

Fields:

- `title` — section heading (max 80).
- `intro` — short intro paragraph (max 400).
- `groups` — up to 20 groups, each with:
  - `name` — group name (max 80).
  - `items` — up to 50 skills (max 60 chars each).

### 16. Education (`education`)
- **Purpose:** Education history.
- **Renders:** Mid-page; list of entries.

Fields:

- `title` — section heading (max 80).
- `items` — up to 50 entries, each with:
  - `degree` — degree name (max 120).
  - `institution` — school/university (max 120).
  - `location` — location (max 120).
  - `startDate` — start date (max 40).
  - `endDate` — end date (max 40).
  - `description` — details (max 1200).

### 17. Certifications (`certifications`)
- **Purpose:** Certifications with credential links.
- **Renders:** Mid-page; list of entries.

Fields:

- `title` — section heading (max 80).
- `items` — up to 50 entries, each with:
  - `name` — certification name (max 140).
  - `issuer` — issuing body (max 120).
  - `issueDate` — date issued (max 40).
  - `credentialUrl` — optional credential link.

### 18. Testimonials (`testimonials`)
- **Purpose:** Client quotes with avatars.
- **Renders:** Mid-page; quote cards.

Fields:

- `title` — section heading (max 80).
- `items` — up to 50 quotes, each with:
  - `quote` — the testimonial text (max 700).
  - `name` — client name (max 120).
  - `role` — client role (max 120).
  - `company` — client company (max 120).
  - `avatarMediaId` — uploaded avatar image.

### 19. Achievements (`achievements`)
- **Purpose:** Awards and milestones.
- **Renders:** Mid-page; list of entries.

Fields:

- `title` — section heading (max 80).
- `items` — up to 50 entries, each with:
  - `title` — achievement name (max 140).
  - `issuer` — issuing body (max 120).
  - `date` — date (max 40).
  - `description` — details (max 1000).

### 20. Resume (`resume`)
- **Purpose:** Summary plus a downloadable resume file.
- **Renders:** Mid-page; summary and download link.

Fields:

- `title` — section heading (max 80).
- `summary` — short summary (max 1200).
- `fileMediaId` — uploaded resume file (PDF).
- `highlights` — up to 12 highlights (max 300 chars each).

---

## Default sections

A new portfolio starts with these sections enabled:

`hero`, `about`, `mission`, `services`, `gallery`, `contact`, `qr`

All other section types can be added from the editor's section list.
EOF
echo updated