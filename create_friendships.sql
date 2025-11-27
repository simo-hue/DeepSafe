-- Create Friendships Table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. View: Users can view their own friendships (either as sender or receiver)
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.friendships;
CREATE POLICY "Users can view their own friendships"
ON public.friendships FOR SELECT
USING (
    auth.uid() = user_id OR auth.uid() = friend_id
);

-- 2. Insert: Users can insert requests where they are the sender
DROP POLICY IF EXISTS "Users can send friend requests" ON public.friendships;
CREATE POLICY "Users can send friend requests"
ON public.friendships FOR INSERT
WITH CHECK (
    auth.uid() = user_id
);

-- 3. Update: Users can update friendships they are part of (e.g. accepting)
DROP POLICY IF EXISTS "Users can update their own friendships" ON public.friendships;
CREATE POLICY "Users can update their own friendships"
ON public.friendships FOR UPDATE
USING (
    auth.uid() = user_id OR auth.uid() = friend_id
);

-- 4. Delete: Users can delete friendships they are part of
DROP POLICY IF EXISTS "Users can delete their own friendships" ON public.friendships;
CREATE POLICY "Users can delete their own friendships"
ON public.friendships FOR DELETE
USING (
    auth.uid() = user_id OR auth.uid() = friend_id
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
