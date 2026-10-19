import { describe, expect, it } from 'vitest';
import { portfolioSchema, validatePortfolioSlug } from './schema';

describe('portfolio identifiers', () => {
  it('accepts normalized valid identifiers', () => {
    expect(validatePortfolioSlug('Maya-Chen')).toEqual({ valid: true, slug: 'maya-chen' });
  });

  it('rejects reserved and malformed identifiers', () => {
    expect(validatePortfolioSlug('admin').valid).toBe(false);
    expect(validatePortfolioSlug('not valid').valid).toBe(false);
    expect(validatePortfolioSlug('-short').valid).toBe(false);
  });

  it('rejects unsafe external links in section content', () => {
    const result = portfolioSchema.safeParse({
      name: 'Maya',
      slug: 'maya',
      kind: 'individual',
      template: 'atelier',
      accent: '#bc6545',
      sections: [
        {
          id: 'hero',
          type: 'hero',
          title: 'Intro',
          visible: true,
          content: { headline: 'Hello', url: 'javascript:alert(1)' },
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
