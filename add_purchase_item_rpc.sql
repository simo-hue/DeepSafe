CREATE OR REPLACE FUNCTION purchase_item(p_user_id UUID, p_item_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_cost INT;
  v_effect_type TEXT;
  v_effect_value INT;
  v_user_credits INT;
  v_current_inventory JSONB;
  v_new_inventory JSONB;
BEGIN
  -- Get item details
  SELECT cost, effect_type, effect_value INTO v_cost, v_effect_type, v_effect_value
  FROM shop_items WHERE id = p_item_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Item not found');
  END IF;

  -- Get user credits
  SELECT credits, inventory INTO v_user_credits, v_current_inventory
  FROM profiles WHERE id = p_user_id;

  IF v_user_credits < v_cost THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient credits');
  END IF;

  -- Deduct credits
  UPDATE profiles SET credits = credits - v_cost WHERE id = p_user_id;

  -- Apply Effect
  IF v_effect_type = 'streak_freeze' THEN
    UPDATE profiles SET streak_freezes = streak_freezes + COALESCE(v_effect_value, 1) WHERE id = p_user_id;
  ELSIF v_effect_type = 'restore_lives' THEN
    UPDATE profiles SET current_hearts = 5 WHERE id = p_user_id; -- Assuming 5 is max
  ELSIF v_effect_type = 'mystery_box' THEN
     -- Simple logic: Grant 50 XP (as per client logic fallback)
     UPDATE profiles SET xp = xp + 50 WHERE id = p_user_id;
  ELSE
    -- Add to inventory
    -- Handle JSONB array append
    IF v_current_inventory IS NULL OR jsonb_typeof(v_current_inventory) != 'array' THEN
        v_new_inventory := jsonb_build_array(p_item_id);
    ELSE
        v_new_inventory := v_current_inventory || jsonb_build_array(p_item_id);
    END IF;
    UPDATE profiles SET inventory = v_new_inventory WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Purchase successful');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
