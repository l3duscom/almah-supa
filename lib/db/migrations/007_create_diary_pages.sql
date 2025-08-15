-- Migration: Create diary pages structure
-- Description: Add diary_pages table and modify diary_entries to reference pages

-- Create diary_pages table
CREATE TABLE IF NOT EXISTS public.diary_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one page per user per date
  UNIQUE(user_id, date)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_diary_pages_user_date ON public.diary_pages(user_id, date);
CREATE INDEX IF NOT EXISTS idx_diary_pages_user_created ON public.diary_pages(user_id, created_at);

-- Enable RLS
ALTER TABLE public.diary_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for diary_pages
CREATE POLICY "Users can view their own diary pages" ON public.diary_pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diary pages" ON public.diary_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary pages" ON public.diary_pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary pages" ON public.diary_pages
  FOR DELETE USING (auth.uid() = user_id);

-- Add page_id to diary_entries table
ALTER TABLE public.diary_entries 
ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public.diary_pages(id) ON DELETE CASCADE;

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_diary_entries_page_id ON public.diary_entries(page_id);

-- Create trigger for diary_pages updated_at
CREATE TRIGGER update_diary_pages_updated_at
  BEFORE UPDATE ON public.diary_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create diary page when first entry is added
CREATE OR REPLACE FUNCTION create_diary_page_if_needed()
RETURNS TRIGGER AS $$
DECLARE
  page_uuid UUID;
BEGIN
  -- If page_id is not provided, try to find or create a page for this date
  IF NEW.page_id IS NULL THEN
    -- Look for existing page for this user and date
    SELECT id INTO page_uuid
    FROM public.diary_pages
    WHERE user_id = NEW.user_id AND date = NEW.date;
    
    -- If no page exists, create one
    IF page_uuid IS NULL THEN
      INSERT INTO public.diary_pages (user_id, date, title)
      VALUES (NEW.user_id, NEW.date, 'Diário de ' || TO_CHAR(NEW.date, 'DD/MM/YYYY'))
      RETURNING id INTO page_uuid;
    END IF;
    
    NEW.page_id = page_uuid;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create pages
CREATE TRIGGER create_diary_page_before_entry_insert
  BEFORE INSERT ON public.diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION create_diary_page_if_needed();

-- Insert into migrations table
INSERT INTO public._migrations (filename, executed_at)
VALUES ('007_create_diary_pages.sql', NOW())
ON CONFLICT (filename) DO NOTHING;