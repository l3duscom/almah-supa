-- Migration: Create diary tables
-- Description: Tables for diary entries and mood tracking

-- Create diary_entries table
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5), -- 1=very sad, 2=sad, 3=neutral, 4=happy, 5=very happy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_date ON public.diary_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_created ON public.diary_entries(user_id, created_at);

-- Enable RLS
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own diary entries" ON public.diary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diary entries" ON public.diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary entries" ON public.diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries" ON public.diary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert into migrations table
INSERT INTO public._migrations (filename, executed_at)
VALUES ('006_create_diary.sql', NOW())
ON CONFLICT (filename) DO NOTHING;