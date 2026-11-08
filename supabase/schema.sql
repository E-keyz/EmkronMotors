-- =====================================================================
-- EMKRON MOTORS - Supabase setup (run once: SQL Editor -> New query)
-- Columns mirror the CarListing type the app already uses.
-- =====================================================================

create table if not exists public.listings (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,
  title         text not null,
  brand         text not null,
  model         text not null,
  year          int  not null,
  price         bigint not null,
  condition     text not null default 'Nigerian Used'
                check (condition in ('Foreign Used','Nigerian Used','Brand New')),
  category      text not null default 'Sedan',
  state         text not null default 'Abuja (FCT)',
  area          text,
  mileage       int,
  mileage_unit  text not null default 'km' check (mileage_unit in ('km','miles')),
  transmission  text not null default 'Automatic',
  fuel_type     text not null default 'Petrol',
  color         text,
  vin           text,
  description   text,
  images        text[] not null default '{}',
  features      text[] not null default '{}',
  status        text not null default 'active'
                check (status in ('pending','active','sold','rejected')),
  views_count   int not null default 0,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists listings_created_idx on public.listings (created_at desc);
create index if not exists listings_status_idx  on public.listings (status);

create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists listings_touch on public.listings;
create trigger listings_touch before update on public.listings
for each row execute function public.touch_updated_at();

-- Admins: only accounts listed here can change data (used by the admin panel in the next step)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Row Level Security
alter table public.listings enable row level security;
alter table public.admins   enable row level security;

drop policy if exists "Public can view active and sold listings" on public.listings;
drop policy if exists "Admins can view all listings"             on public.listings;
drop policy if exists "Admins can insert listings"               on public.listings;
drop policy if exists "Admins can update listings"               on public.listings;
drop policy if exists "Admins can delete listings"               on public.listings;
drop policy if exists "Admins can read own row"                  on public.admins;

create policy "Public can view active and sold listings" on public.listings for select using (status in ('active','sold'));
create policy "Admins can view all listings"             on public.listings for select using (public.is_admin());
create policy "Admins can insert listings"               on public.listings for insert with check (public.is_admin());
create policy "Admins can update listings"               on public.listings for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete listings"               on public.listings for delete using (public.is_admin());
create policy "Admins can read own row"                  on public.admins   for select using (user_id = auth.uid());

-- Photo storage (public bucket; only admins can upload or delete)
insert into storage.buckets (id, name, public) values ('car-images', 'car-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view car images"   on storage.objects;
drop policy if exists "Admins can upload car images" on storage.objects;
drop policy if exists "Admins can update car images" on storage.objects;
drop policy if exists "Admins can delete car images" on storage.objects;

create policy "Public can view car images"   on storage.objects for select using (bucket_id = 'car-images');
create policy "Admins can upload car images" on storage.objects for insert with check (bucket_id = 'car-images' and public.is_admin());
create policy "Admins can update car images" on storage.objects for update using (bucket_id = 'car-images' and public.is_admin());
create policy "Admins can delete car images" on storage.objects for delete using (bucket_id = 'car-images' and public.is_admin());

-- ---------------------------------------------------------------------
-- OPTIONAL: one test car so you can confirm the site is reading from Supabase
-- (delete it later from Table Editor)
--
-- insert into public.listings (title, brand, model, year, price, condition, category, state, area, mileage, color, description, images, features)
-- values ('Foreign Used 2019 Toyota Camry SE', 'Toyota', 'Camry', 2019, 14500000, 'Foreign Used', 'Sedan', 'Abuja (FCT)', 'Wuse 2', 52000, 'Black',
--   'Clean Tokunbo Camry, accident free.',
--   array['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&auto=format&fit=crop&q=80'],
--   array['Reverse Camera','Leather Seats','Alloy Wheels']);
