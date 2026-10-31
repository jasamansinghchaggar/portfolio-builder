-- Forced password change flag for administrator accounts created by another admin.

alter table public.profiles
  add column if not exists must_change_password boolean not null default false;

-- Owners can clear their own flag after changing their password.
grant update (must_change_password) on table public.profiles to authenticated;