-- ============================================================================
-- DJS TRINITY 2026 — ANUGATHA CMS DATABASE SCHEMA
-- Migration: announcements, gallery_items, admin_profiles, RLS & Storage
-- ============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ADMIN PROFILES TABLE
-- Associates Supabase Auth users with administrative roles
create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- 3. HELPER FUNCTION: IS_ADMIN
-- Security definer function avoids RLS recursion when checking admin status
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;

-- 4. ANNOUNCEMENTS TABLE
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  image_url text,
  category text default 'ALL ORDERS',
  link text,
  published boolean not null default false,
  featured boolean not null default false,
  priority integer not null default 0,
  publish_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-generate slug from title if not explicitly provided
create or replace function public.generate_announcement_slug()
returns trigger as $$
begin
  if new.slug is null or trim(new.slug) = '' then
    new.slug := lower(regexp_replace(trim(new.title), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(new.id::text from 1 for 8);
  end if;
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_announcement_slug
before insert on public.announcements
for each row execute function public.generate_announcement_slug();

-- 5. GALLERY ITEMS TABLE
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text not null,
  storage_path text,
  event_name text,
  published boolean not null default false,
  homepage_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. AUTOMATIC UPDATED_AT TRIGGER
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_announcements_updated_at
before update on public.announcements
for each row execute function public.handle_updated_at();

create or replace trigger trg_gallery_items_updated_at
before update on public.gallery_items
for each row execute function public.handle_updated_at();

-- 7. PERFORMANCE INDEXES
create index if not exists idx_announcements_public
  on public.announcements (published, publish_at, priority desc, created_at desc);

create index if not exists idx_announcements_slug
  on public.announcements (slug);

create index if not exists idx_gallery_items_public
  on public.gallery_items (published, homepage_featured, display_order asc);

create index if not exists idx_gallery_items_order
  on public.gallery_items (display_order asc, created_at desc);

-- 8. ROW LEVEL SECURITY (RLS)
alter table public.admin_profiles enable row level security;
alter table public.announcements enable row level security;
alter table public.gallery_items enable row level security;

-- Admin Profiles Policies
drop policy if exists "Admin profiles self read or admin check" on public.admin_profiles;
create policy "Admin profiles self read or admin check"
  on public.admin_profiles
  for select
  using (
    auth.uid() = user_id or public.is_admin()
  );

drop policy if exists "Only super admin can modify admin profiles" on public.admin_profiles;
create policy "Only super admin can modify admin profiles"
  on public.admin_profiles
  for all
  using (public.is_admin());

-- Announcements Policies
-- Public Users: Can SELECT only published announcements where publish_at is now or in the past (or null)
drop policy if exists "Public users can view published announcements" on public.announcements;
create policy "Public users can view published announcements"
  on public.announcements
  for select
  using (
    published = true and (publish_at is null or publish_at <= now())
  );

-- Admin Users: Can perform ALL operations on announcements
drop policy if exists "Admins have full access to announcements" on public.announcements;
create policy "Admins have full access to announcements"
  on public.announcements
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Gallery Items Policies
-- Public Users: Can SELECT published gallery items
drop policy if exists "Public users can view published gallery items" on public.gallery_items;
create policy "Public users can view published gallery items"
  on public.gallery_items
  for select
  using (published = true);

-- Admin Users: Can perform ALL operations on gallery items
drop policy if exists "Admins have full access to gallery items" on public.gallery_items;
create policy "Admins have full access to gallery items"
  on public.gallery_items
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 9. SUPABASE STORAGE SETUP
-- Create 'gallery' bucket if storage schema is available
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

-- Public can view/read gallery objects
drop policy if exists "Public Read Gallery Images" on storage.objects;
create policy "Public Read Gallery Images"
  on storage.objects
  for select
  using (bucket_id = 'gallery');

-- Authorized Admins can upload, modify, and delete gallery images
drop policy if exists "Admins Upload Gallery Images" on storage.objects;
create policy "Admins Upload Gallery Images"
  on storage.objects
  for insert
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admins Update Gallery Images" on storage.objects;
create policy "Admins Update Gallery Images"
  on storage.objects
  for update
  using (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admins Delete Gallery Images" on storage.objects;
create policy "Admins Delete Gallery Images"
  on storage.objects
  for delete
  using (bucket_id = 'gallery' and public.is_admin());

-- ============================================================================
-- OPTIONAL SAMPLE SEED DATA
-- (You can run these insert queries if you want initial data in your database)
-- ============================================================================

/*
insert into public.announcements (title, description, category, link, published, featured, priority)
values
  ('Registrations for Anugatha 2026 are now open', 'Be a part of the journey. Explore, create and contribute across the six orders.', 'ALL ORDERS', '/registrations', true, true, 10),
  ('Design Submission Deadline', 'The final call for visual narratives and poster systems.', 'UTKARSH', null, true, false, 5),
  ('Orientation Session', 'A first gathering for every new traveller into the archive.', 'AAKAR', null, true, false, 3),
  ('Workshop: Visual Storytelling', 'From artefact to image: shaping a shared archive.', 'PRAGYA', null, true, false, 2),
  ('Team Reveal: Maritime Passage', 'Meet the people charting Sindhu''s next passage.', 'SINDHU', null, true, false, 1);
*/
