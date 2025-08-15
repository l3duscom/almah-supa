"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Lock, 
  Crown, 
  Search,
  Clock,
  User,
  Music,
  Heart,
  Star
} from "lucide-react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

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
  category?: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  mood?: {
    id: string;
    name: string;
    mood_level: number;
    color: string | null;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
}


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

export default function UserAudioLibrary() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const { playTrack, currentTrack, isPlaying, togglePlay, setPlaylist } = useAudioPlayer();

  useEffect(() => {
    loadAudioData();
  }, []);

  const loadAudioData = async () => {
    try {
      const supabase = createClient();
      
      // Get user plan
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("plan")
          .eq("id", user.id)
          .single();
        
        setUserPlan(userData?.plan || 'free');
      }

      // Get active categories
      const { data: categoriesData } = await supabase
        .from("audio_categories")
        .select("id, name, icon, color, description")
        .eq("is_active", true)
        .order("sort_order");

      // Get active audio files
      const { data: audioData } = await supabase
        .from("audio_files")
        .select(`
          *,
          audio_categories!inner (
            id,
            name,
            icon,
            color
          ),
          audio_moods (
            id,
            name,
            mood_level,
            color
          )
        `)
        .eq("is_active", true)
        .eq("audio_categories.is_active", true)
        .order("created_at", { ascending: false });

      setCategories(categoriesData || []);
      setAudioFiles(audioData?.map(file => ({
        ...file,
        category: file.audio_categories,
        mood: file.audio_moods,
      })) || []);

    } catch (error) {
      console.error("Error loading audio data:", error);
    } finally {
      setLoading(false);
    }
  };

  interface PlaylistTrack {
    id: string;
    title: string;
    artist: string;
    url: string;
    duration?: number;
  }

  const createCategoryPlaylist = (selectedAudio: AudioFile): PlaylistTrack[] => {
    // Get all audios from the same category that user can access
    const categoryAudios = audioFiles.filter(audio => {
      // Same category
      const sameCategory = audio.category?.id === selectedAudio.category?.id;
      
      // User can access (not premium or user is premium)
      const canAccess = !audio.is_premium || userPlan === 'premium';
      
      // Audio is active
      const isActive = audio.is_active;
      
      return sameCategory && canAccess && isActive;
    });

    // Convert to player format and sort by title for consistent order
    const validTracks: PlaylistTrack[] = [];
    
    categoryAudios
      .sort((a, b) => a.title.localeCompare(b.title))
      .forEach(audio => {
        const audioUrl = getAudioUrl(audio);
        if (audioUrl) {
          validTracks.push({
            id: audio.id,
            title: audio.title,
            artist: audio.artist || "Almah Wellness",
            url: audioUrl,
            duration: audio.duration_seconds || undefined
          });
        }
      });
    
    return validTracks;
  };

  const handlePlayAudio = (audioFile: AudioFile) => {
    if (audioFile.is_premium && userPlan === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    // Check if this is the current track
    if (currentTrack?.id === audioFile.id) {
      // Same track - just toggle play/pause
      togglePlay();
      return;
    }

    // Create category-based playlist
    const categoryPlaylist = createCategoryPlaylist(audioFile);
    
    if (categoryPlaylist.length === 0) {
      console.error("No accessible audios in this category");
      return;
    }

    // Set the category playlist FIRST with category ID
    setPlaylist(categoryPlaylist, audioFile.category?.id);

    // Find and play the selected track
    const selectedTrack = categoryPlaylist.find(track => track.id === audioFile.id);
    if (selectedTrack) {
      playTrack(selectedTrack);
    }
  };


  const filteredAudios = audioFiles.filter(audio => {
    const matchesSearch = audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audio.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audio.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || audio.category?.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const freeSongs = filteredAudios.filter(audio => !audio.is_premium);
  const premiumSongs = filteredAudios.filter(audio => audio.is_premium);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Music className="h-8 w-8 text-violet-600" />
          Biblioteca de Áudio
        </h2>
        <p className="text-muted-foreground">
          Descubra e ouça conteúdos para seu bem-estar
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por título, artista ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todas as categorias
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-1"
                >
                  {category.icon && <span>{category.icon}</span>}
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Free Content */}
      {freeSongs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-600" />
              Conteúdo Gratuito
              <Badge variant="secondary">{freeSongs.length} áudios</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {freeSongs.map((audio) => (
                <AudioCard
                  key={audio.id}
                  audio={audio}
                  isPlaying={currentTrack?.id === audio.id && isPlaying}
                  onPlay={() => handlePlayAudio(audio)}
                  isPremium={false}
                  userPlan={userPlan}
                  categoryCount={audioFiles.filter(a => 
                    a.category?.id === audio.category?.id && 
                    a.is_active && 
                    (!a.is_premium || userPlan === 'premium')
                  ).length}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Content */}
      {premiumSongs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Conteúdo Premium
              <Badge variant="secondary">{premiumSongs.length} áudios</Badge>
              {userPlan === 'free' && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Upgrade necessário
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {premiumSongs.map((audio) => (
                <AudioCard
                  key={audio.id}
                  audio={audio}
                  isPlaying={currentTrack?.id === audio.id && isPlaying}
                  onPlay={() => handlePlayAudio(audio)}
                  isPremium={true}
                  userPlan={userPlan}
                  categoryCount={audioFiles.filter(a => 
                    a.category?.id === audio.category?.id && 
                    a.is_active && 
                    (!a.is_premium || userPlan === 'premium')
                  ).length}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No results */}
      {filteredAudios.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum áudio encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termos de busca
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}

// Audio Card Component
interface AudioCardProps {
  audio: AudioFile;
  isPlaying: boolean;
  onPlay: () => void;
  isPremium: boolean;
  userPlan: 'free' | 'premium';
  categoryCount: number;
}

function AudioCard({ audio, isPlaying, onPlay, isPremium, userPlan, categoryCount }: AudioCardProps) {
  const canPlay = !isPremium || userPlan === 'premium';
  
  return (
    <Card className={`transition-all hover:shadow-md ${isPremium && userPlan === 'free' ? 'opacity-75' : ''}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header with category and premium badge */}
        <div className="flex items-center justify-between">
          {audio.category && (
            <div className="flex flex-col items-start gap-1">
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ 
                  borderColor: audio.category.color || undefined,
                  color: audio.category.color || undefined 
                }}
              >
                {audio.category.icon && <span className="mr-1">{audio.category.icon}</span>}
                {audio.category.name}
              </Badge>
              {categoryCount > 1 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  Playlist: {categoryCount} áudios
                </span>
              )}
            </div>
          )}
          {isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Title and Artist */}
        <div>
          <h3 className="font-semibold line-clamp-2 mb-1">{audio.title}</h3>
          {audio.artist && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {audio.artist}
            </p>
          )}
        </div>

        {/* Description */}
        {audio.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {audio.description}
          </p>
        )}

        {/* Duration and Play Count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {audio.duration_seconds && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(audio.duration_seconds)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {audio.play_count} plays
          </span>
        </div>

        {/* Play Button */}
        <div className="flex justify-center">
          <Button
            onClick={onPlay}
            disabled={!canPlay}
            className={`w-full ${isPremium && userPlan === 'free' ? 'relative' : ''}`}
            variant={canPlay ? "default" : "outline"}
          >
            {!canPlay ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Upgrade para Ouvir
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Reproduzir
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Upgrade Modal Component
interface UpgradeModalProps {
  onClose: () => void;
}

function UpgradeModal({ onClose }: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl">Conteúdo Premium</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Este áudio está disponível apenas para usuários Premium. 
            Faça upgrade para ter acesso a todo nosso conteúdo exclusivo!
          </p>
          
          <div className="space-y-2">
            <Button asChild className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700">
              <Link href="/app/planos">
                <Crown className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </Link>
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Continuar Navegando
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}