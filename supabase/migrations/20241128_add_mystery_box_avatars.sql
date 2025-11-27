-- Migration: Add support for Avatar rewards in Mystery Box

-- 1. Update check constraint to allow 'avatar'
ALTER TABLE mystery_box_loot DROP CONSTRAINT IF EXISTS mystery_box_loot_reward_type_check;
ALTER TABLE mystery_box_loot ADD CONSTRAINT mystery_box_loot_reward_type_check 
    CHECK (reward_type IN ('credits', 'xp', 'streak_freeze', 'lives', 'avatar'));

-- 2. Add reward_text column to mystery_box_loot
ALTER TABLE mystery_box_loot ADD COLUMN IF NOT EXISTS reward_text text;

-- 2. Update purchase_item function to handle 'avatar' reward type
DROP FUNCTION IF EXISTS purchase_item(uuid, text);
CREATE OR REPLACE FUNCTION purchase_item(p_user_id uuid, p_item_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item_cost int;
    v_user_credits int;
    v_loot record;
    v_total_weight int;
    v_random_weight int;
    v_current_weight int;
    v_reward_type text;
    v_reward_value int;
    v_reward_text text;
    v_owned_avatars text[];
BEGIN
    -- Check item cost
    SELECT cost INTO v_item_cost FROM shop_items WHERE id = p_item_id;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Item not found');
    END IF;

    -- Check user credits
    SELECT credits, owned_avatars INTO v_user_credits, v_owned_avatars FROM profiles WHERE id = p_user_id;
    IF v_user_credits < v_item_cost THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient credits');
    END IF;

    -- Deduct credits
    UPDATE profiles SET credits = credits - v_item_cost WHERE id = p_user_id;

    -- Handle Mystery Box
    IF p_item_id = 'mystery_box' THEN
        -- Calculate total weight
        SELECT SUM(weight) INTO v_total_weight FROM mystery_box_loot WHERE box_id = p_item_id;
        
        -- Pick random weight
        v_random_weight := floor(random() * v_total_weight + 1);
        v_current_weight := 0;

        -- Select loot
        FOR v_loot IN SELECT * FROM mystery_box_loot WHERE box_id = p_item_id ORDER BY weight DESC LOOP
            v_current_weight := v_current_weight + v_loot.weight;
            IF v_random_weight <= v_current_weight THEN
                v_reward_type := v_loot.reward_type;
                v_reward_value := v_loot.reward_value;
                v_reward_text := v_loot.reward_text;
                EXIT;
            END IF;
        END LOOP;

        -- Grant Reward
        IF v_reward_type = 'credits' THEN
            UPDATE profiles SET credits = credits + v_reward_value WHERE id = p_user_id;
            RETURN json_build_object(
                'success', true, 
                'message', 'Mystery Box opened!', 
                'reward', json_build_object('type', 'credits', 'value', v_reward_value)
            );
        ELSIF v_reward_type = 'avatar' THEN
            -- Check if already owned
            IF v_reward_text = ANY(v_owned_avatars) THEN
                -- Duplicate: Do nothing
                RETURN json_build_object(
                    'success', true, 
                    'message', 'Duplicate avatar found. No reward.', 
                    'reward', json_build_object('type', 'avatar_duplicate', 'value', 0)
                );
            ELSE
                -- Add avatar
                UPDATE profiles SET owned_avatars = array_append(owned_avatars, v_reward_text) WHERE id = p_user_id;
                RETURN json_build_object(
                    'success', true, 
                    'message', 'New Avatar Unlocked!', 
                    'reward', json_build_object('type', 'avatar', 'value', v_reward_text)
                );
            END IF;
        ELSE
             -- Fallback
             RETURN json_build_object('success', true, 'message', 'Mystery Box opened (Empty)');
        END IF;
    ELSE
        -- Normal Item Purchase (Generic placeholder)
        RETURN json_build_object('success', true, 'message', 'Item purchased');
    END IF;
END;
$$;

-- 3. Seed Avatar Loot
-- Ensure mystery_box exists
INSERT INTO shop_items (id, name, description, cost, icon, type, effect_type, is_limited)
VALUES ('mystery_box', 'Cassa Crittografata', 'Contiene premi casuali', 50, '🎁', 'box', 'mystery_box', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO mystery_box_loot (box_id, reward_type, reward_value, reward_text, weight, description)
VALUES
('mystery_box', 'avatar', 0, 'avatar_ninja', 30, 'Avatar: Cyber Ninja (Rare)'),
('mystery_box', 'avatar', 0, 'avatar_hacker', 10, 'Avatar: Elite Hacker (Epic)'),
('mystery_box', 'avatar', 0, 'avatar_architect', 1, 'Avatar: Architetto (Legendary)'),
('mystery_box', 'avatar', 0, 'avatar_rookie', 50, 'Avatar: Recluta (Common)'),
('mystery_box', 'credits', 100, NULL, 40, '100 NeuroCredits'),
('mystery_box', 'credits', 500, NULL, 10, '500 NeuroCredits');
