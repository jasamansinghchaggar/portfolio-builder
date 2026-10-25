-- Publish a sanitised public snapshot separately from the editable draft.
-- Hidden sections and their media remain private to the owner.

drop function if exists public.publish_portfolio(uuid, jsonb, uuid[], integer);

create function public.publish_portfolio(
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

  update public.portfolios
  set
    draft_content = p_content,
    published_content = p_published_content,
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

revoke all on function public.publish_portfolio(uuid, jsonb, jsonb, uuid[], integer) from public, anon;
grant execute on function public.publish_portfolio(uuid, jsonb, jsonb, uuid[], integer) to authenticated;
