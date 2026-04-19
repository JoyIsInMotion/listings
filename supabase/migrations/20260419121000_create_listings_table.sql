create table if not exists public.listings (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  photo_url text not null,
  featured boolean not null default false
);

alter table public.listings enable row level security;

-- Simple public access policy for demo app without auth/users.
drop policy if exists "Public full access to listings" on public.listings;
create policy "Public full access to listings"
  on public.listings
  for all
  to anon, authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on table public.listings to anon, authenticated;
grant usage, select on sequence public.listings_id_seq to anon, authenticated;

insert into public.listings (title, description, price, photo_url, featured)
select *
from (
  values
    ('Atomic Habits', 'Build good habits and break bad ones with practical systems.', 18.99, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f', true),
    ('Deep Work', 'A guide to focused success in a distracted world.', 16.50, 'https://images.unsplash.com/photo-1512820790803-83ca734da794', true),
    ('The Pragmatic Programmer', 'Classic software craftsmanship lessons for modern developers.', 29.00, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', true),
    ('Clean Code', 'Principles and patterns for writing maintainable software.', 27.49, 'https://images.unsplash.com/photo-1532012197267-da84d127e765', false),
    ('Thinking, Fast and Slow', 'Behavioral psychology and decision-making explained.', 14.95, 'https://images.unsplash.com/photo-1507842217343-583bb7270b66', true),
    ('Sapiens', 'A brief history of humankind from evolution to modern society.', 19.99, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc', true),
    ('The Lean Startup', 'Build, measure, learn framework for startups.', 15.00, 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6', false),
    ('Zero to One', 'Notes on building innovative companies.', 13.75, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570', false),
    ('Hooked', 'How to build habit-forming products responsibly.', 17.20, 'https://images.unsplash.com/photo-1476275466078-4007374efbbe', false),
    ('The Design of Everyday Things', 'A practical look at intuitive product design.', 21.10, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', false),
    ('Refactoring', 'Improve existing code structure without changing behavior.', 33.00, 'https://images.unsplash.com/photo-1455885666463-25f0db2b6f5e', false),
    ('The Mythical Man-Month', 'Software project management insights that still matter.', 12.99, 'https://images.unsplash.com/photo-1513001900722-370f803f498d', false),
    ('Eloquent JavaScript', 'Modern introduction to JavaScript programming.', 24.50, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570', false),
    ('You Don''t Know JS Yet', 'Deep dive into core JavaScript language concepts.', 23.40, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d', false),
    ('The Psychology of Money', 'Timeless lessons on wealth, greed, and happiness.', 17.99, 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d', true),
    ('Start with Why', 'Leadership and communication through purpose-driven thinking.', 14.20, 'https://images.unsplash.com/photo-1463320726281-696a485928c7', false),
    ('The 4-Hour Workweek', 'Design a lifestyle-focused approach to work.', 16.99, 'https://images.unsplash.com/photo-1496104679561-38b6cb0f8fbd', false),
    ('Essentialism', 'Pursue less but better with disciplined focus.', 15.80, 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6', false),
    ('Make Time', 'Practical tactics to focus on what matters daily.', 13.60, 'https://images.unsplash.com/photo-1471970394675-613138e45da3', false),
    ('The Almanack of Naval Ravikant', 'Wealth and happiness principles for modern life.', 18.30, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', true)
) as seed_data (title, description, price, photo_url, featured)
where not exists (select 1 from public.listings);
