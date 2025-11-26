-- Ensure columns exist (idempotent)
ALTER TABLE mission_questions ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE mission_questions ADD COLUMN IF NOT EXISTS type text DEFAULT 'multiple_choice';

-- Force PostgREST to reload the schema cache
-- This is necessary after DDL changes for the API to recognize new columns
NOTIFY pgrst, 'reload schema';
