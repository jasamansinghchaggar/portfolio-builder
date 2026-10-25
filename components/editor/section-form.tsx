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
  createContactLink,
  createEducationItem,
  createExperienceItem,
  createProjectItem,
  createServiceItem,
  createSkillGroup,
  createTestimonialItem,
} from "@/lib/portfolio/defaults"
import type { EditorMedia } from "@/lib/portfolio/media"
import type { Section } from "@/lib/portfolio/types"
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

export function SectionForm({
  section,
  onChange,
  media,
  onMediaAdded,
}: {
  section: Section
  onChange: (section: Section) => void
  media: EditorMedia[]
  onMediaAdded: (media: EditorMedia) => void
}) {
  switch (section.type) {
    case "hero":
      return (
        <div className="space-y-5">
          <FormSection title="Introduction">
            <FieldRow>
              <TextInput
                label="Eyebrow"
                value={section.eyebrow}
                onChange={(eyebrow) => onChange({ ...section, eyebrow })}
                placeholder="Independent designer"
                maxLength={80}
              />
              <TextInput
                label="Availability"
                value={section.availability}
                onChange={(availability) =>
                  onChange({ ...section, availability })
                }
                placeholder="Available for work"
                maxLength={80}
              />
            </FieldRow>
            <TextInput
              label="Headline"
              value={section.headline}
              onChange={(headline) => onChange({ ...section, headline })}
              placeholder="Calm, useful products."
              maxLength={180}
            />
            <TextInput
              label="Subheadline"
              value={section.subheadline}
              onChange={(subheadline) => onChange({ ...section, subheadline })}
              placeholder="I design and build software for people who care about the details."
              maxLength={240}
            />
            <TextAreaInput
              label="Short bio"
              value={section.bio}
              onChange={(bio) => onChange({ ...section, bio })}
              placeholder="A few lines about what you do and how you got here."
              rows={4}
              maxLength={600}
            />
            <TextInput
              label="Location"
              value={section.location}
              onChange={(location) => onChange({ ...section, location })}
              placeholder="London, UK"
              maxLength={120}
            />
          </FormSection>

          <FormSection title="Portrait">
            <MediaField
              label="Hero image"
              value={section.imageMediaId}
              onChange={(imageMediaId) =>
                onChange({ ...section, imageMediaId })
              }
              media={media}
              onMediaAdded={onMediaAdded}
              kind="avatar"
              hint="A portrait or a piece of work that represents you."
            />
          </FormSection>

          <FormSection
            title="Buttons"
            description="Both buttons are optional. A label needs a destination."
          >
            <FieldRow>
              <TextInput
                label="Primary label"
                value={section.primaryCtaLabel}
                onChange={(primaryCtaLabel) =>
                  onChange({ ...section, primaryCtaLabel })
                }
                placeholder="View work"
                maxLength={40}
              />
              <TextInput
                label="Primary URL"
                value={section.primaryCtaUrl}
                onChange={(primaryCtaUrl) =>
                  onChange({ ...section, primaryCtaUrl })
                }
                placeholder="https://… or #section-projects"
              />
            </FieldRow>
            <FieldRow>
              <TextInput
                label="Secondary label"
                value={section.secondaryCtaLabel}
                onChange={(secondaryCtaLabel) =>
                  onChange({ ...section, secondaryCtaLabel })
                }
                placeholder="Get in touch"
                maxLength={40}
              />
              <TextInput
                label="Secondary URL"
                value={section.secondaryCtaUrl}
                onChange={(secondaryCtaUrl) =>
                  onChange({ ...section, secondaryCtaUrl })
                }
                placeholder="mailto:you@example.com"
              />
            </FieldRow>
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
          <FieldRow>
            <TextInput
              label="Email"
              type="email"
              value={section.email}
              onChange={(email) => onChange({ ...section, email })}
              placeholder="you@example.com"
            />
            <TextInput
              label="Phone"
              value={section.phone}
              onChange={(phone) => onChange({ ...section, phone })}
              placeholder="+44 …"
              maxLength={40}
            />
          </FieldRow>
          <TextInput
            label="Location"
            value={section.location}
            onChange={(location) => onChange({ ...section, location })}
            maxLength={120}
          />

          <FormSection title={`Links (${section.links.length})`}>
            {section.links.map((link, index) => (
              <div
                key={link.id}
                className="grid gap-2 rounded-lg border bg-background p-3 sm:grid-cols-[1fr_1.4fr_auto]"
              >
                <TextInput
                  label={index === 0 ? "Label" : undefined}
                  value={link.label}
                  onChange={(label) =>
                    onChange({
                      ...section,
                      links: section.links.map((entry) =>
                        entry.id === link.id ? { ...entry, label } : entry
                      ),
                    })
                  }
                  placeholder="LinkedIn"
                  maxLength={60}
                />
                <TextInput
                  label={index === 0 ? "URL" : undefined}
                  value={link.url}
                  onChange={(url) =>
                    onChange({
                      ...section,
                      links: section.links.map((entry) =>
                        entry.id === link.id ? { ...entry, url } : entry
                      ),
                    })
                  }
                  placeholder="https://linkedin.com/in/…"
                />
                <div className={cn("flex items-end", index === 0 && "pb-0.5")}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove link"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      onChange({
                        ...section,
                        links: section.links.filter(
                          (entry) => entry.id !== link.id
                        ),
                      })
                    }
                  >
                    <IconTrash />
                  </Button>
                </div>
              </div>
            ))}
            <AddButton
              label="Add contact link"
              onClick={() =>
                onChange({
                  ...section,
                  links: [...section.links, createContactLink()],
                })
              }
            />
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
