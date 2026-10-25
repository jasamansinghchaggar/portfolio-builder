-- Dynamic Portfolio Builder — initial schema
-- Draft content is isolated from published content. All portfolio writes go
-- through SECURITY DEFINER functions that verify ownership and revision.

create type public.app_role as enum ('user', 'admin');
create type public.portfolio_status as enum ('draft', 'published', 'unpublished');
create type public.media_kind as enum ('avatar', 'project', 'resume', 'general');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_lowercase check (email = lower(email)),
  constraint profiles_full_name_length check (char_length(full_name) <= 120)
);

create unique index profiles_email_key on public.profiles (lower(email));
create index profiles_role_idx on public.profiles (role);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  username text not null unique,
  draft_content jsonb not null,
  published_content jsonb,
  published_media_ids uuid[] not null default '{}',
  status public.portfolio_status not null default 'draft',
  revision integer not null default 0 check (revision >= 0),
  published_at timestamptz,
  last_saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolios_username_format check (
    username = lower(username)
    and username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'
    and username !~ '--'
  ),
  constraint portfolios_draft_content_object check (jsonb_typeof(draft_content) = 'object'),
  constraint portfolios_published_content_object check (
    published_content is null or jsonb_typeof(published_content) = 'object'
  ),
  constraint portfolios_draft_content_size check (octet_length(draft_content::text) <= 262144),
  constraint portfolios_published_content_size check (
    published_content is null or octet_length(published_content::text) <= 262144
  )
);

create index portfolios_status_idx on public.portfolios (status);
create index portfolios_updated_at_idx on public.portfolios (updated_at desc);
create index portfolios_published_idx on public.portfolios (updated_at desc)
  where status = 'published';

create table public.portfolio_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  kind public.media_kind not null default 'general',
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  created_at timestamptz not null default now()
);

create index portfolio_media_user_idx on public.portfolio_media (user_id);
create index portfolio_media_portfolio_idx on public.portfolio_media (portfolio_id);
create index portfolio_media_created_idx on public.portfolio_media (created_at desc);

create table public.reserved_usernames (
  username text primary key
);

insert into public.reserved_usernames (username) values
  ('www'), ('app'), ('admin'), ('api'), ('dashboard'), ('login'), ('logout'),
  ('signup'), ('register'), ('auth'), ('onboarding'), ('settings'), ('editor'),
  ('preview'), ('media'), ('support'), ('help'), ('docs'), ('blog'), ('mail'),
  ('email'), ('ftp'), ('cdn'), ('assets'), ('static'), ('status'), ('health'),
  ('terms'), ('privacy'), ('about'), ('contact'), ('careers'), ('pricing'),
  ('templates'), ('template'), ('portfolio'), ('portfolios'), ('folio'), ('root'),
  ('system'), ('null'), ('undefined'), ('test'), ('staging'), ('dev'),
  ('production'), ('pro'), ('sitemap'), ('robots'), ('favicon'),
  ('apple-touch-icon'), ('manifest'), ('opengraph-image'), ('twitter-image'),
  ('_next'), ('www2');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger portfolios_set_updated_at
  before update on public.portfolios
  for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.validate_portfolio_username()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.username = lower(trim(new.username));

  if new.username !~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$' or new.username ~ '--' then
    raise exception using
      errcode = '23514',
      message = 'invalid_username';
  end if;

  if exists (
    select 1 from public.reserved_usernames r where r.username = new.username
  ) then
    raise exception using
      errcode = '23514',
      message = 'reserved_username';
  end if;

  return new;
end;
$$;

create trigger portfolios_validate_username
  before insert or update of username on public.portfolios
  for each row execute function public.validate_portfolio_username();

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    lower(trim(p_username)) ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'
    and lower(trim(p_username)) !~ '--'
    and not exists (
      select 1 from public.reserved_usernames r
      where r.username = lower(trim(p_username))
    )
    and not exists (
      select 1 from public.portfolios p
      where p.username = lower(trim(p_username))
    );
$$;

