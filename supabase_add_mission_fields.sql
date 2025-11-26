-- Add 'level' and 'description' columns to the 'missions' table

ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS level text DEFAULT 'SEMPLICE',
ADD COLUMN IF NOT EXISTS description text;

-- Add a check constraint for the level enum if desired, or just handle it in the app
-- ALTER TABLE missions ADD CONSTRAINT missions_level_check CHECK (level IN ('TUTORIAL', 'SEMPLICE', 'DIFFICILE', 'BOSS'));
