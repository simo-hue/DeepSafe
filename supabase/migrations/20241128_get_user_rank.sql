-- Function to get the current user's global rank based on XP
CREATE OR REPLACE FUNCTION get_user_rank()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_xp INTEGER;
    v_rank INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN 0;
    END IF;

    -- Get user's XP
    SELECT xp INTO v_user_xp
    FROM profiles
    WHERE id = v_user_id;

    IF v_user_xp IS NULL THEN
        RETURN 0;
    END IF;

    -- Calculate rank: Count users with more XP + 1
    SELECT COUNT(*) + 1
    INTO v_rank
    FROM profiles
    WHERE xp > v_user_xp;

    RETURN v_rank;
END;
$$;
