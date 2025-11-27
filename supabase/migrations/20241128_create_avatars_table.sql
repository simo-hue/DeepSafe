-- Create avatars table
CREATE TABLE IF NOT EXISTS avatars (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    src text NOT NULL,
    rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON avatars FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON avatars FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Seed initial data (migrating from static file)
INSERT INTO avatars (id, name, description, src, rarity, is_default) VALUES
('avatar_rookie', 'Agente Recluta', 'Identità base assegnata ai nuovi operativi.', '/avatars/rookie.png', 'common', true),
('avatar_ninja', 'Cyber Ninja', 'Operativo specializzato in infiltrazioni silenziose.', '/avatars/ninja.png', 'rare', false),
('avatar_hacker', 'Elite Hacker', 'Maestro del codice e della manipolazione dati.', '/avatars/hacker.png', 'epic', false),
('avatar_architect', 'Architetto', 'Entità di alto livello con accesso root al sistema.', '/avatars/architect.png', 'legendary', false)
ON CONFLICT (id) DO NOTHING;
