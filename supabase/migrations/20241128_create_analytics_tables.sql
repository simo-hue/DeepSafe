-- Create XP Ledger table
CREATE TABLE IF NOT EXISTS xp_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source TEXT NOT NULL, -- 'mission', 'level', 'bonus', 'admin'
    details JSONB, -- e.g., { mission_id: '...' }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create User Activities table
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'mission_complete', 'level_complete', 'badge_earned', 'item_purchased'
    details JSONB, -- e.g., { mission_title: '...', xp_earned: 100 }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own ledger" ON xp_ledger;
CREATE POLICY "Users can view their own ledger" ON xp_ledger
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own activities" ON user_activities;
CREATE POLICY "Users can view their own activities" ON user_activities
    FOR SELECT USING (auth.uid() = user_id);

-- Function to get advanced stats (Server-Side Calculation)
CREATE OR REPLACE FUNCTION get_advanced_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_xp_trend JSONB;
    v_mission_distribution JSONB;
    v_recent_activity JSONB;
    v_skills JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'Not authenticated');
    END IF;

    -- 1. XP Trend (Last 7 Days)
    -- This aggregates XP earned per day for the last 7 days
    SELECT jsonb_agg(t)
    INTO v_xp_trend
    FROM (
        SELECT
            to_char(date_trunc('day', created_at), 'DD/MM') as date,
            SUM(amount) as daily_xp
        FROM xp_ledger
        WHERE user_id = v_user_id
          AND created_at > NOW() - INTERVAL '7 days'
        GROUP BY 1
        ORDER BY date_trunc('day', created_at) ASC
    ) t;

    -- 2. Mission Distribution
    -- Counts completed missions by type (derived from activity details or mission table joins)
    -- For now, we'll assume 'details->>mission_type' exists in user_activities or we join with missions table
    -- Simplified: We'll query user_activities for 'mission_complete' and group by a hypothetical type
    -- Since we don't have mission type in activity yet, we'll mock it or use 'details->>type' if we add it.
    -- Let's assume we store 'type' in details.
    SELECT jsonb_agg(t)
    INTO v_mission_distribution
    FROM (
        SELECT
            COALESCE(details->>'type', 'Generico') as name,
            COUNT(*) as value
        FROM user_activities
        WHERE user_id = v_user_id
          AND activity_type = 'mission_complete'
        GROUP BY 1
    ) t;

    -- 3. Recent Activity
    SELECT jsonb_agg(t)
    INTO v_recent_activity
    FROM (
        SELECT
            activity_type,
            details,
            created_at
        FROM user_activities
        WHERE user_id = v_user_id
        ORDER BY created_at DESC
        LIMIT 10
    ) t;

    -- 4. Skills (Mocked for now, or derived from mission types)
    -- In a real scenario, missions would have 'skill_tags' (Combat, Tech, etc.)
    -- We'll return a default structure if no data, or calculate based on mission types if available.
    -- For this iteration, we'll return the static structure but with values derived from mission counts if possible.
    -- Let's keep it simple: Return null and let frontend handle or mock if empty.
    v_skills := '[]'::jsonb;

    RETURN jsonb_build_object(
        'xp_trend', COALESCE(v_xp_trend, '[]'::jsonb),
        'mission_distribution', COALESCE(v_mission_distribution, '[]'::jsonb),
        'recent_activity', COALESCE(v_recent_activity, '[]'::jsonb),
        'skills', v_skills
    );
END;
$$;
