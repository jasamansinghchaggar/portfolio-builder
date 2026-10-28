"use client"

import {
  FieldRow,
  FormSection,
  TextAreaInput,
  TextInput,
} from "@/components/editor/fields"
import { MediaField } from "@/components/editor/media-field"
import type { Basics } from "@/lib/portfolio/types"
import type { EditorMedia } from "@/lib/portfolio/media"

export function BasicsPanel({
  basics,
  onChange,
  media,
  onMediaAdded,
}: {
  basics: Basics
  onChange: (basics: Basics) => void
  media: EditorMedia[]
  onMediaAdded: (media: EditorMedia) => void
}) {
  return (
    <div className="space-y-5">
      <FormSection
        title="Business identity"
        description="Used in the header, hero, browser tab, and social previews."
      >
        <TextInput
          label="Business name"
          value={basics.businessName}
          onChange={(businessName) => onChange({ ...basics, businessName })}
          placeholder="Quinn Studio"
          maxLength={120}
        />
        <FieldRow>
          <TextInput
            label="Owner name"
            value={basics.ownerName}
            onChange={(ownerName) => onChange({ ...basics, ownerName })}
            placeholder="Avery Quinn"
            maxLength={120}
          />
          <TextInput
            label="Role"
            value={basics.role}
            onChange={(role) => onChange({ ...basics, role })}
            placeholder="Interior designer"
            maxLength={160}
          />
        </FieldRow>
        <TextAreaInput
          label="Tagline"
          value={basics.tagline}
          onChange={(tagline) => onChange({ ...basics, tagline })}
          placeholder="Calm, considered spaces for everyday living."
          rows={2}
          maxLength={240}
        />
        <TextInput
          label="Headline"
          value={basics.headline}
          onChange={(headline) => onChange({ ...basics, headline })}
          placeholder="Interior design studio"
          maxLength={160}
        />
      </FormSection>

      <FormSection
        title="Contact details"
        description="Shown on the hero, quick actions, and contact section."
      >
        <FieldRow>
          <TextInput
            label="Email"
            type="email"
            value={basics.email}
            onChange={(email) => onChange({ ...basics, email })}
            placeholder="you@example.com"
          />
          <TextInput
            label="Phone"
            value={basics.phone}
            onChange={(phone) => onChange({ ...basics, phone })}
            placeholder="+44 …"
            maxLength={40}
          />
        </FieldRow>
        <FieldRow>
          <TextInput
            label="WhatsApp"
            value={basics.whatsapp}
            onChange={(whatsapp) => onChange({ ...basics, whatsapp })}
            placeholder="+44 …"
            maxLength={40}
            hint="Used for chat buttons and wa.me links."
          />
          <TextInput
            label="Website"
            value={basics.website}
            onChange={(website) => onChange({ ...basics, website })}
            placeholder="https://…"
          />
        </FieldRow>
        <FieldRow>
          <TextInput
            label="Location"
            value={basics.location}
            onChange={(location) => onChange({ ...basics, location })}
            placeholder="London, UK"
            maxLength={120}
          />
          <TextInput
            label="Address"
            value={basics.address}
            onChange={(address) => onChange({ ...basics, address })}
            placeholder="Street, city, postcode"
            maxLength={240}
          />
        </FieldRow>
      </FormSection>

      <FormSection
        title="Brand images"
        description="Optional. A logo replaces the initials in the navigation."
      >
        <MediaField
          label="Logo"
          value={basics.logoMediaId}
          onChange={(logoMediaId) => onChange({ ...basics, logoMediaId })}
          media={media}
          onMediaAdded={onMediaAdded}
          kind="avatar"
          hint="Square or circular images work best."
        />
        <MediaField
          label="Hero background image"
          value={basics.heroMediaId}
          onChange={(heroMediaId) => onChange({ ...basics, heroMediaId })}
          media={media}
          onMediaAdded={onMediaAdded}
          kind="general"
          hint="A wide photo of your space, work, or team. Text stays readable."
        />
        <MediaField
          label="Profile image"
          value={basics.avatarMediaId}
          onChange={(avatarMediaId) => onChange({ ...basics, avatarMediaId })}
          media={media}
          onMediaAdded={onMediaAdded}
          kind="avatar"
          hint="A square portrait works best. Shown as a circle in the hero."
        />
      </FormSection>
    </div>
  )
}
