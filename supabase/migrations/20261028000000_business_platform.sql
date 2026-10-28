-- Business platform: contact inbox, admin audit log, and admin-scoped writes.
-- Public messages are inserted only through a SECURITY DEFINER function so the
-- table itself never needs an anon insert grant.

create table public.portfolio_messages (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  name text not null,
  email text not null default '',
  phone text not null default '',
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint portfolio_messages_name_length check (
    char_length(name) between 1 and 120
  ),
  constraint portfolio_messages_email_length check (char_length(email) <= 254),
  constraint portfolio_messages_phone_length check (char_length(phone) <= 40),
  constraint portfolio_messages_message_length check (
    char_length(message) between 1 and 4000
  ),
  constraint portfolio_messages_contact_present check (
    email <> '' or phone <> ''
  )
);

create index portfolio_messages_portfolio_idx
  on public.portfolio_messages (portfolio_id, created_at desc);
create index portfolio_messages_unread_idx
  on public.portfolio_messages (portfolio_id, created_at desc)
  where read_at is null;

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_email text not null default '',
  action text not null,
  target_type text not null default '',
  target_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint admin_audit_log_action_length check (
    char_length(action) between 1 and 80
  )
);

create index admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);
create index admin_audit_log_actor_idx
  on public.admin_audit_log (actor_id, created_at desc);
create index admin_audit_log_target_idx
  on public.admin_audit_log (target_id, created_at desc);

-- Public contact form ---------------------------------------------------------

create function public.send_portfolio_message(
  p_username text,
  p_name text,
  p_email text,
  p_phone text,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_portfolio_id uuid;
  v_name text := trim(coalesce(p_name, ''));
  v_email text := lower(trim(coalesce(p_email, '')));
  v_phone text := trim(coalesce(p_phone, ''));
  v_message text := trim(coalesce(p_message, ''));
  v_recent integer;
begin
  if char_length(v_name) = 0 or char_length(v_message) = 0 then
    raise exception using errcode = '22023', message = 'invalid_message';
  end if;

  if char_length(v_email) = 0 and char_length(v_phone) = 0 then
    raise exception using errcode = '22023', message = 'contact_required';
  end if;

  select p.id
  into v_portfolio_id
  from public.portfolios p
  where p.username = lower(trim(coalesce(p_username, '')))
    and p.status = 'published';

  if v_portfolio_id is null then
    raise exception using errcode = 'P0002', message = 'portfolio_not_found';
  end if;

  -- A light rate limit keeps accidental double submissions and casual spam out
  -- without blocking a family sharing one phone number.
  select count(*)
  into v_recent
  from public.portfolio_messages m
  where m.portfolio_id = v_portfolio_id
    and m.created_at > now() - interval '10 minutes'
    and (
      (v_email <> '' and lower(m.email) = v_email)
      or (v_phone <> '' and m.phone = v_phone)
    );

  if v_recent >= 3 then
    raise exception using errcode = '54000', message = 'rate_limited';
  end if;

  insert into public.portfolio_messages (
    portfolio_id,
    name,
    email,
    phone,
    message
  )
  values (
    v_portfolio_id,
    v_name,
    v_email,
    v_phone,
    v_message
  );
end;
$$;

-- Admin RPCs ----------------------------------------------------------------

create function public.admin_save_portfolio_draft(
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
  v_actor uuid := (select auth.uid());
  v_actor_email text;
  v_revision integer;
  v_saved_at timestamptz;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;
  if jsonb_typeof(p_content) <> 'object' or octet_length(p_content::text) > 262144 then
    raise exception using errcode = '22023', message = 'invalid_content';
  end if;

  update public.portfolios as p
  set
    draft_content = p_content,
    revision = p.revision + 1,
    last_saved_at = now()
  where p.id = p_portfolio_id
    and p.revision = p_revision
  returning p.revision, p.last_saved_at
  into v_revision, v_saved_at;

  if v_revision is null then
    if exists (select 1 from public.portfolios p where p.id = p_portfolio_id) then
      raise exception using errcode = '40001', message = 'revision_conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'portfolio_not_found';
  end if;

  select p.email into v_actor_email
  from public.profiles p
  where p.id = v_actor;

  insert into public.admin_audit_log (
    actor_id, actor_email, action, target_type, target_id, detail
  )
  values (
    v_actor,
    coalesce(v_actor_email, ''),
    'portfolio.save_draft',
    'portfolio',
    p_portfolio_id,
    jsonb_build_object('revision', v_revision)
  );

  return query select v_revision, v_saved_at;
end;
$$;

create function public.admin_publish_portfolio(
  p_portfolio_id uuid,
  p_content jsonb,
  p_published_content jsonb,
  p_media_ids uuid[],
  p_revision integer
)
returns table (revision integer, published_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_actor_email text;
  v_media_ids uuid[];
  v_revision integer;
  v_published_at timestamptz;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;
  if jsonb_typeof(p_content) <> 'object' or octet_length(p_content::text) > 262144 then
    raise exception using errcode = '22023', message = 'invalid_content';
  end if;
  if jsonb_typeof(p_published_content) <> 'object' or octet_length(p_published_content::text) > 262144 then
    raise exception using errcode = '22023', message = 'invalid_content';
  end if;

  v_media_ids := coalesce(
    (
      select array_agg(distinct media_id)
      from unnest(coalesce(p_media_ids, '{}'::uuid[])) as media_id
    ),
    '{}'::uuid[]
  );

  if exists (
    select 1
    from unnest(v_media_ids) as media_id
    where not exists (
      select 1
      from public.portfolio_media m
      where m.id = media_id and m.portfolio_id = p_portfolio_id
    )
  ) then
    raise exception using errcode = '22023', message = 'invalid_media';
  end if;

  update public.portfolios as p
  set
    draft_content = p_content,
    published_content = p_published_content,
    published_media_ids = v_media_ids,
    status = 'published',
    revision = p.revision + 1,
    published_at = now(),
    last_saved_at = now()
  where p.id = p_portfolio_id
    and p.revision = p_revision
  returning p.revision, p.published_at
  into v_revision, v_published_at;

  if v_revision is null then
    if exists (select 1 from public.portfolios p where p.id = p_portfolio_id) then
      raise exception using errcode = '40001', message = 'revision_conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'portfolio_not_found';
  end if;

  select p.email into v_actor_email
  from public.profiles p
  where p.id = v_actor;

  insert into public.admin_audit_log (
    actor_id, actor_email, action, target_type, target_id, detail
  )
  values (
    v_actor,
    coalesce(v_actor_email, ''),
    'portfolio.publish',
    'portfolio',
    p_portfolio_id,
    jsonb_build_object('revision', v_revision, 'media_count', cardinality(v_media_ids))
  );

  return query select v_revision, v_published_at;
end;
$$;

create function public.admin_unpublish_portfolio(
  p_portfolio_id uuid,
  p_revision integer
)
returns table (revision integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_actor_email text;
  v_revision integer;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;

  update public.portfolios as p
  set
    status = 'unpublished',
    published_media_ids = '{}',
    revision = p.revision + 1
  where p.id = p_portfolio_id
    and p.revision = p_revision
  returning p.revision into v_revision;

  if v_revision is null then
    if exists (select 1 from public.portfolios p where p.id = p_portfolio_id) then
      raise exception using errcode = '40001', message = 'revision_conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'portfolio_not_found';
  end if;

  select p.email into v_actor_email
  from public.profiles p
  where p.id = v_actor;

  insert into public.admin_audit_log (
    actor_id, actor_email, action, target_type, target_id, detail
  )
  values (
    v_actor,
    coalesce(v_actor_email, ''),
    'portfolio.unpublish',
    'portfolio',
    p_portfolio_id,
    jsonb_build_object('revision', v_revision)
  );

  return query select v_revision;
end;
$$;

create function public.admin_mark_message_read(
  p_message_id uuid,
  p_read boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_portfolio_id uuid;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;

  update public.portfolio_messages
  set read_at = case when p_read then coalesce(read_at, now()) else null end
  where id = p_message_id
  returning portfolio_id into v_portfolio_id;

  if v_portfolio_id is null then
    raise exception using errcode = 'P0002', message = 'message_not_found';
  end if;
end;
$$;

-- Row level security --------------------------------------------------------

alter table public.portfolio_messages enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "portfolio_messages_select_owner_or_admin"
  on public.portfolio_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = portfolio_id and p.user_id = (select auth.uid())
    )
    or public.is_admin()
  );

create policy "portfolio_messages_update_owner_or_admin"
  on public.portfolio_messages for update
  to authenticated
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = portfolio_id and p.user_id = (select auth.uid())
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.portfolios p
      where p.id = portfolio_id and p.user_id = (select auth.uid())
    )
    or public.is_admin()
  );

create policy "portfolio_messages_delete_owner_or_admin"
  on public.portfolio_messages for delete
  to authenticated
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = portfolio_id and p.user_id = (select auth.uid())
    )
    or public.is_admin()
  );

