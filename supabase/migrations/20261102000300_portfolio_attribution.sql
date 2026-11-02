-- Per-portfolio attribution visibility. Each portfolio can hide the
-- "Made with {APP_NAME}" credit independently, controlled by admins.

alter table public.portfolios
  add column show_attribution boolean not null default true;

-- Expose the flag in the public portfolio payload.
drop function if exists public.get_public_portfolio(text);

create or replace function public.get_public_portfolio(p_username text)
returns table (
  username text,
  content jsonb,
  media jsonb,
  published_at timestamptz,
  updated_at timestamptz,
  promo_bar_enabled boolean,
  show_attribution boolean
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
            'fileName', m.file_name,
            'focalX', m.focal_x,
            'focalY', m.focal_y
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
    p.promo_bar_enabled,
    p.show_attribution
  from public.portfolios p
  where p.username = lower(trim(p_username))
    and p.status = 'published'
    and not p.is_disabled
    and p.published_content is not null
  limit 1;
$$;

-- Admin: toggle attribution for a single portfolio, with an audit entry.
create or replace function public.admin_set_portfolio_attribution(
  p_portfolio_id uuid,
  p_enabled boolean
)
returns table (show_attribution boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_actor_email text;
  v_username text;
  v_show_attribution boolean;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;
  if p_enabled is null then
    raise exception using errcode = '22023', message = 'invalid_attribution';
  end if;

  update public.portfolios as p
  set show_attribution = p_enabled
  where p.id = p_portfolio_id
  returning p.username, p.show_attribution
  into v_username, v_show_attribution;

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
      when v_show_attribution then 'portfolio.attribution_on'
      else 'portfolio.attribution_off'
    end,
    'portfolio',
    p_portfolio_id,
    jsonb_build_object('username', v_username, 'show_attribution', v_show_attribution)
  );

  return query select v_show_attribution;
end;
$$;

revoke all on function public.admin_set_portfolio_attribution(uuid, boolean) from public, anon;
grant execute on function public.admin_set_portfolio_attribution(uuid, boolean) to authenticated;
