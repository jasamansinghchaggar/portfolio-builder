-- Forced password change flag for administrator accounts created by another admin.

alter table public.profiles
  add column if not exists must_change_password boolean not null default false;

-- Owners can clear their own flag after changing their password.
-- (RLS policy profiles_update_own already permits row updates by the owner.)