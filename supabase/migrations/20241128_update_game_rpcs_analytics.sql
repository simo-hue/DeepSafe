-- Update complete_level to log to ledger and activities
CREATE OR REPLACE FUNCTION complete_level(
    p_user_id UUID,
    p_level_id TEXT,
    p_score INTEGER,
    p_earned_xp INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_xp INTEGER;
    v_new_xp INTEGER;
    v_current_credits INTEGER;
BEGIN
    -- Get current stats
    SELECT xp, credits INTO v_current_xp, v_current_credits
    FROM profiles
    WHERE id = p_user_id;

    -- Calculate new stats
    v_new_xp := COALESCE(v_current_xp, 0) + p_earned_xp;
    
    -- Update profile
    UPDATE profiles
    SET 
        xp = v_new_xp,
        credits = COALESCE(v_current_credits, 0) + p_earned_xp, -- Dual Ledger: XP = Lifetime, Credits = Spendable
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log to XP Ledger
    INSERT INTO xp_ledger (user_id, amount, source, details)
    VALUES (p_user_id, p_earned_xp, 'level', jsonb_build_object('level_id', p_level_id, 'score', p_score));

    -- Log to User Activities
    INSERT INTO user_activities (user_id, activity_type, details)
    VALUES (p_user_id, 'level_complete', jsonb_build_object('level_id', p_level_id, 'score', p_score, 'xp_earned', p_earned_xp));

    RETURN jsonb_build_object('success', true, 'new_xp', v_new_xp);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Update claim_mission_reward to log to ledger and activities
CREATE OR REPLACE FUNCTION claim_mission_reward(
    p_user_id UUID,
    p_mission_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_mission_xp INTEGER;
    v_current_xp INTEGER;
    v_new_xp INTEGER;
    v_current_credits INTEGER;
    v_mission_title TEXT;
BEGIN
    -- Get mission details (assuming missions table exists, otherwise mock or pass as arg)
    -- For now, we'll fetch from missions table if it exists, or default to a value.
    -- Since we have a missions table in the schema:
    SELECT xp_reward, title INTO v_mission_xp, v_mission_title
    FROM missions
    WHERE id = p_mission_id;

    IF v_mission_xp IS NULL THEN
        -- Fallback if mission not found (shouldn't happen in strict mode)
        v_mission_xp := 50; 
        v_mission_title := 'Missione';
    END IF;

    -- Get current stats
    SELECT xp, credits INTO v_current_xp, v_current_credits
    FROM profiles
    WHERE id = p_user_id;

    -- Calculate new stats
    v_new_xp := COALESCE(v_current_xp, 0) + v_mission_xp;

    -- Update profile
    UPDATE profiles
    SET 
        xp = v_new_xp,
        credits = COALESCE(v_current_credits, 0) + v_mission_xp,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log to XP Ledger
    INSERT INTO xp_ledger (user_id, amount, source, details)
    VALUES (p_user_id, v_mission_xp, 'mission', jsonb_build_object('mission_id', p_mission_id));

    -- Log to User Activities
    INSERT INTO user_activities (user_id, activity_type, details)
    VALUES (p_user_id, 'mission_complete', jsonb_build_object('mission_id', p_mission_id, 'title', v_mission_title, 'xp_earned', v_mission_xp));

    RETURN jsonb_build_object('success', true, 'new_xp', v_new_xp);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
