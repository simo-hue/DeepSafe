-- Add 'level' and 'description' columns to the 'missions' table
ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS level text DEFAULT 'SEMPLICE',
ADD COLUMN IF NOT EXISTS description text;

-- Add 'type' and 'image_url' columns to the 'mission_questions' table
ALTER TABLE mission_questions
ADD COLUMN IF NOT EXISTS type text DEFAULT 'multiple_choice',
ADD COLUMN IF NOT EXISTS image_url text;

-- Add check constraints if desired
-- ALTER TABLE missions ADD CONSTRAINT missions_level_check CHECK (level IN ('TUTORIAL', 'SEMPLICE', 'DIFFICILE', 'BOSS'));
-- ALTER TABLE mission_questions ADD CONSTRAINT mission_questions_type_check CHECK (type IN ('multiple_choice', 'true_false', 'image_true_false'));
