-- Drop all previous variations to ensure a clean slate
DROP FUNCTION IF EXISTS complete_level(uuid, text, int, int);
DROP FUNCTION IF EXISTS complete_level(text, text, int, int);

-- Re-create with TEXT inputs for maximum flexibility
-- We use explicit casting or text comparisons to avoid "operator does not exist: uuid = text"
CREATE OR REPLACE FUNCTION complete_level(
  p_user_id TEXT,
  p_level_id TEXT,
  p_score INT,
  p_earned_xp INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_uuid UUID;
  v_current_day INT;
  v_next_level_id TEXT;
  v_new_xp INT;
BEGIN
  -- Cast user_id to UUID explicitly
  BEGIN
    v_user_uuid := p_user_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'error', 'Invalid user_id format');
  END;

  -- 1. Update User Profile XP
  -- We use the UUID variable here, so UUID = UUID
  UPDATE public.profiles
  SET xp = COALESCE(xp, 0) + p_earned_xp,
      updated_at = NOW()
  WHERE id = v_user_uuid
  RETURNING xp INTO v_new_xp;

  -- 2. Mark Current Level as Completed
  -- We cast p_level_id to text explicitly just to be safe, though it is already text
  INSERT INTO public.user_progress (user_id, quiz_id, score, status, completed_at)
  VALUES (v_user_uuid, p_level_id, p_score, 'completed', NOW())
  ON CONFLICT (user_id, quiz_id)
  DO UPDATE SET
    score = GREATEST(user_progress.score, EXCLUDED.score),
    status = 'completed',
    completed_at = NOW();

  -- 3. Unlock Next Level
  -- We use id::text to compare with p_level_id (TEXT) to handle both UUID and TEXT id columns
  SELECT day_number INTO v_current_day
  FROM public.levels
  WHERE id::text = p_level_id;

  -- Find next level
  SELECT id INTO v_next_level_id
  FROM public.levels
  WHERE day_number = v_current_day + 1
  LIMIT 1;

  -- Unlock next level
  IF v_next_level_id IS NOT NULL THEN
    INSERT INTO public.user_progress (user_id, quiz_id, score, status)
    VALUES (v_user_uuid, v_next_level_id, 0, 'active')
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
