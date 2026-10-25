-- Qualify table columns in RPCs that return columns with the same names.
-- PostgreSQL treats RETURNS TABLE output names as PL/pgSQL variables, so
-- unqualified references such as `revision = revision + 1` are ambiguous
-- (SQLSTATE 42702) and make draft saves/publish/unpublish fail.

create or replace function public.save_portfolio_draft(
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

  update public.portfolios as p
  set
    draft_content = p_content,
    revision = p.revision + 1,
    last_saved_at = now()
  where p.id = p_portfolio_id
    and p.user_id = v_user
    and p.revision = p_revision
  returning p.revision, p.last_saved_at into v_revision, v_saved_at;

  if v_revision is null then
    if exists (
      select 1 from public.portfolios p
      where p.id = p_portfolio_id and p.user_id = v_user
    ) then
      raise exception using errcode = '40001', message = 'revision_conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'portfolio_not_found';
  end if;

  return query select v_revision, v_saved_at;
end;
$$;

create or replace function public.publish_portfolio(
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
  v_user uuid := (select auth.uid());
  v_media_ids uuid[];
  v_revision integer;
  v_published_at timestamptz;
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'not_authenticated';
  end if;

  if jsonb_typeof(p_content) <> 'object'
     or jsonb_typeof(p_published_content) <> 'object'
     or octet_length(p_content::text) > 262144
     or octet_length(p_published_content::text) > 262144 then
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
    and p.user_id = v_user
    and p.revision = p_revision
  returning p.revision, p.published_at into v_revision, v_published_at;

  if v_revision is null then
    if exists (
      select 1 from public.portfolios p
      where p.id = p_portfolio_id and p.user_id = v_user
    ) then
      raise exception using errcode = '40001', message = 'revision_conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'portfolio_not_found';
  end if;

  return query select v_revision, v_published_at;
end;
$$;

create or replace function public.unpublish_portfolio(
  p_portfolio_id uuid,
  p_revision integer
)
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

  update public.portfolios as p
  set
    status = 'unpublished',
    published_media_ids = '{}',
    revision = p.revision + 1
  where p.id = p_portfolio_id
    and p.user_id = v_user
    and p.revision = p_revision
  returning p.revision into v_revision;

  if v_revision is null then
    if exists (
      select 1 from public.portfolios p
      where p.id = p_portfolio_id and p.user_id = v_user
    ) then
      raise exception using errcode = '40001', message = 'revision_conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'portfolio_not_found';
  end if;

  return query select v_revision;
end;
$$;

revoke all on function public.save_portfolio_draft(uuid, jsonb, integer) from public, anon;
grant execute on function public.save_portfolio_draft(uuid, jsonb, integer) to authenticated;

revoke all on function public.publish_portfolio(uuid, jsonb, jsonb, uuid[], integer) from public, anon;
grant execute on function public.publish_portfolio(uuid, jsonb, jsonb, uuid[], integer) to authenticated;

revoke all on function public.unpublish_portfolio(uuid, integer) from public, anon;
grant execute on function public.unpublish_portfolio(uuid, integer) to authenticated;
