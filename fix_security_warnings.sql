-- Fix Security Warnings: Set search_path for all SECURITY DEFINER functions

-- 1. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, xp, current_hearts, highest_streak, is_premium, referral_code)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    0,
    5,
    0,
    false,
    upper(substring(md5(random()::text) from 1 for 6))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. increment_credits
CREATE OR REPLACE FUNCTION public.increment_credits(p_user_id UUID, p_amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. purchase_item
CREATE OR REPLACE FUNCTION public.purchase_item(p_user_id UUID, p_item_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_item_cost INT;
  v_effect_type TEXT;
  v_effect_value INT;
  v_item_stock INT;
  v_is_limited BOOLEAN;
  v_user_credits INT;
  v_user_inventory JSONB;
  v_reward_type TEXT;
  v_reward_value INT;
  v_random_roll FLOAT;
BEGIN
  -- 1. Get Item Details from DB
  SELECT cost, effect_type, effect_value, stock, is_limited
  INTO v_item_cost, v_effect_type, v_effect_value, v_item_stock, v_is_limited
  FROM public.shop_items
  WHERE id = p_item_id;

  IF v_item_cost IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid Item ID');
  END IF;

  -- 2. Check Stock
  IF v_is_limited AND v_item_stock <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Esaurito! (Out of Stock)');
  END IF;

  -- 3. Check User Credits
  SELECT credits, inventory INTO v_user_credits, v_user_inventory
  FROM profiles
  WHERE id = p_user_id;

  IF v_user_credits < v_item_cost THEN
    RETURN jsonb_build_object('success', false, 'message', 'Crediti insufficienti');
  END IF;

  -- 4. Deduct Credits
  UPDATE profiles
  SET credits = credits - v_item_cost
  WHERE id = p_user_id;

  -- 5. Deduct Stock (if limited)
  IF v_is_limited THEN
     UPDATE public.shop_items
     SET stock = stock - 1
     WHERE id = p_item_id;
  END IF;

  -- 6. Apply Item Effect
  IF v_effect_type = 'streak_freeze' THEN
     UPDATE profiles SET streak_freezes = streak_freezes + 1 WHERE id = p_user_id;
     v_reward_type := 'streak_freeze';
     v_reward_value := 1;

  ELSIF v_effect_type = 'restore_lives' THEN
     UPDATE profiles SET current_hearts = 5 WHERE id = p_user_id;
     v_reward_type := 'lives';
     v_reward_value := 5;

  ELSIF v_effect_type = 'mystery_box' THEN
     -- Server-Side Random Logic
     v_random_roll := random();
     
     IF v_random_roll < 0.5 THEN
        -- 50% Chance: 50 XP
        UPDATE profiles SET xp = xp + 50 WHERE id = p_user_id;
        v_reward_type := 'xp';
        v_reward_value := 50;
     ELSIF v_random_roll < 0.8 THEN
        -- 30% Chance: Refund 25 Credits (Small Loss/Win)
        UPDATE profiles SET credits = credits + 25 WHERE id = p_user_id;
        v_reward_type := 'credits';
        v_reward_value := 25;
     ELSE
        -- 20% Chance: Jackpot (Streak Freeze)
        UPDATE profiles SET streak_freezes = streak_freezes + 1 WHERE id = p_user_id;
        v_reward_type := 'streak_freeze';
        v_reward_value := 1;
     END IF;

  ELSE
     -- Default: Add to Inventory
     IF v_user_inventory IS NULL THEN
        UPDATE profiles SET inventory = jsonb_build_array(p_item_id) WHERE id = p_user_id;
     ELSE
        IF NOT (v_user_inventory @> jsonb_build_array(p_item_id)) THEN
            UPDATE profiles SET inventory = v_user_inventory || jsonb_build_array(p_item_id) WHERE id = p_user_id;
        END IF;
     END IF;
     v_reward_type := 'item';
     v_reward_value := 0;
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'new_credits', (SELECT credits FROM profiles WHERE id = p_user_id),
    'reward_type', v_reward_type,
    'reward_value', v_reward_value
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. complete_level
CREATE OR REPLACE FUNCTION public.complete_level(
  p_user_id UUID,
  p_level_id TEXT,
  p_score INT,
  p_earned_xp INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_day INT;
  v_next_level_id TEXT;
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

-- 6. claim_mission_reward
CREATE OR REPLACE FUNCTION public.claim_mission_reward(p_user_id UUID, p_mission_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_xp_reward INT;
  v_current_xp INT;
  v_streak INT;
  v_quiz_count INT;
BEGIN
  IF p_mission_id = '1' THEN v_xp_reward := 50; -- Daily Login
  ELSIF p_mission_id = '2' THEN v_xp_reward := 150; -- Quiz Master
  ELSIF p_mission_id = '3' THEN v_xp_reward := 200; -- Perfect Streak
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Invalid Mission ID');
  END IF;

  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_user_id 
    AND (inventory @> jsonb_build_array('mission_' || p_mission_id))
  ) THEN
     RETURN jsonb_build_object('success', false, 'message', 'Already claimed');
  END IF;

  IF p_mission_id = '2' THEN
     SELECT COUNT(*) INTO v_quiz_count FROM user_progress WHERE user_id = p_user_id;
     IF v_quiz_count < 3 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Condition not met: Need 3 quizzes');
     END IF;
  ELSIF p_mission_id = '3' THEN
     SELECT highest_streak INTO v_streak FROM profiles WHERE id = p_user_id;
     IF v_streak < 3 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Condition not met: Need streak 3');
     END IF;
  END IF;

  UPDATE profiles 
  SET xp = xp + v_xp_reward,
      inventory = CASE 
        WHEN inventory IS NULL THEN jsonb_build_array('mission_' || p_mission_id)
        ELSE inventory || jsonb_build_array('mission_' || p_mission_id)
      END
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'new_xp', (SELECT xp FROM profiles WHERE id = p_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. redeem_code
CREATE OR REPLACE FUNCTION public.redeem_code(code text)
RETURNS json AS $$
DECLARE
  referrer_id uuid;
  referrer_hearts int;
BEGIN
  SELECT id, current_hearts INTO referrer_id, referrer_hearts
  FROM profiles
  WHERE referral_code = upper(code);

  IF referrer_id IS NULL THEN
    RETURN '{"success": false, "message": "Invalid code"}'::json;
  END IF;

  IF referrer_id = auth.uid() THEN
    RETURN '{"success": false, "message": "Cannot redeem your own code"}'::json;
  END IF;

  UPDATE profiles
  SET current_hearts = least(5, current_hearts + 1)
  WHERE id = referrer_id;

  UPDATE profiles
  SET xp = xp + 100
  WHERE id = auth.uid();

  RETURN '{"success": true, "message": "Code redeemed! +100 XP"}'::json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. decrement_hearts
CREATE OR REPLACE FUNCTION public.decrement_hearts()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET current_hearts = greatest(0, current_hearts - 1)
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

NOTIFY pgrst, 'reload schema';
