-- Focal point for portfolio images. Renderers crop with object-fit: cover, so
-- the stored point decides which part of the image stays visible. Defaults to
-- the centre, which matches the previous object-position behaviour.

alter table public.portfolio_media
  add column focal_x numeric(4, 3) not null default 0.5
    check (focal_x >= 0 and focal_x <= 1),
  add column focal_y numeric(4, 3) not null default 0.5
    check (focal_y >= 0 and focal_y <= 1);

-- Expose the focal point in the published media map. Keep the existing return
-- shape (including promo_bar_enabled) and only extend the media JSON.
create or replace function public.get_public_portfolio(p_username text)
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
    p.promo_bar_enabled
  from public.portfolios p
  where p.username = lower(trim(p_username))
    and p.status = 'published'
    and not p.is_disabled
    and p.published_content is not null
  limit 1;
$$;
