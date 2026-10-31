-- Per-portfolio admin controls: an access gate and promo-banner visibility.
-- Both are independent of publication state so an admin can hide a live page or
-- prepare a banner preference before publishing.

alter table public.portfolios
  add column if not exists is_disabled boolean not null default false,
  add column if not exists promo_bar_enabled boolean not null default true;

-- Public reads --------------------------------------------------------------

create or replace function public.is_media_public(p_storage_path text)
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
      and not p.is_disabled
      and m.id = any (p.published_media_ids)
  );
$$;

-- The return type gains promo_bar_enabled, so the function is replaced rather
-- than updated. Grants are restored below.
drop function if exists public.get_public_portfolio(text);

create function public.get_public_portfolio(p_username text)
returns table (
  username text,
  content jsonb,
  media jsonb,
  published_at timestamptz,
  updated_at timestamptz,
  promo_bar_enabled boolean
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
    p.updated_at,
    p.promo_bar_enabled
  from public.portfolios p
  where p.username = lower(trim(p_username))
    and p.status = 'published'
    and not p.is_disabled
    and p.published_content is not null
  limit 1;
$$;

create or replace function public.get_public_media(p_id uuid)
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
    and not p.is_disabled
    and m.id = any (p.published_media_ids)
  limit 1;
$$;

create or replace function public.get_public_portfolios()
returns table (username text, updated_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.username, p.updated_at
  from public.portfolios p
  where p.status = 'published'
    and not p.is_disabled
  order by p.updated_at desc;
$$;

create or replace function public.send_portfolio_message(
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
    and p.status = 'published'
    and not p.is_disabled;

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

create function public.admin_set_portfolio_enabled(
  p_portfolio_id uuid,
  p_enabled boolean
)
returns table (is_disabled boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_actor_email text;
  v_username text;
  v_disabled boolean;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;
  if p_enabled is null then
    raise exception using errcode = '22023', message = 'invalid_visibility';
  end if;

  v_disabled := not p_enabled;

  update public.portfolios as p
  set is_disabled = v_disabled
  where p.id = p_portfolio_id
  returning p.username into v_username;

  if v_username is null then
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
    case
      when v_disabled then 'portfolio.disable'
      else 'portfolio.enable'
    end,
    'portfolio',
    p_portfolio_id,
    jsonb_build_object('username', v_username, 'is_disabled', v_disabled)
  );

  return query select v_disabled;
end;
$$;

create function public.admin_set_portfolio_promo_bar(
  p_portfolio_id uuid,
  p_enabled boolean
)
returns table (promo_bar_enabled boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_actor_email text;
  v_username text;
  v_promo_bar_enabled boolean;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;
  if p_enabled is null then
    raise exception using errcode = '22023', message = 'invalid_banner';
  end if;

  update public.portfolios as p
  set promo_bar_enabled = p_enabled
  where p.id = p_portfolio_id
  returning p.username, p.promo_bar_enabled
  into v_username, v_promo_bar_enabled;

  if v_username is null then
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
    case
      when v_promo_bar_enabled then 'portfolio.promo_bar_on'
      else 'portfolio.promo_bar_off'
    end,
    'portfolio',
    p_portfolio_id,
    jsonb_build_object('username', v_username, 'promo_bar_enabled', v_promo_bar_enabled)
  );

  return query select v_promo_bar_enabled;
end;
$$;

-- Grants --------------------------------------------------------------------

revoke all on function public.get_public_portfolio(text) from public;
grant execute on function public.get_public_portfolio(text) to anon, authenticated;

revoke all on function public.get_public_media(uuid) from public;
grant execute on function public.get_public_media(uuid) to anon, authenticated;

revoke all on function public.get_public_portfolios() from public;
grant execute on function public.get_public_portfolios() to anon, authenticated;

revoke all on function public.is_media_public(text) from public;
grant execute on function public.is_media_public(text) to anon, authenticated;

revoke all on function public.send_portfolio_message(text, text, text, text, text) from public;
grant execute on function public.send_portfolio_message(text, text, text, text, text) to anon, authenticated;

revoke all on function public.admin_set_portfolio_enabled(uuid, boolean) from public, anon;
grant execute on function public.admin_set_portfolio_enabled(uuid, boolean) to authenticated;

revoke all on function public.admin_set_portfolio_promo_bar(uuid, boolean) from public, anon;
grant execute on function public.admin_set_portfolio_promo_bar(uuid, boolean) to authenticated;
