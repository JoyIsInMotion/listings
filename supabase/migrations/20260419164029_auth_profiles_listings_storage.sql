drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.user_profiles cascade;

drop table if exists public.listings cascade;

drop table if exists public.listing_photos cascade;

drop policy if exists "Listing owners can add photos to the bucket." on storage.objects;
drop policy if exists "Listing owners can update photos in the bucket." on storage.objects;
drop policy if exists "Listing owners can delete photos from the bucket." on storage.objects;

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  location text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listing_photos (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(id) on delete cascade,
  object_path text not null unique,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_profiles_email_idx on public.user_profiles (email);
create index listings_owner_id_idx on public.listings (owner_id);
create index listing_photos_listing_id_idx on public.listing_photos (listing_id);
create index listing_photos_sort_order_idx on public.listing_photos (listing_id, sort_order);

alter table public.user_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.user_profiles
  for select
  using (true);

create policy "Users can insert their own profile."
  on public.user_profiles
  for insert
  with check ((select auth.uid()) = id);

create policy "Users can update own profile."
  on public.user_profiles
  for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Anyone can view listings."
  on public.listings
  for select
  using (true);

create policy "Users can insert own listings."
  on public.listings
  for insert
  with check ((select auth.uid()) = owner_id);

create policy "Users can update own listings."
  on public.listings
  for update
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Users can delete own listings."
  on public.listings
  for delete
  using ((select auth.uid()) = owner_id);

create policy "Anyone can view listing photos."
  on public.listing_photos
  for select
  using (true);

create policy "Listing owners can add photos."
  on public.listing_photos
  for insert
  with check (
    exists (
      select 1
      from public.listings listings
      where listings.id = listing_id
        and listings.owner_id = (select auth.uid())
    )
  );

create policy "Listing owners can update photos."
  on public.listing_photos
  for update
  using (
    exists (
      select 1
      from public.listings listings
      where listings.id = listing_id
        and listings.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.listings listings
      where listings.id = listing_id
        and listings.owner_id = (select auth.uid())
    )
  );

create policy "Listing owners can delete photos."
  on public.listing_photos
  for delete
  using (
    exists (
      select 1
      from public.listings listings
      where listings.id = listing_id
        and listings.owner_id = (select auth.uid())
    )
  );

create function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.user_profiles (id, name, email, phone_number)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    new.email,
    new.phone
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    updated_at = now();

create policy "Listing owners can add photos to the bucket."
  on storage.objects
  for insert
  with check (
    bucket_id = 'listing-photos'
    and exists (
      select 1
      from public.listings listings
      where listings.id::text = split_part(name, '/', 1)
        and listings.owner_id = (select auth.uid())
    )
  );

create policy "Listing owners can update photos in the bucket."
  on storage.objects
  for update
  using (
    bucket_id = 'listing-photos'
    and exists (
      select 1
      from public.listings listings
      where listings.id::text = split_part(name, '/', 1)
        and listings.owner_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'listing-photos'
    and exists (
      select 1
      from public.listings listings
      where listings.id::text = split_part(name, '/', 1)
        and listings.owner_id = (select auth.uid())
    )
  );

create policy "Listing owners can delete photos from the bucket."
  on storage.objects
  for delete
  using (
    bucket_id = 'listing-photos'
    and exists (
      select 1
      from public.listings listings
      where listings.id::text = split_part(name, '/', 1)
        and listings.owner_id = (select auth.uid())
    )
  );
