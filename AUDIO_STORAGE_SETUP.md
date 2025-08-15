# Configuração do Storage de Áudio no Supabase

Este guia explica como configurar o storage de arquivos de áudio no Supabase.

## 1. Executar a Migração

Execute a migração `009_update_audio_files_for_storage.sql` no SQL Editor do Supabase:

```sql
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_files_storage_path ON public.audio_files(storage_path);

-- Add comment
COMMENT ON COLUMN public.audio_files.storage_path IS 'Supabase Storage path for uploaded files (alternative to file_url)';
```

## 2. Criar o Bucket de Storage

No Supabase Dashboard, vá para Storage e execute:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', false);
```

## 3. Configurar Políticas de Storage

Execute as políticas no SQL Editor:

```sql
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
```

## 4. Funcionalidades Implementadas

### Upload de Arquivos
- Component `AudioFileUpload` para upload de arquivos
- Suporte para MP3, WAV, OGG, M4A, FLAC
- Limite de 50MB por arquivo
- Detecção automática de duração e formato
- Progress bar durante upload

### Gerenciamento Dual
- **Upload**: Arquivos são salvos no Supabase Storage
- **URL Externa**: Ainda é possível usar URLs externas
- Interface com abas para escolher o método

### Streaming de Áudio
- API route `/api/audio/stream/[...path]` para servir arquivos do storage
- URLs assinadas com 1 hora de expiração
- Integração transparente com o player de áudio

### Exclusão Automática
- Quando um audio_file é deletado, o arquivo também é removido do storage
- Prevenção de arquivos órfãos no storage

## 5. Como Usar

### No Formulário de Áudio
1. Escolha entre "Upload" ou "URL" nas abas
2. Para Upload: selecione um arquivo e clique em "Fazer Upload"
3. Para URL: cole o link direto do arquivo
4. Preencha os demais campos e salve

### Formatos Suportados
- **MP3**: Formato mais comum
- **WAV**: Alta qualidade, arquivos maiores
- **OGG**: Formato aberto, boa compressão
- **M4A**: Formato Apple, boa qualidade
- **FLAC**: Sem perda, arquivos grandes

### Limitações
- Máximo 50MB por arquivo
- Apenas super admins podem fazer upload
- URLs assinadas expiram em 1 hora (renovadas automaticamente)

## 6. Estrutura de Arquivos

```
/uploads/
  ├── timestamp_filename.mp3
  ├── timestamp_filename.wav
  └── ...
```

Os arquivos são organizados com timestamp para evitar conflitos de nome.