-- Run this entire file in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  team_name text not null check (char_length(team_name) between 2 and 100),
  area text not null check (char_length(area) between 2 and 120),
  manager_name text not null check (char_length(manager_name) between 2 and 100),
  phone text not null check (char_length(phone) between 6 and 20),
  players text not null check (char_length(players) between 2 and 3000),
  payment_method text not null check (payment_method in ('Nagad','bKash')),
  transaction_id text not null unique check (char_length(transaction_id) between 5 and 40),
  notes text check (notes is null or char_length(notes) <= 1000),
  status text not null default 'pending' check (status in ('pending','approved','rejected'))
);

alter table public.registrations enable row level security;
alter table public.admin_users enable row level security;

-- Security-definer helper allows RLS policies to check the allowlist without
-- granting ordinary users direct read access to admin_users.
create or replace function public.is_tournament_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_tournament_admin() from public;
grant execute on function public.is_tournament_admin() to authenticated;

-- Enforce the 16-team application cap in the database, including concurrent submissions.
create or replace function public.enforce_registration_cap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(20271016);
  if (select count(*) from public.registrations) >= 16 then
    raise exception 'Tournament registration is full';
  end if;
  return new;
end;
$$;
drop trigger if exists registrations_cap_before_insert on public.registrations;
create trigger registrations_cap_before_insert
before insert on public.registrations
for each row execute function public.enforce_registration_cap();

-- Public visitors may submit an application, but cannot read applications or set their own status.
drop policy if exists "public can submit registrations" on public.registrations;
create policy "public can submit registrations"
on public.registrations for insert to anon, authenticated
with check (
  status = 'pending'
  and char_length(team_name) between 2 and 100
  and char_length(area) between 2 and 120
  and char_length(manager_name) between 2 and 100
  and char_length(phone) between 6 and 20
  and payment_method in ('Nagad','bKash')
);

-- Only user IDs explicitly inserted into admin_users can read/update registrations.
drop policy if exists "admins can read registrations" on public.registrations;
create policy "admins can read registrations"
on public.registrations for select to authenticated
using (public.is_tournament_admin());

drop policy if exists "admins can update registrations" on public.registrations;
create policy "admins can update registrations"
on public.registrations for update to authenticated
using (public.is_tournament_admin())
with check (public.is_tournament_admin());

-- No client-side policies for admin_users: only project owner/service role should manage this table.
-- The anon key is safe to expose only because RLS is enabled and the policies above are in place.
