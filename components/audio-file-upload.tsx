"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, File, X, CheckCircle } from "lucide-react";

interface AudioFileUploadProps {
  onFileUploaded: (fileData: {
    storage_path: string;
    duration_seconds: number | null;
    file_size_bytes: number;
    file_format: string;
    original_name: string;
  }) => void;
  disabled?: boolean;
}

export default function AudioFileUpload({ onFileUploaded, disabled = false }: AudioFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `Arquivo muito grande. Máximo permitido: 50MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return `Formato não suportado. Aceitos: ${acceptedFormats.join(', ')}`;
    }

    return null;
  };

  const getDurationFromFile = (file: File): Promise<number | null> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        resolve(Math.round(audio.duration));
      });
      audio.addEventListener('error', () => {
        resolve(null);
      });
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Get audio duration
      const duration = await getDurationFromFile(file);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to our API route
      const response = await fetch('/api/audio/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const result = await response.json();

      // Get file format from extension
      const fileFormat = file.name.split('.').pop()?.toLowerCase() || 'mp3';

      // Call parent callback with file data
      onFileUploaded({
        storage_path: result.storage_path,
        duration_seconds: duration,
        file_size_bytes: file.size,
        file_format: fileFormat,
        original_name: file.name
      });

      setSuccess(true);
      setUploadProgress(100);

      // Reset form after a delay
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="audio-file">Arquivo de Áudio</Label>
        <div className="flex flex-col gap-2">
          <Input
            ref={fileInputRef}
            id="audio-file"
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="cursor-pointer"
          />
          <div className="text-xs text-muted-foreground">
            Formatos aceitos: {acceptedFormats.join(', ')} • Máximo: 50MB
          </div>
        </div>
      </div>

      {file && (
        <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <File className="h-4 w-4" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            {!uploading && !success && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {success && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>

          {uploading && (
            <div className="mt-2 space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Fazendo upload... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      )}

      {file && !success && (
        <Button 
          onClick={handleUpload} 
          disabled={disabled || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Fazendo Upload...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Fazer Upload
            </>
          )}
        </Button>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Arquivo enviado com sucesso!</AlertDescription>
        </Alert>
      )}
    </div>
  );
}