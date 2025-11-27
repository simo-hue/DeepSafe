-- Fix get_advanced_stats function grouping error with strict SQL compliance
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
    -- Using subquery to ensure strict GROUP BY compliance
    SELECT jsonb_agg(t)
    INTO v_xp_trend
    FROM (
        SELECT
            to_char(day_date, 'DD/MM') as date,
            daily_xp
        FROM (
            SELECT
                date_trunc('day', created_at) as day_date,
                SUM(amount) as daily_xp
            FROM xp_ledger
            WHERE user_id = v_user_id
              AND created_at > NOW() - INTERVAL '7 days'
            GROUP BY date_trunc('day', created_at)
        ) daily_stats
        ORDER BY day_date ASC
    ) t;

    -- 2. Mission Distribution
    -- Using subquery for strict compliance
    SELECT jsonb_agg(t)
    INTO v_mission_distribution
    FROM (
        SELECT
            mission_type as name,
            COUNT(*) as value
        FROM (
            SELECT COALESCE(details->>'type', 'Generico') as mission_type
            FROM user_activities
            WHERE user_id = v_user_id
              AND activity_type = 'mission_complete'
        ) types
        GROUP BY mission_type
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

    -- 4. Skills (Mocked for now)
    v_skills := '[]'::jsonb;

    RETURN jsonb_build_object(
        'xp_trend', COALESCE(v_xp_trend, '[]'::jsonb),
        'mission_distribution', COALESCE(v_mission_distribution, '[]'::jsonb),
        'recent_activity', COALESCE(v_recent_activity, '[]'::jsonb),
        'skills', v_skills
    );
END;
$$;
