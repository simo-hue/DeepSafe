-- Add has_seen_tutorial column to profiles table
ALTER TABLE profiles ADD COLUMN has_seen_tutorial boolean DEFAULT false;

-- Add comment
COMMENT ON COLUMN profiles.has_seen_tutorial IS 'Tracks if the user has completed the first-time tutorial';
