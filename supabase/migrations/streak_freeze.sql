-- Add streak_freeze_active column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS streak_freeze_active BOOLEAN DEFAULT FALSE;

-- Update RLS policies if necessary (usually existing update policy covers all columns, but good to verify)
-- Assuming users can read their own profile and service role can update all.
