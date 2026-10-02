-- Apply only to the dedicated forrent Supabase project.
begin;

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  source text not null check (length(source) between 1 and 120),
  source_id text not null check (length(source_id) between 1 and 300),
  name text not null check (length(name) between 1 and 200),
  area text not null default '',
  city text not null,
  state text not null,
  address text,
  unit text,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  rent integer not null check (rent >= 0),
  monthly_fees integer not null default 0 check (monthly_fees >= 0),
  fees_complete boolean not null default false,
  deposit integer check (deposit >= 0),
  beds integer not null check (beds between 0 and 30),
  baths numeric(3,1) not null check (baths >= 0),
  sqft integer not null check (sqft >= 0),
  amenities text[] not null default '{}',
  description text not null default '',
  image_url text check (image_url is null or image_url ~ '^https://'),
  source_url text check (source_url is null or source_url ~ '^https://'),
  attribution text,
  status text not null default 'inactive' check (status in ('active','inactive','pending')),
  available_on date,
  last_seen_at timestamptz,
  synced_at timestamptz not null default now(),
  unique (source,source_id)
);
create index listings_city_active_idx on public.listings (city,rent) where status='active';
alter table public.listings enable row level security;
revoke all on public.listings from anon, authenticated;
grant select on public.listings to anon, authenticated;
create policy listings_public_read on public.listings for select to anon, authenticated using (status='active');

create table public.renter_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null default '{}' check (jsonb_typeof(preferences)='object' and octet_length(preferences::text)<8192),
  created_at timestamptz not null default now()
);
create table public.saved_homes (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_key text not null check (length(listing_key) between 1 and 300),
  created_at timestamptz not null default now(),
  primary key(user_id,listing_key)
);
create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query text not null check (length(query) <= 1500),
  filters jsonb not null check (jsonb_typeof(filters)='object' and octet_length(filters::text)<8192),
  created_at timestamptz not null default now()
);
create index saved_searches_user_idx on public.saved_searches(user_id);

alter table public.renter_profiles enable row level security;
alter table public.saved_homes enable row level security;
alter table public.saved_searches enable row level security;
revoke all on public.renter_profiles,public.saved_homes,public.saved_searches from anon,authenticated;
grant select,insert,update,delete on public.renter_profiles,public.saved_homes,public.saved_searches to authenticated;

create policy profile_owner on public.renter_profiles for all to authenticated
  using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy saved_homes_owner on public.saved_homes for all to authenticated
  using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy saved_searches_owner on public.saved_searches for all to authenticated
  using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
create table private.feed_sources (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  enabled boolean not null default false,
  agreement_reference text,
  last_success_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'
);
alter table private.feed_sources enable row level security;
revoke all on private.feed_sources from public,anon,authenticated;
grant usage on schema private to service_role;
grant all on private.feed_sources to service_role;
grant all on public.listings to service_role;

commit;
