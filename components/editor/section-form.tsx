"use client"

import type { ReactNode } from "react"
import { IconPlus, IconTrash } from "@tabler/icons-react"

import {
  FieldRow,
  FormSection,
  LinesInput,
  TextAreaInput,
  TextInput,
} from "@/components/editor/fields"
import { MediaField } from "@/components/editor/media-field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  createAchievementItem,
  createCertificationItem,
  createEducationItem,
  createEventItem,
  createExperienceItem,
  createGalleryItem,
  createMissionItem,
  createProductItem,
  createProjectItem,
  createServiceItem,
  createSkillGroup,
  createSocialItem,
  createTestimonialItem,
  createVideoItem,
} from "@/lib/portfolio/defaults"
import type { EditorMedia } from "@/lib/portfolio/media"
import type { Basics, Section } from "@/lib/portfolio/types"
import { validateUpiId, validateUrl, validateYoutube } from "@/lib/portfolio/validation"
import { cn } from "@/lib/utils"

function ItemCard({
  title,
  onRemove,
  children,
  className,
}: {
  title: string
  onRemove: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-lg border bg-background", className)}>
      <div className="flex items-center justify-between gap-2 border-b bg-muted/20 px-3 py-1.5">
        <span className="truncate text-[0.7rem] font-medium">{title}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Remove ${title}`}
          className="text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <IconTrash />
        </Button>
      </div>
      <div className="space-y-3 p-3">{children}</div>
    </div>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 w-full border-dashed text-xs"
      onClick={onClick}
    >
      <IconPlus />
      {label}
    </Button>
  )
}

function updateItem<T extends { id: string }>(
  items: T[],
  id: string,
  patch: Partial<T>
): T[] {
  return items.map((entry) =>
    entry.id === id ? { ...entry, ...patch } : entry
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium">{value || "—"}</dd>
    </div>
  )
}

export function SectionForm({
  section,
  basics,
  onChange,
  media,
  onMediaAdded,
  onOpenPageDetails,
}: {
  section: Section
  basics: Basics
  onChange: (section: Section) => void
  media: EditorMedia[]
  onMediaAdded: (media: EditorMedia) => void
  onOpenPageDetails?: () => void
}) {
  switch (section.type) {
    case "hero":
      return (
        <div className="space-y-5">
          <FormSection
            title="Hero content"
            description="The hero is built from Page details, so everything below is edited once and used everywhere."
          >
            <dl className="grid gap-2 rounded-lg border bg-muted/20 p-3 text-sm">
              <SummaryRow
                label="Eyebrow"
                value={basics.headline || basics.role}
              />
              <SummaryRow
                label="Business name"
                value={basics.businessName || basics.fullName}
              />
              <SummaryRow
                label="Owner line"
                value={[basics.ownerName, basics.role]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <SummaryRow label="Tagline" value={basics.tagline} />
              <SummaryRow
                label="Portrait"
                value={basics.avatarMediaId ? "Profile image set" : ""}
              />
              <SummaryRow
                label="Background"
                value={basics.heroMediaId ? "Hero image set" : "Gradient"}
              />
            </dl>
            {onOpenPageDetails ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={onOpenPageDetails}
              >
                Edit page details
              </Button>
            ) : null}
          </FormSection>

          <FormSection
            title="Buttons"
            description="Chat on WhatsApp, Call us, and Book an appointment appear automatically from your contact details."
          >
            <p className="text-sm text-muted-foreground">
              Add a WhatsApp number or phone in Page details to show the chat
              and call buttons. The appointment button always opens the contact
              form.
            </p>
          </FormSection>
        </div>
      )

    case "about":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextInput
            label="Small label"
            value={section.tag}
            onChange={(tag) => onChange({ ...section, tag })}
            placeholder="A little about us"
            maxLength={80}
          />
          <TextAreaInput
            label="About you"
            value={section.body}
            onChange={(body) => onChange({ ...section, body })}
            placeholder="Write in plain language. What do you care about? What kind of work do you take on?"
            rows={8}
            maxLength={5000}
            hint="Leave a blank line between paragraphs."
          />
          <LinesInput
            label="Highlights"
            value={section.highlights}
            onChange={(highlights) => onChange({ ...section, highlights })}
            placeholder={
              "10 years designing products\nPreviously at Northwind\nBased in London"
            }
            hint="Short facts that add texture. One per line."
            rows={4}
          />
          <FormSection
            title="Personal note"
            description="Optional. Shown in a highlighted box after your story."
          >
            <TextInput
              label="Note title"
              value={section.messageTitle}
              onChange={(messageTitle) =>
                onChange({ ...section, messageTitle })
              }
              placeholder="A personal note"
              maxLength={120}
            />
            <TextAreaInput
              label="Note"
              value={section.message}
              onChange={(message) => onChange({ ...section, message })}
              placeholder="If you are not sure where to start, that is completely fine."
              rows={3}
              maxLength={600}
            />
          </FormSection>
        </div>
      )

    case "mission":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Intro"
            value={section.intro}
            onChange={(intro) => onChange({ ...section, intro })}
            placeholder="The promises you keep on every project."
            rows={3}
            maxLength={400}
          />
          <FormSection title={`Promises (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.title || `Promise ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <TextInput
                  label="Title"
                  value={item.title}
                  onChange={(title) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, { title }),
                    })
                  }
                  placeholder="Listen first"
                  maxLength={120}
                />
                <TextAreaInput
                  label="Description"
                  value={item.text}
                  onChange={(text) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, { text }),
                    })
                  }
                  rows={3}
                  maxLength={600}
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add promise"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createMissionItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "projects":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Intro"
            value={section.intro}
            onChange={(intro) => onChange({ ...section, intro })}
            placeholder="A sentence or two about the work below."
            rows={3}
            maxLength={400}
          />

          <FormSection title={`Projects (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.title || `Project ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <TextInput
                  label="Project title"
                  value={item.title}
                  onChange={(title) =>
                    onChange({
                      ...section,
                      items: section.items.map((entry) =>
                        entry.id === item.id ? { ...entry, title } : entry
                      ),
                    })
                  }
                  placeholder="Northwind design system"
                  maxLength={120}
                />
                <FieldRow>
                  <TextInput
                    label="Year"
                    value={item.year}
                    onChange={(year) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, year } : entry
                        ),
                      })
                    }
                    placeholder="2026"
                    maxLength={20}
                  />
                  <TextInput
                    label="Tags"
                    value={item.tags.join(", ")}
                    onChange={(value) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id
                            ? {
                                ...entry,
                                tags: value
                                  .split(",")
                                  .map((tag) => tag.trim())
                                  .filter(Boolean)
                                  .slice(0, 12),
                              }
                            : entry
                        ),
                      })
                    }
                    placeholder="Product, Design systems"
                    hint="Comma separated."
                  />
                </FieldRow>
                <TextAreaInput
                  label="Description"
                  value={item.description}
                  onChange={(description) =>
                    onChange({
                      ...section,
                      items: section.items.map((entry) =>
                        entry.id === item.id ? { ...entry, description } : entry
                      ),
                    })
                  }
                  placeholder="What was the problem, what did you make, and what changed?"
                  rows={4}
                  maxLength={1200}
                />
                <FieldRow>
                  <TextInput
                    label="Live URL"
                    value={item.url}
                    onChange={(url) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, url } : entry
                        ),
                      })
                    }
                    placeholder="https://…"
                    validate={validateUrl}
                  />
                  <TextInput
                    label="Repository URL"
                    value={item.repoUrl}
                    onChange={(repoUrl) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, repoUrl } : entry
                        ),
                      })
                    }
                    placeholder="https://github.com/…"
                    validate={validateUrl}
                  />
                </FieldRow>
                <MediaField
                  label="Project image"
                  value={item.imageMediaId}
                  onChange={(imageMediaId) =>
                    onChange({
                      ...section,
                      items: section.items.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, imageMediaId }
                          : entry
                      ),
                    })
                  }
                  media={media}
                  onMediaAdded={onMediaAdded}
                  kind="project"
                />
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={item.featured}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, featured: checked === true }
                            : entry
                        ),
                      })
                    }
                  />
                  Feature this project
                </label>
              </ItemCard>
            ))}
            <AddButton
              label="Add project"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createProjectItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "experience":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <FormSection title={`Roles (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={
                  item.role
                    ? `${item.role}${item.company ? ` · ${item.company}` : ""}`
                    : `Role ${index + 1}`
                }
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <FieldRow>
                  <TextInput
                    label="Role"
                    value={item.role}
                    onChange={(role) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, role } : entry
                        ),
                      })
                    }
                    placeholder="Senior product designer"
                    maxLength={120}
                  />
                  <TextInput
                    label="Company"
                    value={item.company}
                    onChange={(company) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, company } : entry
                        ),
                      })
                    }
                    placeholder="Northwind"
                    maxLength={120}
                  />
                </FieldRow>
                <FieldRow columns={3}>
                  <TextInput
                    label="Location"
                    value={item.location}
                    onChange={(location) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, location } : entry
                        ),
                      })
                    }
                    placeholder="Remote"
                    maxLength={120}
                  />
                  <TextInput
                    label="Start"
                    value={item.startDate}
                    onChange={(startDate) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, startDate } : entry
                        ),
                      })
                    }
                    placeholder="Jan 2023"
                    maxLength={40}
                  />
                  <TextInput
                    label="End"
                    value={item.current ? "Present" : item.endDate}
                    onChange={(endDate) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, endDate } : entry
                        ),
                      })
                    }
                    placeholder="Present"
                    maxLength={40}
                    inputClassName={item.current ? "opacity-60" : undefined}
                  />
                </FieldRow>
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={item.current}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id
                            ? {
                                ...entry,
                                current: checked === true,
                                endDate: checked === true ? "" : entry.endDate,
                              }
                            : entry
                        ),
                      })
                    }
                  />
                  I currently work here
                </label>
                <TextAreaInput
                  label="Description"
                  value={item.description}
                  onChange={(description) =>
                    onChange({
                      ...section,
                      items: section.items.map((entry) =>
                        entry.id === item.id ? { ...entry, description } : entry
                      ),
                    })
                  }
                  rows={3}
                  maxLength={1200}
                />
                <LinesInput
                  label="Highlights"
                  value={item.highlights}
                  onChange={(highlights) =>
                    onChange({
                      ...section,
                      items: section.items.map((entry) =>
                        entry.id === item.id ? { ...entry, highlights } : entry
                      ),
                    })
                  }
                  hint="Wins, responsibilities, outcomes. One per line."
                  rows={3}
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add role"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createExperienceItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "skills":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Intro"
            value={section.intro}
            onChange={(intro) => onChange({ ...section, intro })}
            rows={3}
            maxLength={400}
          />
          <FormSection title={`Groups (${section.groups.length})`}>
            {section.groups.map((group, index) => (
              <ItemCard
                key={group.id}
                title={group.name || `Group ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    groups: section.groups.filter(
                      (entry) => entry.id !== group.id
                    ),
                  })
                }
              >
                <TextInput
                  label="Group name"
                  value={group.name}
                  onChange={(name) =>
                    onChange({
                      ...section,
                      groups: section.groups.map((entry) =>
                        entry.id === group.id ? { ...entry, name } : entry
                      ),
                    })
                  }
                  placeholder="Product design"
                  maxLength={80}
                />
                <LinesInput
                  label="Skills"
                  value={group.items}
                  onChange={(items) =>
                    onChange({
                      ...section,
                      groups: section.groups.map((entry) =>
                        entry.id === group.id ? { ...entry, items } : entry
                      ),
                    })
                  }
                  hint="One skill per line."
                  rows={3}
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add skill group"
              onClick={() =>
                onChange({
                  ...section,
                  groups: [...section.groups, createSkillGroup()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "education":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <FormSection title={`Education (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.degree || `Entry ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <FieldRow>
                  <TextInput
                    label="Qualification"
                    value={item.degree}
                    onChange={(degree) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, degree } : entry
                        ),
                      })
                    }
                    placeholder="BA, Graphic Design"
                    maxLength={120}
                  />
                  <TextInput
                    label="Institution"
                    value={item.institution}
                    onChange={(institution) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, institution }
                            : entry
                        ),
                      })
                    }
                    placeholder="Central Saint Martins"
                    maxLength={120}
                  />
                </FieldRow>
                <FieldRow columns={3}>
                  <TextInput
                    label="Location"
                    value={item.location}
                    onChange={(location) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, location } : entry
                        ),
                      })
                    }
                    placeholder="London"
                    maxLength={120}
                  />
                  <TextInput
                    label="Start"
                    value={item.startDate}
                    onChange={(startDate) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, startDate } : entry
                        ),
                      })
                    }
                    placeholder="2014"
                    maxLength={40}
                  />
                  <TextInput
                    label="End"
                    value={item.endDate}
                    onChange={(endDate) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, endDate } : entry
                        ),
                      })
                    }
                    placeholder="2017"
                    maxLength={40}
                  />
                </FieldRow>
                <TextAreaInput
                  label="Notes"
                  value={item.description}
                  onChange={(description) =>
                    onChange({
                      ...section,
                      items: section.items.map((entry) =>
                        entry.id === item.id ? { ...entry, description } : entry
                      ),
                    })
                  }
                  rows={3}
                  maxLength={1200}
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add education"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createEducationItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "certifications":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <FormSection title={`Certifications (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.name || `Certification ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <FieldRow>
                  <TextInput
                    label="Name"
                    value={item.name}
                    onChange={(name) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, name } : entry
                        ),
                      })
                    }
                    placeholder="Google UX Design Certificate"
                    maxLength={140}
                  />
                  <TextInput
                    label="Issuer"
                    value={item.issuer}
                    onChange={(issuer) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, issuer } : entry
                        ),
                      })
                    }
                    placeholder="Google"
                    maxLength={120}
                  />
                </FieldRow>
                <FieldRow>
                  <TextInput
                    label="Issue date"
                    value={item.issueDate}
                    onChange={(issueDate) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, issueDate } : entry
                        ),
                      })
                    }
                    placeholder="2024"
                    maxLength={40}
                  />
                  <TextInput
                    label="Credential URL"
                    value={item.credentialUrl}
                    onChange={(credentialUrl) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, credentialUrl }
                            : entry
                        ),
                      })
                    }
                    placeholder="https://…"
                    validate={validateUrl}
                  />
                </FieldRow>
              </ItemCard>
            ))}
            <AddButton
              label="Add certification"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createCertificationItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "services":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Intro"
            value={section.intro}
            onChange={(intro) => onChange({ ...section, intro })}
            rows={3}
            maxLength={400}
          />
          <FormSection title={`Services (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.title || `Service ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <TextInput
                  label="Title"
                  value={item.title}
                  onChange={(title) =>
                    onChange({
                      ...section,
                      items: section.items.map((entry) =>
                        entry.id === item.id ? { ...entry, title } : entry
                      ),
                    })
                  }
                  placeholder="Product design"
                  maxLength={120}
                />
                <TextAreaInput
                  label="Description"
                  value={item.description}
                  onChange={(description) =>
                    onChange({
                      ...section,
                      items: section.items.map((entry) =>
                        entry.id === item.id ? { ...entry, description } : entry
                      ),
                    })
                  }
                  rows={3}
                  maxLength={1000}
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add service"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createServiceItem()],
                })
              }
            />
          </FormSection>

          <FormSection
            title="Call to action"
            description="Shown in a highlighted panel below your services."
          >
            <TextAreaInput
              label="Panel text"
              value={section.ctaText}
              onChange={(ctaText) => onChange({ ...section, ctaText })}
              placeholder="Tell us what you need. We will reply with a clear plan and next steps."
              rows={3}
              maxLength={600}
            />
            <FieldRow>
              <TextInput
                label="Button label"
                value={section.ctaLabel}
                onChange={(ctaLabel) => onChange({ ...section, ctaLabel })}
                placeholder="Get in touch"
                maxLength={40}
              />
              <TextInput
                label="Button URL"
                value={section.ctaUrl}
                onChange={(ctaUrl) => onChange({ ...section, ctaUrl })}
                placeholder="#section-contact"
                validate={validateUrl}
              />
            </FieldRow>
          </FormSection>
        </div>
      )

    case "events":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Intro"
            value={section.intro}
            onChange={(intro) => onChange({ ...section, intro })}
            rows={3}
            maxLength={400}
          />
          <FormSection title={`Events (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.title || `Event ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <FieldRow>
                  <TextInput
                    label="Title"
                    value={item.title}
                    onChange={(title) =>
                      onChange({
                        ...section,
                        items: updateItem(section.items, item.id, { title }),
                      })
                    }
                    placeholder="Studio open week"
                    maxLength={140}
                  />
                  <TextInput
                    label="Theme or subtitle"
                    value={item.theme}
                    onChange={(theme) =>
                      onChange({
                        ...section,
                        items: updateItem(section.items, item.id, { theme }),
                      })
                    }
                    placeholder="Meet the team"
                    maxLength={160}
                  />
                </FieldRow>
                <TextAreaInput
                  label="Description"
                  value={item.text}
                  onChange={(text) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, { text }),
                    })
                  }
                  rows={3}
                  maxLength={1000}
                />
                <LinesInput
                  label="Details"
                  value={item.meta}
                  onChange={(meta) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, { meta }),
                    })
                  }
                  placeholder={"12 November\nBrooklyn studio\nFree"}
                  hint="Date, place, price. One per line."
                  rows={3}
                />
                <LinesInput
                  label="What to expect"
                  value={item.list}
                  onChange={(list) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, { list }),
                    })
                  }
                  hint="One item per line."
                  rows={3}
                />
                <TextAreaInput
                  label="Quote"
                  value={item.quote}
                  onChange={(quote) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, { quote }),
                    })
                  }
                  rows={2}
                  maxLength={400}
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add event"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createEventItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "products":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Intro"
            value={section.intro}
            onChange={(intro) => onChange({ ...section, intro })}
            rows={3}
            maxLength={400}
          />
          <FormSection title={`Products (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.title || `Product ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <FieldRow>
                  <TextInput
                    label="Name"
                    value={item.title}
                    onChange={(title) =>
                      onChange({
                        ...section,
                        items: updateItem(section.items, item.id, { title }),
                      })
                    }
                    placeholder="Fieldnotes workbook"
                    maxLength={140}
                  />
                  <TextInput
                    label="Price"
                    value={item.price}
                    onChange={(price) =>
                      onChange({
                        ...section,
                        items: updateItem(section.items, item.id, { price }),
                      })
                    }
                    placeholder="$28"
                    maxLength={60}
                  />
                </FieldRow>
                <TextAreaInput
                  label="Description"
                  value={item.description}
                  onChange={(description) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, {
                        description,
                      }),
                    })
                  }
                  rows={3}
                  maxLength={1000}
                />
                <TextInput
                  label="Product URL"
                  value={item.url}
                  onChange={(url) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, { url }),
                    })
                  }
                  placeholder="https://…"
                  validate={validateUrl}
                />
                <MediaField
                  label="Product image"
                  value={item.imageMediaId}
                  onChange={(imageMediaId) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, {
                        imageMediaId,
                      }),
                    })
                  }
                  media={media}
                  onMediaAdded={onMediaAdded}
                  kind="project"
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add product"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createProductItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "gallery":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Intro"
            value={section.intro}
            onChange={(intro) => onChange({ ...section, intro })}
            rows={3}
            maxLength={400}
          />
          <FormSection title={`Photos (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.title || `Photo ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <TextInput
                  label="Title"
                  value={item.title}
                  onChange={(title) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, { title }),
                    })
                  }
                  maxLength={140}
                />
                <TextInput
                  label="Caption"
                  value={item.caption}
                  onChange={(caption) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, { caption }),
                    })
                  }
                  maxLength={300}
                />
                <MediaField
                  label="Photo"
                  value={item.imageMediaId}
                  onChange={(imageMediaId) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, {
                        imageMediaId,
                      }),
                    })
                  }
                  media={media}
                  onMediaAdded={onMediaAdded}
                  kind="project"
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add photo"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createGalleryItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "videos":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Intro"
            value={section.intro}
            onChange={(intro) => onChange({ ...section, intro })}
            rows={3}
            maxLength={400}
          />
          <FormSection title={`Videos (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.title || `Video ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <TextInput
                  label="Title"
                  value={item.title}
                  onChange={(title) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, { title }),
                    })
                  }
                  maxLength={140}
                />
                <TextInput
                  label="YouTube link or ID"
                  value={item.youtubeId}
                  onChange={(youtubeId) =>
                    onChange({
                      ...section,
                      items: updateItem(section.items, item.id, {
                        youtubeId,
                      }),
                    })
                  }
                  placeholder="https://youtube.com/watch?v=…"
                  hint="A full YouTube link or the 11-character video ID."
                  validate={validateYoutube}
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add video"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createVideoItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "payment":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Subtitle"
            value={section.subtitle}
            onChange={(subtitle) => onChange({ ...section, subtitle })}
            placeholder="Pay a deposit or a small invoice in a few seconds."
            rows={2}
            maxLength={240}
          />
          <TextInput
            label="Heading"
            value={section.heading}
            onChange={(heading) => onChange({ ...section, heading })}
            placeholder="Scan to pay with any UPI app"
            maxLength={120}
          />
          <FieldRow>
            <TextInput
              label="UPI ID"
              value={section.upiId}
              onChange={(upiId) => onChange({ ...section, upiId })}
              placeholder="yourname@bank"
              maxLength={120}
              hint="A QR code is generated from this ID."
              validate={validateUpiId}
            />
            <TextInput
              label="Payee name"
              value={section.payeeName}
              onChange={(payeeName) => onChange({ ...section, payeeName })}
              placeholder={
                basics.businessName || basics.fullName || "Your business name"
              }
              maxLength={120}
              hint="Leave blank to use your business name."
            />
          </FieldRow>
          <FormSection
            title="Uploaded QR code"
            description="Optional. If you upload an image, it replaces the generated QR code."
          >
            <MediaField
              label="Payment QR image"
              value={section.qrMediaId}
              onChange={(qrMediaId) => onChange({ ...section, qrMediaId })}
              media={media}
              onMediaAdded={onMediaAdded}
              kind="general"
              hint="A screenshot or export from your payment app. Displayed as-is."
            />
          </FormSection>
        </div>
      )

    case "socials":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Intro"
            value={section.intro}
            onChange={(intro) => onChange({ ...section, intro })}
            rows={3}
            maxLength={400}
          />
          <FormSection title={`Profiles (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.platform || `Profile ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <FieldRow>
                  <TextInput
                    label="Platform"
                    value={item.platform}
                    onChange={(platform) =>
                      onChange({
                        ...section,
                        items: updateItem(section.items, item.id, { platform }),
                      })
                    }
                    placeholder="Instagram"
                    maxLength={40}
                  />
                  <TextInput
                    label="Profile URL"
                    value={item.url}
                    onChange={(url) =>
                      onChange({
                        ...section,
                        items: updateItem(section.items, item.id, { url }),
                      })
                    }
                    placeholder="https://instagram.com/…"
                    validate={validateUrl}
                  />
                </FieldRow>
              </ItemCard>
            ))}
            <AddButton
              label="Add social profile"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createSocialItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "qr":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Intro"
            value={section.intro}
            onChange={(intro) => onChange({ ...section, intro })}
            placeholder="Save our link, WhatsApp, and social profiles with a single scan."
            rows={3}
            maxLength={400}
          />
          <p className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
            QR codes are generated automatically: your portfolio link always
            appears, and WhatsApp and Instagram codes are added when those
            details are set in Page details and Social links.
          </p>
        </div>
      )

    case "testimonials":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <FormSection title={`Testimonials (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.name || `Testimonial ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <TextAreaInput
                  label="Quote"
                  value={item.quote}
                  onChange={(quote) =>
                    onChange({
                      ...section,
                      items: section.items.map((entry) =>
                        entry.id === item.id ? { ...entry, quote } : entry
                      ),
                    })
                  }
                  rows={3}
                  maxLength={700}
                />
                <FieldRow>
                  <TextInput
                    label="Author"
                    value={item.name}
                    onChange={(name) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, name } : entry
                        ),
                      })
                    }
                    maxLength={120}
                  />
                  <TextInput
                    label="Role"
                    value={item.role}
                    onChange={(role) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, role } : entry
                        ),
                      })
                    }
                    maxLength={120}
                  />
                </FieldRow>
                <TextInput
                  label="Company"
                  value={item.company}
                  onChange={(company) =>
                    onChange({
                      ...section,
                      items: section.items.map((entry) =>
                        entry.id === item.id ? { ...entry, company } : entry
                      ),
                    })
                  }
                  maxLength={120}
                />
                <MediaField
                  label="Avatar"
                  value={item.avatarMediaId}
                  onChange={(avatarMediaId) =>
                    onChange({
                      ...section,
                      items: section.items.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, avatarMediaId }
                          : entry
                      ),
                    })
                  }
                  media={media}
                  onMediaAdded={onMediaAdded}
                  kind="avatar"
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add testimonial"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createTestimonialItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "achievements":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <FormSection title={`Achievements (${section.items.length})`}>
            {section.items.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.title || `Achievement ${index + 1}`}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter(
                      (entry) => entry.id !== item.id
                    ),
                  })
                }
              >
                <FieldRow>
                  <TextInput
                    label="Title"
                    value={item.title}
                    onChange={(title) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, title } : entry
                        ),
                      })
                    }
                    maxLength={140}
                  />
                  <TextInput
                    label="Issuer"
                    value={item.issuer}
                    onChange={(issuer) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, issuer } : entry
                        ),
                      })
                    }
                    maxLength={120}
                  />
                </FieldRow>
                <FieldRow>
                  <TextInput
                    label="Date"
                    value={item.date}
                    onChange={(date) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id ? { ...entry, date } : entry
                        ),
                      })
                    }
                    placeholder="2025"
                    maxLength={40}
                  />
                  <TextAreaInput
                    label="Description"
                    value={item.description}
                    onChange={(description) =>
                      onChange({
                        ...section,
                        items: section.items.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, description }
                            : entry
                        ),
                      })
                    }
                    rows={2}
                    maxLength={1000}
                  />
                </FieldRow>
              </ItemCard>
            ))}
            <AddButton
              label="Add achievement"
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, createAchievementItem()],
                })
              }
            />
          </FormSection>
        </div>
      )

    case "contact":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Message"
            value={section.message}
            onChange={(message) => onChange({ ...section, message })}
            placeholder="Have a project in mind? I'd love to hear about it."
            rows={3}
            maxLength={1200}
          />

          <FormSection
            title="Contact details"
            description="The contact card and enquiry form use these values from Page details, so they are only entered once."
          >
            <dl className="grid gap-2 rounded-lg border bg-muted/20 p-3 text-sm">
              <SummaryRow label="Email" value={basics.email} />
              <SummaryRow label="Phone" value={basics.phone} />
              <SummaryRow label="WhatsApp" value={basics.whatsapp} />
              <SummaryRow label="Location" value={basics.location} />
              <SummaryRow label="Address" value={basics.address} />
            </dl>
            {onOpenPageDetails ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={onOpenPageDetails}
              >
                Edit page details
              </Button>
            ) : null}
          </FormSection>

          <FormSection
            title="Enquiry form"
            description="The form stores messages in your inbox. Social profiles come from the Social links section."
          >
            <FieldRow>
              <TextInput
                label="Form title"
                value={section.formTitle}
                onChange={(formTitle) => onChange({ ...section, formTitle })}
                placeholder="Send us a message"
                maxLength={80}
              />
              <TextInput
                label="Form note"
                value={section.formNote}
                onChange={(formNote) => onChange({ ...section, formNote })}
                placeholder="Tell us a little about what you need."
                maxLength={240}
              />
            </FieldRow>
          </FormSection>
        </div>
      )

    case "resume":
      return (
        <div className="space-y-5">
          <TextInput
            label="Section title"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            maxLength={80}
          />
          <TextAreaInput
            label="Summary"
            value={section.summary}
            onChange={(summary) => onChange({ ...section, summary })}
            placeholder="A short CV summary or a note about what's inside the PDF."
            rows={4}
            maxLength={1200}
          />
          <MediaField
            label="CV file"
            value={section.fileMediaId}
            onChange={(fileMediaId) => onChange({ ...section, fileMediaId })}
            media={media}
            onMediaAdded={onMediaAdded}
            kind="resume"
            accept="pdf"
            hint="PDF only, up to 5 MB. Visitors can download it from the resume section."
          />
          <LinesInput
            label="Highlights"
            value={section.highlights}
            onChange={(highlights) => onChange({ ...section, highlights })}
            hint="Optional quick facts. One per line."
            rows={4}
          />
        </div>
      )
  }
}
