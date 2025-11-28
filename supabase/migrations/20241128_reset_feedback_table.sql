-- Drop table and policies to ensure clean slate
DROP TABLE IF EXISTS feedback CASCADE;

-- Create feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'like', 'dislike')),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
    device_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own feedback" ON feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own feedback" ON feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all feedback" ON feedback FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can update feedback" ON feedback FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can delete feedback" ON feedback FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