create function public.create_portfolio(p_username text, p_content jsonb)
returns table (id uuid, username text, revision integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_username text := lower(trim(p_username));
  v_id uuid;
  v_revision integer;
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;

  if not public.username_available(v_username) then
    raise exception using errcode = '23514', message = 'username_unavailable';
  end if;

  if jsonb_typeof(p_content) <> 'object' or octet_length(p_content::text) > 262144 then
    raise exception using errcode = '22023', message = 'invalid_content';
  end if;

  insert into public.portfolios as p (user_id, username, draft_content)
  values (v_user, v_username, p_content)
  returning p.id, p.revision into v_id, v_revision;

  return query select v_id, v_username, v_revision;
exception
  when unique_violation then
    raise exception using errcode = '23514', message = 'username_unavailable';
end;
$$;

create function public.save_portfolio_draft(
  p_portfolio_id uuid,
  p_content jsonb,
  p_revision integer
)
returns table (revision integer, saved_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_revision integer;
  v_saved_at timestamptz;
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;

  if jsonb_typeof(p_content) <> 'object' or octet_length(p_content::text) > 262144 then
    raise exception using errcode = '22023', message = 'invalid_content';
  end if;

  update public.portfolios
  set draft_content = p_content, revision = revision + 1, last_saved_at = now()
  where id = p_portfolio_id and user_id = v_user and revision = p_revision
  returning revision, last_saved_at into v_revision, v_saved_at;

  if v_revision is null then
    if exists (
      select 1 from public.portfolios
      where id = p_portfolio_id and user_id = v_user
    ) then
      raise exception using errcode = '40001', message = 'revision_conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'portfolio_not_found';
  end if;

  return query select v_revision, v_saved_at;
end;
$$;

create function public.publish_portfolio(
  p_portfolio_id uuid,
  p_content jsonb,
  p_media_ids uuid[],
  p_revision integer
)
returns table (revision integer, published_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_media_ids uuid[];
  v_revision integer;
  v_published_at timestamptz;
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;

  if jsonb_typeof(p_content) <> 'object' or octet_length(p_content::text) > 262144 then
    raise exception using errcode = '22023', message = 'invalid_content';
  end if;

  v_media_ids := coalesce(
    (select array_agg(distinct media_id) from unnest(coalesce(p_media_ids, '{}'::uuid[])) as media_id),
    '{}'::uuid[]
  );

  if exists (
    select 1
    from unnest(v_media_ids) as media_id
    where not exists (
      select 1
      from public.portfolio_media m
      where m.id = media_id
        and m.user_id = v_user
        and m.portfolio_id = p_portfolio_id
    )
  ) then
    raise exception using errcode = '22023', message = 'invalid_media';
  end if;

  update public.portfolios
  set
    draft_content = p_content,
    published_content = p_content,
    published_media_ids = v_media_ids,
    status = 'published',
    revision = revision + 1,
    published_at = now(),
    last_saved_at = now()
  where id = p_portfolio_id and user_id = v_user and revision = p_revision
  returning revision, published_at into v_revision, v_published_at;

  if v_revision is null then
    if exists (
      select 1 from public.portfolios
      where id = p_portfolio_id and user_id = v_user
    ) then
      raise exception using errcode = '40001', message = 'revision_conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'portfolio_not_found';
  end if;

  return query select v_revision, v_published_at;
end;
$$;

create function public.unpublish_portfolio(p_portfolio_id uuid, p_revision integer)
returns table (revision integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_revision integer;
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;

  update public.portfolios
  set status = 'unpublished', published_media_ids = '{}', revision = revision + 1
  where id = p_portfolio_id and user_id = v_user and revision = p_revision
  returning revision into v_revision;

  if v_revision is null then
    if exists (
      select 1 from public.portfolios
      where id = p_portfolio_id and user_id = v_user
    ) then
      raise exception using errcode = '40001', message = 'revision_conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'portfolio_not_found';
  end if;

  return query select v_revision;
end;
$$;

create function public.change_portfolio_username(p_portfolio_id uuid, p_username text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_username text := lower(trim(p_username));
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;

  if not public.username_available(v_username) then
    if exists (select 1 from public.portfolios p where p.username = v_username) then
      raise exception using errcode = '23505', message = 'username_taken';
    end if;
    raise exception using errcode = '23514', message = 'invalid_username';
  end if;

  update public.portfolios
  set username = v_username
  where id = p_portfolio_id and user_id = v_user;

  if not found then
    raise exception using errcode = 'P0002', message = 'portfolio_not_found';
  end if;

  return v_username;
exception
  when unique_violation then
    raise exception using errcode = '23505', message = 'username_taken';
end;
$$;

create function public.is_media_public(p_storage_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portfolio_media m
    join public.portfolios p on p.id = m.portfolio_id
    where m.storage_path = p_storage_path
      and p.status = 'published'
      and m.id = any (p.published_media_ids)
  );
$$;

create function public.get_public_portfolio(p_username text)
returns table (
  username text,
  content jsonb,
  media jsonb,
  published_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.username,
    p.published_content,
    coalesce(
      (
        select jsonb_object_agg(
          m.id::text,
          jsonb_build_object(
            'width', m.width,
            'height', m.height,
            'mimeType', m.mime_type,
            'fileName', m.file_name
          )
        )
        from public.portfolio_media m
        where m.id = any (p.published_media_ids)
          and m.portfolio_id = p.id
      ),
      '{}'::jsonb
    ),
    p.published_at,
    p.updated_at
  from public.portfolios p
  where p.username = lower(trim(p_username))
    and p.status = 'published'
    and p.published_content is not null
  limit 1;
$$;

create function public.get_public_media(p_id uuid)
returns table (
  storage_path text,
  mime_type text,
  file_name text,
  width integer,
  height integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select m.storage_path, m.mime_type, m.file_name, m.width, m.height
  from public.portfolio_media m
  join public.portfolios p on p.id = m.portfolio_id
  where m.id = p_id
    and p.status = 'published'
    and m.id = any (p.published_media_ids)
  limit 1;
$$;

create function public.get_public_portfolios()
returns table (username text, updated_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.username, p.updated_at
  from public.portfolios p
  where p.status = 'published'
  order by p.updated_at desc;
$$;

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.portfolio_media enable row level security;
alter table public.reserved_usernames enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "portfolios_select_own_or_admin"
  on public.portfolios for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "portfolio_media_select_own_or_admin"
  on public.portfolio_media for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "portfolio_media_insert_own"
  on public.portfolio_media for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.portfolios p
      where p.id = portfolio_id and p.user_id = (select auth.uid())
    )
  );

create policy "portfolio_media_update_own"
  on public.portfolio_media for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.portfolios p
      where p.id = portfolio_id and p.user_id = (select auth.uid())
    )
  );

create policy "portfolio_media_delete_own"
  on public.portfolio_media for delete
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.portfolios from anon, authenticated;
revoke all on table public.portfolio_media from anon, authenticated;
revoke all on table public.reserved_usernames from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;
grant select on table public.portfolios to authenticated;
grant select, insert, update, delete on table public.portfolio_media to authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.validate_portfolio_username() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.username_available(text) from public, anon;
grant execute on function public.username_available(text) to authenticated;
revoke all on function public.create_portfolio(text, jsonb) from public, anon;
grant execute on function public.create_portfolio(text, jsonb) to authenticated;
revoke all on function public.save_portfolio_draft(uuid, jsonb, integer) from public, anon;
grant execute on function public.save_portfolio_draft(uuid, jsonb, integer) to authenticated;
revoke all on function public.publish_portfolio(uuid, jsonb, uuid[], integer) from public, anon;
grant execute on function public.publish_portfolio(uuid, jsonb, uuid[], integer) to authenticated;
revoke all on function public.unpublish_portfolio(uuid, integer) from public, anon;
grant execute on function public.unpublish_portfolio(uuid, integer) to authenticated;
revoke all on function public.change_portfolio_username(uuid, text) from public, anon;
grant execute on function public.change_portfolio_username(uuid, text) to authenticated;
revoke all on function public.is_media_public(text) from public;
grant execute on function public.is_media_public(text) to anon, authenticated;
revoke all on function public.get_public_portfolio(text) from public;
grant execute on function public.get_public_portfolio(text) to anon, authenticated;
revoke all on function public.get_public_media(uuid) from public;
grant execute on function public.get_public_media(uuid) to anon, authenticated;
revoke all on function public.get_public_portfolios() from public;
grant execute on function public.get_public_portfolios() to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "portfolio_media_owner_read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "portfolio_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'portfolio-media'
    and public.is_media_public(name)
  );

create policy "portfolio_media_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "portfolio_media_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "portfolio_media_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
