-- Promo banners: admin-managed rotating messages shown on the public promo bar.

create table public.promo_banners (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 1 and 240),
  link_url text,
  link_label text not null default 'Create yours'
    check (char_length(link_label) between 1 and 40),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index promo_banners_active_order_idx
  on public.promo_banners (is_active, sort_order, created_at);

alter table public.promo_banners enable row level security;

create policy "promo_banners_admin_all"
  on public.promo_banners for all
  using (public.is_admin())
  with check (public.is_admin());

create trigger promo_banners_set_updated_at
  before update on public.promo_banners
  for each row execute function public.set_updated_at();

-- Public read of active banners (no direct table access for anon).
create or replace function public.get_public_promo_banners()
returns table (
  id uuid,
  message text,
  link_url text,
  link_label text,
  sort_order integer
)
language sql
security definer
stable
as $$
  select id, message, link_url, link_label, sort_order
  from public.promo_banners
  where is_active = true
  order by sort_order asc, created_at asc;
$$;

revoke all on function public.get_public_promo_banners() from public;
grant execute on function public.get_public_promo_banners() to anon, authenticated;

-- Admin: list every banner, newest first.
create or replace function public.admin_list_promo_banners()
returns table (
  id uuid,
  message text,
  link_url text,
  link_label text,
  is_active boolean,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;

  return query
  select b.id, b.message, b.link_url, b.link_label, b.is_active, b.sort_order,
         b.created_at, b.updated_at
  from public.promo_banners b
  order by b.sort_order asc, b.created_at desc;
end;
$$;

revoke all on function public.admin_list_promo_banners() from public;
grant execute on function public.admin_list_promo_banners() to authenticated;

-- Admin: create a banner.
create or replace function public.admin_create_promo_banner(
  p_message text,
  p_link_url text,
  p_link_label text,
  p_is_active boolean,
  p_sort_order integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_actor_id uuid;
  v_actor_email text;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;

  if p_message is null or char_length(trim(p_message)) = 0
     or char_length(p_message) > 240 then
    raise exception using errcode = '22023', message = 'invalid_message';
  end if;
  if p_link_label is not null
     and (char_length(trim(p_link_label)) = 0 or char_length(p_link_label) > 40) then
    raise exception using errcode = '22023', message = 'invalid_link_label';
  end if;

  insert into public.promo_banners (message, link_url, link_label, is_active, sort_order)
  values (
    trim(p_message),
    nullif(trim(coalesce(p_link_url, '')), ''),
    coalesce(nullif(trim(p_link_label), ''), 'Create yours'),
    coalesce(p_is_active, true),
    coalesce(p_sort_order, 0)
  )
  returning id into v_id;

  select id, email into v_actor_id, v_actor_email
  from public.profiles where id = auth.uid();

  insert into public.admin_audit_log (actor_id, actor_email, action, target_type, target_id, detail)
  values (
    v_actor_id,
    coalesce(v_actor_email, ''),
    'promo_banner.created',
    'promo_banner',
    v_id,
    jsonb_build_object('message', trim(p_message), 'is_active', coalesce(p_is_active, true))
  );

  return v_id;
end;
$$;

revoke all on function public.admin_create_promo_banner(text, text, text, boolean, integer) from public;
grant execute on function public.admin_create_promo_banner(text, text, text, boolean, integer) to authenticated;

-- Admin: update a banner.
create or replace function public.admin_update_promo_banner(
  p_id uuid,
  p_message text,
  p_link_url text,
  p_link_label text,
  p_is_active boolean,
  p_sort_order integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_actor_email text;
  v_exists boolean;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;

  if p_message is not null
     and (char_length(trim(p_message)) = 0 or char_length(p_message) > 240) then
    raise exception using errcode = '22023', message = 'invalid_message';
  end if;
  if p_link_label is not null
     and (char_length(trim(p_link_label)) = 0 or char_length(p_link_label) > 40) then
    raise exception using errcode = '22023', message = 'invalid_link_label';
  end if;

  select exists (select 1 from public.promo_banners where id = p_id) into v_exists;
  if not v_exists then
    raise exception using errcode = '22023', message = 'banner_not_found';
  end if;

  update public.promo_banners
  set
    message = coalesce(trim(p_message), message),
    link_url = case
      when p_link_url is null then link_url
      else nullif(trim(p_link_url), '')
    end,
    link_label = coalesce(nullif(trim(p_link_label), ''), link_label),
    is_active = coalesce(p_is_active, is_active),
    sort_order = coalesce(p_sort_order, sort_order)
  where id = p_id;

  select id, email into v_actor_id, v_actor_email
  from public.profiles where id = auth.uid();

  insert into public.admin_audit_log (actor_id, actor_email, action, target_type, target_id, detail)
  values (
    v_actor_id,
    coalesce(v_actor_email, ''),
    'promo_banner.updated',
    'promo_banner',
    p_id,
    jsonb_build_object('message', coalesce(trim(p_message), ''), 'is_active', p_is_active)
  );

  return true;
end;
$$;

revoke all on function public.admin_update_promo_banner(uuid, text, text, text, boolean, integer) from public;
grant execute on function public.admin_update_promo_banner(uuid, text, text, text, boolean, integer) to authenticated;

-- Admin: delete a banner.
create or replace function public.admin_delete_promo_banner(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_actor_email text;
  v_message text;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;

  select message into v_message from public.promo_banners where id = p_id;
  if v_message is null then
    raise exception using errcode = '22023', message = 'banner_not_found';
  end if;

  delete from public.promo_banners where id = p_id;

  select id, email into v_actor_id, v_actor_email
  from public.profiles where id = auth.uid();

  insert into public.admin_audit_log (actor_id, actor_email, action, target_type, target_id, detail)
  values (
    v_actor_id,
    coalesce(v_actor_email, ''),
    'promo_banner.deleted',
    'promo_banner',
    p_id,
    jsonb_build_object('message', v_message)
  );

  return true;
end;
$$;

revoke all on function public.admin_delete_promo_banner(uuid) from public;
grant execute on function public.admin_delete_promo_banner(uuid) to authenticated;