create policy "admin_audit_log_select_admin"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_admin());

-- Admin media writes. Owners keep their existing policies; these policies add
-- an explicit admin path for any portfolio's media.
create policy "portfolio_media_admin_insert"
  on public.portfolio_media for insert
  to authenticated
  with check (public.is_admin());

create policy "portfolio_media_admin_update"
  on public.portfolio_media for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "portfolio_media_admin_delete"
  on public.portfolio_media for delete
  to authenticated
  using (public.is_admin());

create policy "portfolio_media_admin_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

create policy "portfolio_media_admin_insert_storage"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin());

create policy "portfolio_media_admin_update_storage"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin())
  with check (bucket_id = 'portfolio-media' and public.is_admin());

create policy "portfolio_media_admin_delete_storage"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

-- Grants --------------------------------------------------------------------

revoke all on table public.portfolio_messages from anon, authenticated;
revoke all on table public.admin_audit_log from anon, authenticated;
grant select, update, delete on table public.portfolio_messages to authenticated;
grant select on table public.admin_audit_log to authenticated;

revoke all on function public.send_portfolio_message(text, text, text, text, text) from public;
grant execute on function public.send_portfolio_message(text, text, text, text, text) to anon, authenticated;

revoke all on function public.admin_save_portfolio_draft(uuid, jsonb, integer) from public, anon;
grant execute on function public.admin_save_portfolio_draft(uuid, jsonb, integer) to authenticated;

revoke all on function public.admin_publish_portfolio(uuid, jsonb, jsonb, uuid[], integer) from public, anon;
grant execute on function public.admin_publish_portfolio(uuid, jsonb, jsonb, uuid[], integer) to authenticated;

revoke all on function public.admin_unpublish_portfolio(uuid, integer) from public, anon;
grant execute on function public.admin_unpublish_portfolio(uuid, integer) to authenticated;

revoke all on function public.admin_mark_message_read(uuid, boolean) from public, anon;
grant execute on function public.admin_mark_message_read(uuid, boolean) to authenticated;
