"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Crown, 
  Clock, 
  FileAudio,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
import { deleteAudioFile } from "@/app/app/console/audio/files/actions";
import Link from "next/link";

// Client-side version of getAudioUrl
function getAudioUrl(audioFile: AudioFile): string | null {
  if (audioFile.file_url) {
    return audioFile.file_url;
  }
  
  if (audioFile.storage_path) {
    return `/api/audio/stream/${encodeURIComponent(audioFile.storage_path)}`;
  }
  
  return null;
}

interface AudioFile {
  id: string;
  title: string;
  artist: string | null;
  description: string | null;
  file_url: string | null;
  storage_path: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  file_format: string | null;
  tags: string[] | null;
  is_premium: boolean;
  is_active: boolean;
  play_count: number;
  created_at: string;
  audio_categories: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
  audio_moods: {
    id: string;
    name: string;
    mood_level: number;
    color: string | null;
  } | null;
}

interface SearchParams {
  search?: string;
  category?: string;
  mood?: string;
  premium?: string;
  active?: string;
}

interface AudioFileListProps {
  audioFiles: AudioFile[];
  currentPage: number;
  totalPages: number;
  currentParams: SearchParams;
}

export default function AudioFileList({ 
  audioFiles, 
  currentPage, 
  totalPages,
  currentParams 
}: AudioFileListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"?`)) {
      return;
    }

    setDeletingId(fileId);
    try {
      const result = await deleteAudioFile(fileId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message || "Erro ao excluir arquivo");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Erro inesperado ao excluir arquivo");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePlayPause = (audioFile: AudioFile) => {
    const fileId = audioFile.id;
    const fileUrl = getAudioUrl(audioFile);
    
    if (!fileUrl) {
      alert("URL do arquivo não disponível");
      return;
    }
    
    // Stop all other audios
    Object.values(audioElements).forEach(audio => {
      if (!audio.paused) {
        audio.pause();
      }
    });

    if (playingId === fileId) {
      // Pause current
      setPlayingId(null);
      if (audioElements[fileId]) {
        audioElements[fileId].pause();
      }
    } else {
      // Play new
      setPlayingId(fileId);
      
      if (!audioElements[fileId]) {
        const audio = new Audio(fileUrl);
        audio.onended = () => setPlayingId(null);
        audio.onerror = () => {
          setPlayingId(null);
          alert("Erro ao carregar o arquivo de áudio");
        };
        setAudioElements(prev => ({ ...prev, [fileId]: audio }));
        audio.play();
      } else {
        audioElements[fileId].play();
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      }
    });
    params.set("page", page.toString());
    return `?${params.toString()}`;
  };

  if (audioFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Nenhum arquivo encontrado
        </h3>
        <p className="text-sm text-muted-foreground">
          {Object.values(currentParams).some(v => v) 
            ? "Tente ajustar os filtros de busca" 
            : "Adicione o primeiro arquivo de áudio usando o formulário ao lado"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Files Grid */}
      <div className="space-y-4">
        {audioFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Play Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlayPause(file)}
                  className="flex-shrink-0"
                >
                  {playingId === file.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{file.title}</h3>
                      {file.artist && (
                        <p className="text-muted-foreground">por {file.artist}</p>
                      )}
                      {file.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {file.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implementar modal de edição
                          alert("Funcionalidade de edição será implementada em breve");
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(file.id, file.title)}
                        disabled={deletingId === file.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {deletingId === file.id ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {file.audio_categories && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {file.audio_categories.icon && (
                          <span>{file.audio_categories.icon}</span>
                        )}
                        {file.audio_categories.name}
                      </Badge>
                    )}
                    
                    {file.audio_moods && (
                      <Badge variant="outline">
                        Nível {file.audio_moods.mood_level} - {file.audio_moods.name}
                      </Badge>
                    )}

                    {file.is_premium && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}

                    <Badge variant={file.is_active ? "default" : "secondary"}>
                      {file.is_active ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Inativo
                        </>
                      )}
                    </Badge>

                    {file.duration_seconds && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(file.duration_seconds)}
                      </Badge>
                    )}

                    {file.file_format && (
                      <Badge variant="outline" className="uppercase">
                        {file.file_format}
                      </Badge>
                    )}

                    <Badge variant="outline">
                      <Play className="h-3 w-3 mr-1" />
                      {file.play_count} plays
                    </Badge>
                  </div>

                  {/* Tags */}
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {file.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Technical Info */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {file.file_size_bytes && (
                      <span>{formatFileSize(file.file_size_bytes)}</span>
                    )}
                    <span>
                      Criado em {new Date(file.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {getAudioUrl(file) && (
                      <Link 
                        href={getAudioUrl(file)!} 
                        target="_blank" 
                        className="inline-flex items-center gap-1 hover:text-blue-600"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild={currentPage > 1}
              disabled={currentPage <= 1}
            >
              {currentPage > 1 ? (
                <Link href={buildPageUrl(currentPage - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild={currentPage < totalPages}
              disabled={currentPage >= totalPages}
            >
              {currentPage < totalPages ? (
                <Link href={buildPageUrl(currentPage + 1)}>
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                <>
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}