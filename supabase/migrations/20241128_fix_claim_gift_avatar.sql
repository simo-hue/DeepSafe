-- Fix claim_gift function to check owned_avatars instead of inventory for avatar gifts
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
        UPDATE profiles SET current_hearts = LEAST(5, COALESCE(current_hearts, 0) + v_gift.amount) WHERE id = v_user_id;
    ELSIF v_gift.type = 'item' THEN
        -- Add item to inventory array
        UPDATE profiles 
        SET inventory = array_append(COALESCE(inventory, '{}'), v_gift.item_id)
        WHERE id = v_user_id;
    ELSIF v_gift.type = 'avatar' THEN
        -- Add avatar to owned_avatars array
        -- Correctly check owned_avatars for duplicates
        IF NOT (COALESCE(owned_avatars, '{}') @> ARRAY[v_gift.item_id]) THEN
             UPDATE profiles 
             SET owned_avatars = array_append(COALESCE(owned_avatars, '{}'), v_gift.item_id)
             WHERE id = v_user_id;
        END IF;
    END IF;

    -- Mark as claimed
    UPDATE gifts 
    SET is_claimed = TRUE, claimed_at = NOW()
    WHERE id = gift_id;

    RETURN '{"success": true, "message": "Gift claimed successfully"}'::jsonb;
END;
$$;
