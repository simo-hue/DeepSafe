-- Update handle_new_user to prioritize username from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, xp, current_hearts, highest_streak, is_premium, referral_code)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'full_name',
      new.email,
      'Agente ' || substring(new.id::text from 1 for 4)
    ),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    0,
    5,
    0,
    false,
    upper(substring(md5(random()::text) from 1 for 6))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
