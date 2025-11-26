-- Create badges table
DROP TABLE IF EXISTS public.badges CASCADE;
CREATE TABLE public.badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Region', 'Streak', 'XP', 'Special'
    xp_reward INTEGER NOT NULL DEFAULT 0,
    rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'legendary'
    condition_type TEXT NOT NULL, -- 'region_master', 'streak_milestone', 'xp_milestone', 'first_mission'
    condition_value TEXT, -- Can be a number stored as string or a region name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read badges
CREATE POLICY "Everyone can read badges" ON public.badges
    FOR SELECT
    USING (true);

-- Only admins can insert/update/delete badges
CREATE POLICY "Admins can manage badges" ON public.badges
    FOR ALL
    USING (public.is_admin());

-- Seed Data from badgesData.ts
INSERT INTO public.badges (id, name, description, icon, category, xp_reward, rarity, condition_type, condition_value)
VALUES
    ('first_blood', 'Primo Sangue', 'Completa la tua prima missione.', '🩸', 'Special', 50, 'common', 'first_mission', NULL),
    ('streak_3', 'Fuoco di Paglia', 'Raggiungi una serie di 3 giorni.', '🔥', 'Streak', 100, 'common', 'streak_milestone', '3'),
    ('streak_7', 'Settimana di Fuoco', 'Raggiungi una serie di 7 giorni.', '🧨', 'Streak', 250, 'rare', 'streak_milestone', '7'),
    ('streak_30', 'Leggenda Immortale', 'Raggiungi una serie di 30 giorni.', '👑', 'Streak', 1000, 'legendary', 'streak_milestone', '30'),
    ('xp_1000', 'White Hat', 'Guadagna 1.000 XP totali.', '🎩', 'XP', 200, 'common', 'xp_milestone', '1000'),
    ('xp_5000', 'Cyber Sentinel', 'Guadagna 5.000 XP totali.', '🛡️', 'XP', 500, 'rare', 'xp_milestone', '5000'),
    ('master_piemonte', 'Maestro del Piemonte', 'Completa tutte le province del Piemonte.', '🏔️', 'Region', 300, 'rare', 'region_master', 'Piemonte'),
    ('master_lombardia', 'Maestro della Lombardia', 'Completa tutte le province della Lombardia.', '🏭', 'Region', 300, 'rare', 'region_master', 'Lombardia'),
    ('master_veneto', 'Maestro del Veneto', 'Completa tutte le province del Veneto.', '🎭', 'Region', 300, 'rare', 'region_master', 'Veneto'),
    ('master_toscana', 'Maestro della Toscana', 'Completa tutte le province della Toscana.', '🍷', 'Region', 300, 'rare', 'region_master', 'Toscana'),
    ('master_lazio', 'Maestro del Lazio', 'Completa tutte le province del Lazio.', '🏛️', 'Region', 300, 'rare', 'region_master', 'Lazio'),
    ('master_campania', 'Maestro della Campania', 'Completa tutte le province della Campania.', '🍕', 'Region', 300, 'rare', 'region_master', 'Campania'),
    ('master_sicilia', 'Maestro della Sicilia', 'Completa tutte le province della Sicilia.', '🍋', 'Region', 300, 'rare', 'region_master', 'Sicilia')
ON CONFLICT (id) DO NOTHING;
