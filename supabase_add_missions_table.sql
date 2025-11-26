-- Create missions table
DROP TABLE IF EXISTS public.missions CASCADE;
CREATE TABLE public.missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown content for the lecture
    xp_reward INTEGER NOT NULL DEFAULT 100,
    estimated_time TEXT NOT NULL DEFAULT '5 min',
    region TEXT, -- e.g., 'Lombardia'
    province_id TEXT, -- e.g., 'MI'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create mission_questions table
DROP TABLE IF EXISTS public.mission_questions CASCADE;
CREATE TABLE public.mission_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_answer INTEGER NOT NULL, -- Index
    explanation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_questions ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read missions
CREATE POLICY "Everyone can read missions" ON public.missions
    FOR SELECT
    USING (true);

CREATE POLICY "Everyone can read mission questions" ON public.mission_questions
    FOR SELECT
    USING (true);

-- Only admins can manage missions
CREATE POLICY "Admins can manage missions" ON public.missions
    FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins can manage mission questions" ON public.mission_questions
    FOR ALL
    USING (public.is_admin());
