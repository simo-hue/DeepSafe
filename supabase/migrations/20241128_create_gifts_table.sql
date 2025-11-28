-- Create gifts table
CREATE TABLE gifts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Nullable for global gifts if we want, but let's stick to specific users or broadcast logic in app
    type TEXT NOT NULL CHECK (type IN ('credits', 'xp', 'item')),
    amount INTEGER DEFAULT 0,
    item_id TEXT, -- If type is item
    message TEXT DEFAULT 'UN REGALO DAI FOUNDER',
    is_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    claimed_at TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Users can view their own gifts
CREATE POLICY "Users can view their own gifts"
    ON gifts FOR SELECT
    USING (auth.uid() = user_id);

-- Only system/admin can insert (we'll handle this via admin check in app or separate policy if needed, but for now service role or admin check in RLS)
-- Actually, let's allow admins to insert. But since we don't have a strict admin role in auth.users (it's in profiles), we might need a function or just rely on app logic + RLS if we trust the client (we shouldn't).
-- Better: Create a function to send gifts that checks admin status.

CREATE OR REPLACE FUNCTION send_gift(
    target_user_id UUID, 
    gift_type TEXT, 
    gift_amount INTEGER, 
    gift_message TEXT,
    gift_item_id TEXT DEFAULT NULL
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
    INSERT INTO gifts (user_id, type, amount, message, item_id)
    VALUES (target_user_id, gift_type, gift_amount, gift_message, gift_item_id)
    RETURNING id INTO v_gift_id;

    RETURN v_gift_id;
END;
$$;

-- Function to claim gift
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
