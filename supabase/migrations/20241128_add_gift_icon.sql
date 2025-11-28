-- Add icon_url to gifts table
ALTER TABLE gifts ADD COLUMN icon_url TEXT;

-- Update send_gift function to include icon_url
CREATE OR REPLACE FUNCTION send_gift(
    target_user_id UUID, 
    gift_type TEXT, 
    gift_amount INTEGER, 
    gift_message TEXT,
    gift_item_id TEXT DEFAULT NULL,
    gift_icon_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_gift_id UUID;
BEGIN
    -- Check if sender is admin
    SELECT is_admin INTO v_is_admin
    FROM profiles
    WHERE id = auth.uid();

    IF v_is_admin IS NOT TRUE THEN
        RAISE EXCEPTION 'Access Denied: Only admins can send gifts.';
    END IF;

    -- Insert Gift
    INSERT INTO gifts (user_id, type, amount, message, item_id, icon_url)
    VALUES (target_user_id, gift_type, gift_amount, gift_message, gift_item_id, gift_icon_url)
    RETURNING id INTO v_gift_id;

    RETURN v_gift_id;
END;
$$;
