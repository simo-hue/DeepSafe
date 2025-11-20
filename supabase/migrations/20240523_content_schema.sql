-- Create modules table
create table if not exists modules (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  theme_color text,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create levels table
create table if not exists levels (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references modules(id) not null,
  day_number integer not null,
  title text not null,
  is_boss_level boolean default false,
  xp_reward integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(day_number)
);

-- Create questions table
create table if not exists questions (
  id uuid default uuid_generate_v4() primary key,
  level_id uuid references levels(id) not null,
  text text not null,
  options text[] not null,
  correct_index integer not null,
  explanation text,
  type text check (type in ('text', 'image')) default 'text',
  image_url text,
  hotspots jsonb, -- For visual questions
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table modules enable row level security;
alter table levels enable row level security;
alter table questions enable row level security;

-- Public read access
create policy "Public modules are viewable by everyone." on modules for select using (true);
create policy "Public levels are viewable by everyone." on levels for select using (true);
create policy "Public questions are viewable by everyone." on questions for select using (true);

-- RPC: Get User Saga State
create or replace function get_user_saga_state()
returns json as $$
declare
  user_progress_data json;
  levels_data json;
begin
  -- Get completed levels for the user
  select json_agg(row_to_json(up))
  into user_progress_data
  from (
    select distinct on (quiz_id) quiz_id -- quiz_id in user_progress maps to level_id here (conceptually, though schema says quiz_id is text)
    from user_progress
    where user_id = auth.uid()
  ) up;

  -- Get all levels with module info
  select json_agg(row_to_json(l))
  into levels_data
  from (
    select 
      l.id, 
      l.day_number, 
      l.title, 
      l.is_boss_level, 
      l.xp_reward,
      m.title as module_title,
      m.theme_color,
      m.order_index
    from levels l
    join modules m on l.module_id = m.id
    order by l.day_number asc
  ) l;

  return json_build_object(
    'completed_level_ids', coalesce(user_progress_data, '[]'::json),
    'levels', coalesce(levels_data, '[]'::json)
  );
end;
$$ language plpgsql security definer;
