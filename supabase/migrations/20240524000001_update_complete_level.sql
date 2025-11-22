-- Function to handle level completion logic atomically
-- Updated to include p_earned_xp parameter
CREATE OR REPLACE FUNCTION complete_level(
  p_user_id UUID,
  p_level_id TEXT,
  p_score INT,
  p_earned_xp INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_day INT;
  v_next_level_id TEXT;
  v_current_xp INT;
  v_new_xp INT;
BEGIN
  -- 1. Update User Profile XP
  UPDATE public.profiles
  SET xp = COALESCE(xp, 0) + p_earned_xp,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING xp INTO v_new_xp;

  -- 2. Mark Current Level as Completed
  INSERT INTO public.user_progress (user_id, quiz_id, score, status, completed_at)
  VALUES (p_user_id, p_level_id, p_score, 'completed', NOW())
  ON CONFLICT (user_id, quiz_id)
  DO UPDATE SET
    score = GREATEST(user_progress.score, EXCLUDED.score),
    status = 'completed',
    completed_at = NOW();

  -- 3. Unlock Next Level
  SELECT day_number INTO v_current_day
  FROM public.levels
  WHERE id = p_level_id;

  SELECT id INTO v_next_level_id
  FROM public.levels
  WHERE day_number = v_current_day + 1
  LIMIT 1;

  IF v_next_level_id IS NOT NULL THEN
    INSERT INTO public.user_progress (user_id, quiz_id, score, status)
    VALUES (p_user_id, v_next_level_id, 0, 'active')
    ON CONFLICT (user_id, quiz_id)
    DO NOTHING;
  END IF;

  RETURN json_build_object(
    'success', TRUE,
    'new_xp', v_new_xp,
    'next_level_id', v_next_level_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$;