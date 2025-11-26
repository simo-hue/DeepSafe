-- Add shop-related columns to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS streak_freezes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN profiles.credits IS 'NeuroCredits currency for the shop';
COMMENT ON COLUMN profiles.streak_freezes IS 'Consumable item to protect streak';
COMMENT ON COLUMN profiles.inventory IS 'List of owned items and power-ups';
