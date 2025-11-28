-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
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
-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback" 
ON feedback FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback (optional, maybe for a history view later)
CREATE POLICY "Users can view their own feedback" 
ON feedback FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback" 
ON feedback FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- Admins can update feedback (mark as read/archived)
CREATE POLICY "Admins can update feedback" 
ON feedback FOR UPDATE
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- Admins can delete feedback
CREATE POLICY "Admins can delete feedback" 
ON feedback FOR DELETE
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);
