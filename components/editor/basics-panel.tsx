"use client"

import {
  FieldRow,
  FormSection,
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
        title="Identity"
        description="Used in the page header, browser tab, and social previews."
      >
        <FieldRow>
          <TextInput
            label="Full name"
            value={basics.fullName}
            onChange={(fullName) => onChange({ ...basics, fullName })}
            placeholder="Avery Morgan"
            maxLength={80}
          />
          <TextInput
            label="Headline"
            value={basics.headline}
            onChange={(headline) => onChange({ ...basics, headline })}
            placeholder="Product designer & systems thinker"
            maxLength={160}
          />
        </FieldRow>
        <TextInput
          label="Location"
          value={basics.location}
          onChange={(location) => onChange({ ...basics, location })}
          placeholder="London, UK"
          maxLength={120}
        />
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
      </FormSection>

      <FormSection
        title="Profile image"
        description="Optional. Appears in the header navigation and on the contact block."
      >
        <MediaField
          label="Avatar"
          value={basics.avatarMediaId}
          onChange={(avatarMediaId) => onChange({ ...basics, avatarMediaId })}
          media={media}
          onMediaAdded={onMediaAdded}
          kind="avatar"
          hint="A square portrait works best."
        />
      </FormSection>
    </div>
  )
}
