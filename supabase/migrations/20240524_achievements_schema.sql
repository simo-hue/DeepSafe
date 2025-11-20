-- Update badges table
alter table badges 
add column if not exists category text default 'General',
add column if not exists xp_bonus integer default 50;

-- Create missions table
create table if not exists missions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  target_action text not null, -- e.g., 'complete_quiz', 'login_streak'
  target_count integer not null default 1,
  reward_xp integer not null default 100,
  frequency text not null check (frequency in ('daily', 'weekly', 'one_time')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create user_missions table to track progress
create table if not exists user_missions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  mission_id uuid references missions(id) not null,
  current_count integer default 0,
  is_completed boolean default false,
  claimed_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, mission_id)
);

-- Enable RLS
alter table missions enable row level security;
alter table user_missions enable row level security;

-- Policies
create policy "Missions are viewable by everyone."
  on missions for select
  to authenticated
  using ( true );

create policy "Users can view their own mission progress."
  on user_missions for select
  using ( auth.uid() = user_id );

create policy "Users can update their own mission progress."
  on user_missions for update
  using ( auth.uid() = user_id );

create policy "Users can insert their own mission progress."
  on user_missions for insert
  with check ( auth.uid() = user_id );

-- Seed Missions
insert into missions (title, target_action, target_count, reward_xp, frequency) values
('Daily Login', 'login', 1, 50, 'daily'),
('Quiz Master', 'complete_quiz', 3, 150, 'daily'),
('Perfect Streak', 'perfect_score', 1, 200, 'weekly');
