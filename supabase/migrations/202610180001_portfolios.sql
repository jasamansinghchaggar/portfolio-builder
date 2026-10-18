create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$'),
  name text not null,
  kind text not null check (kind in ('individual', 'organization')),
  template text not null check (template in ('atelier', 'editorial', 'mono')),
  accent text not null check (accent ~ '^#[0-9a-fA-F]{6}$'),
  draft jsonb not null,
  published jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
create policy "profile owner access" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "portfolio owner access" on public.portfolios for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "published portfolios are public" on public.portfolios for select using (published is not null);

create or replace function public.create_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id) values (new.id) on conflict do nothing; return new; end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile();
