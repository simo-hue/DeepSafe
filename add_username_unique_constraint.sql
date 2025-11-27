-- Add unique constraint to username column in profiles table
ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- Add comment
COMMENT ON CONSTRAINT profiles_username_key ON profiles IS 'Ensures usernames are unique across all users';
