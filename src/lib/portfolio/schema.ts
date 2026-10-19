import { z } from 'zod';

export const sectionTypes = [
  'hero',
  'about',
  'projects',
  'experience',
  'skills',
  'education',
  'certifications',
  'services',
  'testimonials',
  'achievements',
  'contact',
  'resume',
  'team',
  'case-studies',
] as const;

export const portfolioSectionSchema = z.object({
  id: z.string().min(1).max(80),
  type: z.enum(sectionTypes),
  title: z.string().trim().min(1).max(80),
  visible: z.boolean(),
  content: z.record(z.string(), z.unknown()).superRefine((content, context) => {
    for (const key of ['headline', 'body', 'url', 'imagePath']) {
      if (key in content && typeof content[key] !== 'string') {
        context.addIssue({ code: 'custom', path: [key], message: `${key} must be text.` });
      }
    }
    if ('url' in content && typeof content.url === 'string' && !/^https?:\/\//i.test(content.url)) {
      context.addIssue({ code: 'custom', path: ['url'], message: 'Links must use http or https.' });
    }
  }),
});

export const portfolioSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/),
  kind: z.enum(['individual', 'organization']),
  template: z.enum(['atelier', 'editorial', 'mono']),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  sections: z
    .array(portfolioSectionSchema)
    .max(20)
    .superRefine((sections, context) => {
      const ids = new Set<string>();
      sections.forEach((section, index) => {
        if (ids.has(section.id)) {
          context.addIssue({
            code: 'custom',
            path: [index, 'id'],
            message: 'Section ids must be unique.',
          });
        }
        ids.add(section.id);
      });
      if (!sections.some((section) => section.type === 'hero' && section.visible)) {
        context.addIssue({
          code: 'custom',
          path: ['sections'],
          message: 'A visible hero section is required.',
        });
      }
    }),
});

export type Portfolio = z.infer<typeof portfolioSchema>;
export type PortfolioSection = z.infer<typeof portfolioSectionSchema>;

export const reservedSlugs = new Set([
  'admin',
  'api',
  'app',
  'dashboard',
  'auth',
  'login',
  'signup',
  'settings',
  'help',
  'support',
  'www',
  'public',
  'static',
  'assets',
]);

export function validatePortfolioSlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  const result = portfolioSchema.shape.slug.safeParse(normalized);
  if (!result.success)
    return {
      valid: false,
      slug: normalized,
      message: 'Use 3–40 lowercase letters, numbers, or hyphens.',
    };
  if (reservedSlugs.has(normalized))
    return { valid: false, slug: normalized, message: 'That address is reserved.' };
  return { valid: true, slug: normalized };
}

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(500),
});
