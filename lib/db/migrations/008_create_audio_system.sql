-- Migration: Create audio management system
-- Description: Tables for audio categories, moods, and audio files

-- Create audio_categories table
CREATE TABLE IF NOT EXISTS public.audio_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- Emoji or icon name
  color VARCHAR(7), -- Hex color
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audio_moods table (for filtering audios by mood)
CREATE TABLE IF NOT EXISTS public.audio_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  mood_level INTEGER CHECK (mood_level >= 1 AND mood_level <= 5), -- 1=very sad, 2=sad, 3=neutral, 4=happy, 5=very happy
  color VARCHAR(7), -- Hex color
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audio_files table
CREATE TABLE IF NOT EXISTS public.audio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(200),
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  duration_seconds INTEGER, -- Duration in seconds
  file_size_bytes BIGINT, -- File size in bytes
  file_format VARCHAR(10), -- mp3, wav, etc.
  category_id UUID REFERENCES public.audio_categories(id) ON DELETE SET NULL,
  mood_id UUID REFERENCES public.audio_moods(id) ON DELETE SET NULL,
  tags TEXT[], -- Array of tags for filtering
  is_premium BOOLEAN DEFAULT false, -- Requires premium subscription
  is_active BOOLEAN DEFAULT true,
  play_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin who uploaded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audio_categories_active ON public.audio_categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_audio_moods_level ON public.audio_moods(mood_level, is_active);
CREATE INDEX IF NOT EXISTS idx_audio_files_category ON public.audio_files(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audio_files_mood ON public.audio_files(mood_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audio_files_premium ON public.audio_files(is_premium, is_active);
CREATE INDEX IF NOT EXISTS idx_audio_files_tags ON public.audio_files USING GIN(tags);

-- Enable RLS
ALTER TABLE public.audio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;

-- Policies for audio_categories (public read, admin write)
CREATE POLICY "Anyone can view active audio categories" ON public.audio_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only super admins can manage audio categories" ON public.audio_categories
  FOR ALL USING (
    auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
  );

-- Policies for audio_moods (public read, admin write)
CREATE POLICY "Anyone can view active audio moods" ON public.audio_moods
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only super admins can manage audio moods" ON public.audio_moods
  FOR ALL USING (
    auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
  );

-- Policies for audio_files (public read with premium check, admin write)
CREATE POLICY "Users can view active audio files" ON public.audio_files
  FOR SELECT USING (
    is_active = true AND (
      is_premium = false OR 
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND (plan = 'premium' OR role IN ('admin', 'super_admin'))
      )
    )
  );

CREATE POLICY "Only super admins can manage audio files" ON public.audio_files
  FOR ALL USING (
    auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
  );

-- Create triggers for updated_at
CREATE TRIGGER update_audio_categories_updated_at
  BEFORE UPDATE ON public.audio_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_moods_updated_at
  BEFORE UPDATE ON public.audio_moods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_files_updated_at
  BEFORE UPDATE ON public.audio_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO public.audio_categories (name, description, icon, color, sort_order) VALUES
('Meditação', 'Áudios para meditação e mindfulness', '🧘', '#10B981', 1),
('Sons da Natureza', 'Sons relaxantes da natureza', '🌿', '#059669', 2),
('Música Relaxante', 'Músicas calmas e relaxantes', '🎵', '#3B82F6', 3),
('Chuva e Trovões', 'Sons de chuva e tempestades', '🌧️', '#6366F1', 4),
('Piano e Instrumental', 'Música instrumental e piano', '🎹', '#8B5CF6', 5),
('Frequências Binaurais', 'Frequências para foco e relaxamento', '🎧', '#EC4899', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert default moods
INSERT INTO public.audio_moods (name, description, mood_level, color) VALUES
('Muito Triste', 'Para momentos de tristeza profunda', 1, '#EF4444'),
('Triste', 'Para momentos de melancolia', 2, '#F97316'),
('Neutro', 'Para momentos de equilíbrio', 3, '#EAB308'),
('Feliz', 'Para momentos de alegria', 4, '#22C55E'),
('Muito Feliz', 'Para momentos de euforia', 5, '#10B981')
ON CONFLICT (name) DO NOTHING;

-- Function to increment play count
CREATE OR REPLACE FUNCTION increment_audio_play_count(audio_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.audio_files 
  SET play_count = play_count + 1 
  WHERE id = audio_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert into migrations table
INSERT INTO public._migrations (filename, executed_at)
VALUES ('008_create_audio_system.sql', NOW())
ON CONFLICT (filename) DO NOTHING;