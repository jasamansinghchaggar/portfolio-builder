-- Platform settings: a singleton row for site-wide, admin-managed switches.

create table public.platform_settings (
  id boolean primary key default true check (id),
  show_attribution boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

alter table public.platform_settings enable row level security;

create policy "platform_settings_admin_all"
  on public.platform_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create trigger platform_settings_set_updated_at
  before update on public.platform_settings
  for each row execute function public.set_updated_at();

insert into public.platform_settings (id) values (true)
on conflict (id) do nothing;

-- Public read of safe settings (the table itself stays admin-only).
create or replace function public.get_public_settings()
returns table (show_attribution boolean)
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(
    (select s.show_attribution from public.platform_settings s where s.id = true),
    true
  );
$$;

revoke all on function public.get_public_settings() from public;
grant execute on function public.get_public_settings() to anon, authenticated;

-- Admin: update the singleton and record an audit entry.
create or replace function public.admin_update_platform_settings(
  p_show_attribution boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_actor_email text;
  v_previous boolean;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'not_admin';
  end if;

  if p_show_attribution is null then
    raise exception using errcode = '22023', message = 'invalid_settings';
  end if;

  select s.show_attribution into v_previous
  from public.platform_settings s
  where s.id = true;

  insert into public.platform_settings (id, show_attribution, updated_by)
  values (true, p_show_attribution, auth.uid())
  on conflict (id) do update
    set show_attribution = excluded.show_attribution,
        updated_by = excluded.updated_by;

  select p.id, p.email into v_actor_id, v_actor_email
  from public.profiles p
  where p.id = auth.uid();

  insert into public.admin_audit_log (
    actor_id,
    actor_email,
    action,
    target_type,
    target_id,
    detail
  )
  values (
    v_actor_id,
    coalesce(v_actor_email, ''),
    'platform_setting.updated',
    'platform_setting',
    null,
    jsonb_build_object(
      'key', 'show_attribution',
      'from', coalesce(v_previous, true),
      'to', p_show_attribution
    )
  );

  return true;
end;
$$;

revoke all on function public.admin_update_platform_settings(boolean) from public;
grant execute on function public.admin_update_platform_settings(boolean) to authenticated;
