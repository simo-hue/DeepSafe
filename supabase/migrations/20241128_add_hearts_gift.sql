-- Update check constraint to include 'hearts'
ALTER TABLE gifts DROP CONSTRAINT gifts_type_check;
ALTER TABLE gifts ADD CONSTRAINT gifts_type_check CHECK (type IN ('credits', 'xp', 'item', 'hearts'));

-- Update claim_gift function to handle hearts
CREATE OR REPLACE FUNCTION claim_gift(gift_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_gift RECORD;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    -- Get gift and verify ownership
    SELECT * INTO v_gift
    FROM gifts
    WHERE id = gift_id AND user_id = v_user_id;

    IF v_gift IS NULL THEN
        RETURN '{"success": false, "message": "Gift not found"}'::jsonb;
    END IF;

    IF v_gift.is_claimed THEN
        RETURN '{"success": false, "message": "Gift already claimed"}'::jsonb;
    END IF;

    -- Apply rewards
    IF v_gift.type = 'credits' THEN
        UPDATE profiles SET credits = COALESCE(credits, 0) + v_gift.amount WHERE id = v_user_id;
    ELSIF v_gift.type = 'xp' THEN
        UPDATE profiles SET xp = COALESCE(xp, 0) + v_gift.amount WHERE id = v_user_id;
    ELSIF v_gift.type = 'hearts' THEN
        -- Add hearts, capping at 5 (or maybe allow overflow? Let's cap at 5 for now as per game rules usually, or maybe +amount)
        -- User request says "number of amount of heart", implying +N. 
        -- Usually hearts are capped at 5. But a gift might be special.
        -- Let's stick to standard logic: current_hearts + amount. If it goes over 5, so be it? 
        -- Or maybe the game logic strictly enforces 5.
        -- Let's look at `handle_new_user`: `current_hearts integer default 5`.
        -- Let's look at `decrement_hearts`: `greatest(0, current_hearts - 1)`.
        -- Let's assume we can go above 5 for gifts, or maybe cap at 5. 
        -- "gift also a number of amount of heart" -> sounds like +3 hearts.
        -- If I have 2, I get 5. If I have 5, do I get 8?
        -- Let's cap at 5 for safety unless specified otherwise, OR allow overflow if that's a "premium" feature.
        -- Actually, usually lives are capped. Let's cap at 5.
        UPDATE profiles SET current_hearts = LEAST(5, COALESCE(current_hearts, 0) + v_gift.amount) WHERE id = v_user_id;
    ELSIF v_gift.type = 'item' THEN
        -- Add item to inventory array
        UPDATE profiles 
        SET inventory = array_append(COALESCE(inventory, '{}'), v_gift.item_id)
        WHERE id = v_user_id;
    END IF;

    -- Mark as claimed
    UPDATE gifts 
    SET is_claimed = TRUE, claimed_at = NOW()
    WHERE id = gift_id;

    RETURN '{"success": true, "message": "Gift claimed successfully"}'::jsonb;
END;
$$;
