-- Migration: Update audio_files table for Supabase Storage
-- Description: Add storage_path column and modify file_url to be optional

-- Add storage_path column for Supabase Storage
ALTER TABLE public.audio_files 
ADD COLUMN storage_path VARCHAR(500);

-- Make file_url optional since we'll use either file_url OR storage_path
ALTER TABLE public.audio_files 
ALTER COLUMN file_url DROP NOT NULL;

-- Add check constraint to ensure either file_url OR storage_path is provided
ALTER TABLE public.audio_files 
ADD CONSTRAINT audio_files_url_or_storage_check 
CHECK (
  (file_url IS NOT NULL AND storage_path IS NULL) OR 
  (file_url IS NULL AND storage_path IS NOT NULL)
);

-- Create storage policies for audio files bucket
-- Note: These policies should be created manually in Supabase dashboard or via SQL

-- Storage bucket creation (run this in Supabase SQL editor):
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', false);
*/

-- Storage policies (run these in Supabase SQL editor):
/*
-- Allow authenticated users to read all audio files
CREATE POLICY "Allow authenticated users to read audio files" ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'audio-files');

-- Allow super admins to upload audio files
CREATE POLICY "Allow super admins to upload audio files" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-files' AND
  auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
);

-- Allow super admins to update audio files
CREATE POLICY "Allow super admins to update audio files" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio-files' AND
  auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
);

-- Allow super admins to delete audio files
CREATE POLICY "Allow super admins to delete audio files" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-files' AND
  auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
);
*/

-- Update indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_files_storage_path ON public.audio_files(storage_path);

-- Add comment
COMMENT ON COLUMN public.audio_files.storage_path IS 'Supabase Storage path for uploaded files (alternative to file_url)';