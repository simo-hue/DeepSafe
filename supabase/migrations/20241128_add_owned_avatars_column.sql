-- Add owned_avatars column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS owned_avatars TEXT[] DEFAULT ARRAY['avatar_rookie'];

-- Ensure inventory column exists as well (just in case)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS inventory TEXT[] DEFAULT '{}';
