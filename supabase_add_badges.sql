-- Add earned_badges column to profiles table
-- Stores an array of objects: [{ id: "badge_id", earned_at: "ISO_DATE" }]
alter table profiles
add column earned_badges jsonb default '[]'::jsonb;

comment on column profiles.earned_badges is 'List of badges earned by the user with timestamps';
