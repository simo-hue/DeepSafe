-- Create quizzes table (if we were moving away from mock data entirely)
-- For now, we'll just ensure the structure is ready for future migration
-- and add the badges table which is new.

create table if not exists badges (
  id text primary key,
  name text not null,
  description text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  badge_id text references badges(id) not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, badge_id)
);

alter table user_badges enable row level security;

create policy "Users can view their own badges."
  on user_badges for select
  using ( auth.uid() = user_id );

-- Seed some badges
insert into badges (id, name, description, image_url) values
('shield_bearer', 'Shield Bearer', 'Secured account with 2FA', '🛡️'),
('scam_slayer', 'Scam Slayer', 'Completed the Scam Detector module', '⚔️'),
('eagle_eye', 'Eagle Eye', 'Spotted 5 Deepfakes', '🦅')
on conflict (id) do nothing;
