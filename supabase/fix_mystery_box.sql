-- Fix for Mystery Box "UNKNOWN" reward issue
-- This function ensures that the reward object is correctly returned to the client.
-- UPDATED: Returns flat reward_type and reward_value to match client expectation.

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
                'reward_type', 'credits',
                'reward_value', v_reward_value
            );
        ELSIF v_reward_type = 'avatar' THEN
            -- Check if already owned
            IF v_reward_text = ANY(v_owned_avatars) THEN
                -- Duplicate: Do nothing
                RETURN json_build_object(
                    'success', true, 
                    'message', 'Duplicate avatar found. No reward.', 
                    'reward_type', 'avatar_duplicate',
                    'reward_value', 0
                );
            ELSE
                -- Add avatar
                UPDATE profiles SET owned_avatars = array_append(owned_avatars, v_reward_text) WHERE id = p_user_id;
                RETURN json_build_object(
                    'success', true, 
                    'message', 'New Avatar Unlocked!', 
                    'reward_type', 'avatar',
                    'reward_value', v_reward_text
                );
            END IF;
        ELSE
             -- Fallback
             RETURN json_build_object(
                 'success', true, 
                 'message', 'Mystery Box opened (Empty)',
                 'reward_type', 'none',
                 'reward_value', 0
             );
        END IF;
    ELSE
        -- Normal Item Purchase (Generic placeholder)
        RETURN json_build_object('success', true, 'message', 'Item purchased');
    END IF;
END;
$$;
