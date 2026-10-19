import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migration = readFileSync(
  fileURLToPath(new URL('./202610180001_portfolios.sql', import.meta.url)),
  'utf8',
);

describe('portfolio privacy contract', () => {
  it('keeps draft and published documents separate', () => {
    expect(migration).toMatch(/draft jsonb not null/);
    expect(migration).toMatch(/published jsonb/);
  });

  it('enables owner RLS and published-only public reads', () => {
    expect(migration).toMatch(/alter table public\.portfolios enable row level security/);
    expect(migration).toMatch(/published portfolios are public[\s\S]*published is not null/);
    expect(migration).toMatch(/auth\.uid\(\) = owner_id/);
  });

  it('provisions private user-owned media storage', () => {
    const mediaMigration = readFileSync(
      fileURLToPath(new URL('./202610180002_profiles_media.sql', import.meta.url)),
      'utf8',
    );
    expect(mediaMigration).toMatch(/portfolio-media/);
    expect(mediaMigration).toMatch(/public\)\s*values[\s\S]*false/);
    expect(mediaMigration).toMatch(/storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/);
  });
});
