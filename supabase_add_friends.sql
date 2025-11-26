-- Create friends table
create table friends (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) not null,
    friend_id uuid references profiles(id) not null,
    status text check (status in ('pending', 'accepted')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, friend_id)
);

-- Enable RLS
alter table friends enable row level security;

-- Policies
-- Users can view their own friendships (either as sender or receiver)
create policy "Users can view their own friendships"
    on friends for select
    using (auth.uid() = user_id or auth.uid() = friend_id);

-- Users can insert friend requests
create policy "Users can send friend requests"
    on friends for insert
    with check (auth.uid() = user_id);

-- Users can update status (accept) if they are the receiver
create policy "Users can accept friend requests"
    on friends for update
    using (auth.uid() = friend_id);

-- Users can delete friendships (unfriend/cancel)
create policy "Users can delete friendships"
    on friends for delete
    using (auth.uid() = user_id or auth.uid() = friend_id);
