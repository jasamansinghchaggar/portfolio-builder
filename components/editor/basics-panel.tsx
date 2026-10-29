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
import {
  validateBusinessName,
  validateEmail,
  validateOwnerName,
  validatePhone,
} from "@/lib/portfolio/validation"

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
        description="Everything here feeds the hero and header. Edit it once — the hero section reads from these values."
      >
        <TextInput
          label="Business name"
          value={basics.businessName}
          onChange={(businessName) => onChange({ ...basics, businessName })}
          placeholder="Quinn Studio"
          maxLength={120}
          validate={validateBusinessName}
        />
        <FieldRow>
          <TextInput
            label="Owner name"
            value={basics.ownerName}
            onChange={(ownerName) => onChange({ ...basics, ownerName })}
            placeholder="Avery Quinn"
            maxLength={120}
            validate={validateOwnerName}
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
          label="Hero eyebrow"
          value={basics.headline}
          onChange={(headline) => onChange({ ...basics, headline })}
          placeholder="Interior design studio"
          maxLength={160}
          hint="The small line above your business name in the hero."
        />
      </FormSection>

      <FormSection
        title="Contact details"
        description="Used by the hero buttons, quick actions, contact card, and enquiry form."
      >
        <FieldRow>
          <TextInput
            label="Email"
            type="email"
            value={basics.email}
            onChange={(email) => onChange({ ...basics, email })}
            placeholder="you@example.com"
            validate={validateEmail}
          />
          <TextInput
            label="Phone"
            type="tel"
            value={basics.phone}
            onChange={(phone) => onChange({ ...basics, phone })}
            placeholder="98765 43210"
            maxLength={40}
            hint="10 digits, without the country code."
            validate={validatePhone}
          />
        </FieldRow>
        <FieldRow>
          <TextInput
            label="WhatsApp"
            type="tel"
            value={basics.whatsapp}
            onChange={(whatsapp) => onChange({ ...basics, whatsapp })}
            placeholder="98765 43210"
            maxLength={40}
            hint="10 digits, without the country code. Used for chat buttons and wa.me links."
            validate={validatePhone}
          />
          <TextInput
            label="Location"
            value={basics.location}
            onChange={(location) => onChange({ ...basics, location })}
            placeholder="London, UK"
            maxLength={120}
            hint="City or region. Shown in the contact card when there is no address."
          />
        </FieldRow>
        <TextInput
          label="Address"
          value={basics.address}
          onChange={(address) => onChange({ ...basics, address })}
          placeholder="Street, city, postcode"
          maxLength={240}
        />
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
