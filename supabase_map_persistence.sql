-- Add unlocked_provinces column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS unlocked_provinces text[] DEFAULT ARRAY['CB', 'IS', 'AQ', 'CH', 'PE', 'TE', 'BA', 'BT', 'BR', 'FG', 'LE', 'TA'];

-- Update existing profiles to have the default unlocked provinces if null
UPDATE profiles 
SET unlocked_provinces = ARRAY['CB', 'IS', 'AQ', 'CH', 'PE', 'TE', 'BA', 'BT', 'BR', 'FG', 'LE', 'TA']
WHERE unlocked_provinces IS NULL;
