-- 1. Create Loot Table
CREATE TABLE IF NOT EXISTS public.mystery_box_loot (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    box_item_id TEXT REFERENCES public.shop_items(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('xp', 'credits', 'item', 'streak_freeze', 'lives')),
    reward_value INT DEFAULT 0,
    weight INT DEFAULT 1,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS Policies
ALTER TABLE public.mystery_box_loot ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read loot" ON public.mystery_box_loot;
CREATE POLICY "Public read loot" ON public.mystery_box_loot FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage loot" ON public.mystery_box_loot;
CREATE POLICY "Admins manage loot" ON public.mystery_box_loot FOR ALL USING (public.is_admin());

-- 3. Seed Default Loot for 'mystery_box'
-- Clear existing to avoid dupes if re-run
DELETE FROM public.mystery_box_loot WHERE box_item_id = 'mystery_box';

INSERT INTO public.mystery_box_loot (box_item_id, reward_type, reward_value, weight, description) VALUES
('mystery_box', 'xp', 50, 50, '50 XP'),
('mystery_box', 'credits', 25, 30, '25 Credits Refund'),
('mystery_box', 'streak_freeze', 1, 20, 'Streak Freeze Jackpot');

-- 4. Update purchase_item RPC
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
  v_total_weight INT;
  v_current_weight INT;
  v_loot_record RECORD;
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
     -- Dynamic Loot Logic
     SELECT SUM(weight) INTO v_total_weight FROM public.mystery_box_loot WHERE box_item_id = p_item_id;
     
     IF v_total_weight IS NULL OR v_total_weight = 0 THEN
        -- Fallback if no loot defined: 50 XP
        UPDATE profiles SET xp = xp + 50 WHERE id = p_user_id;
        v_reward_type := 'xp';
        v_reward_value := 50;
     ELSE
        v_random_roll := floor(random() * v_total_weight);
        v_current_weight := 0;

        FOR v_loot_record IN SELECT * FROM public.mystery_box_loot WHERE box_item_id = p_item_id ORDER BY id LOOP
            v_current_weight := v_current_weight + v_loot_record.weight;
            IF v_random_roll < v_current_weight THEN
                -- Winner!
                v_reward_type := v_loot_record.reward_type;
                v_reward_value := v_loot_record.reward_value;
                
                -- Apply Reward
                IF v_reward_type = 'xp' THEN
                    UPDATE profiles SET xp = xp + v_reward_value WHERE id = p_user_id;
                ELSIF v_reward_type = 'credits' THEN
                    UPDATE profiles SET credits = credits + v_reward_value WHERE id = p_user_id;
                ELSIF v_reward_type = 'streak_freeze' THEN
                    UPDATE profiles SET streak_freezes = streak_freezes + v_reward_value WHERE id = p_user_id;
                ELSIF v_reward_type = 'lives' THEN
                    UPDATE profiles SET current_hearts = LEAST(5, current_hearts + v_reward_value) WHERE id = p_user_id;
                ELSIF v_reward_type = 'item' THEN
                    -- Add item to inventory (v_reward_value is ignored for items usually, or could be item ID if we change schema, but for now let's assume 'item' type isn't fully supported in loot table without item ID column. 
                    -- Actually, let's assume reward_value is 0 and we might need a 'reward_item_id' column for items. 
                    -- For simplicity, let's stick to currency/stats for now, or use description as item ID? No, that's messy.
                    -- Let's just support XP, Credits, Streak Freeze, Lives for now as per existing logic.
                    NULL; 
                END IF;
                
                EXIT; -- Stop loop
            END IF;
        END LOOP;
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
