-- Create table for storing push subscriptions
create table if not exists public.push_subscriptions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamp with time zone not null default now(),
  primary key (id),
  unique (user_id, subscription)
);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Policies
create policy "Users can insert their own subscriptions"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- Only service role (backend) can select all (for sending notifications)
-- But users might need to see if they are subscribed?
create policy "Users can view their own subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);
