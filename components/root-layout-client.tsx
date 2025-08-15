"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import AudioPlayerBar from "@/components/audio-player-bar";
import { createClient } from "@/utils/supabase/client";

interface AudioFile {
  id: string;
  title: string;
  artist: string | null;
  file_url: string | null;
  storage_path: string | null;
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

export default function RootLayoutClient() {
  const { setPlaylist } = useAudioPlayer();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar se está em uma rota protegida (rotas que começam com /app)
  const isProtectedRoute = pathname.startsWith('/app');

  useEffect(() => {
    let isMounted = true;
    
    async function loadAudioFiles() {
      if (!isProtectedRoute) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        
        // Get user with proper error handling
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!isMounted) return; // Component unmounted, abort
        
        if (userError) {
          console.error("Error getting user:", userError);
          // Set fallback playlist and continue
          setPlaylist([
            {
              id: "fallback-1",
              title: "Meditação Guiada - Respiração",
              artist: "Almah Wellness",
              url: "/audio/meditation-breathing.mp3"
            }
          ]);
          setIsLoading(false);
          return;
        }
        
        if (!user) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // Get user plan from users table
        const { data: userData } = await supabase
          .from("users")
          .select("plan")
          .eq("id", user.id)
          .single();

        const userPlan = userData?.plan || "free";

        // Fetch active audio files from database
        const { data: audioFiles, error } = await supabase
          .from("audio_files")
          .select(`
            id,
            title,
            artist,
            file_url,
            storage_path,
            audio_categories!inner (
              name,
              is_active
            )
          `)
          .eq("is_active", true)
          .eq("audio_categories.is_active", true)
          .or(`is_premium.eq.false,is_premium.eq.${userPlan === 'premium'}`)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          console.error("Error fetching audio files:", error);
          if (!isMounted) return;
          
          // Fallback to example playlist
          setPlaylist([
            {
              id: "1",
              title: "Meditação Guiada - Respiração",
              artist: "Almah Wellness",
              url: "/audio/meditation-breathing.mp3"
            },
            {
              id: "2", 
              title: "Sons da Natureza - Chuva",
              artist: "Almah Wellness",
              url: "/audio/nature-rain.mp3"
            },
            {
              id: "3",
              title: "Música Relaxante - Piano",
              artist: "Almah Wellness", 
              url: "/audio/relaxing-piano.mp3"
            }
          ]);
        } else if (audioFiles && audioFiles.length > 0) {
          // Convert database format to player format
          const playlist = audioFiles
            .map(file => {
              const audioUrl = getAudioUrl(file as AudioFile);
              if (!audioUrl) {
                console.warn(`No URL available for audio file: ${file.title}`);
                return null;
              }
              
              return {
                id: file.id,
                title: file.title,
                artist: file.artist || "Almah Wellness",
                url: audioUrl
              };
            })
            .filter((track): track is NonNullable<typeof track> => track !== null); // Remove null entries
          
          if (!isMounted) return;
          setPlaylist(playlist);
        } else {
          if (!isMounted) return;
          
          // No audio files found, use fallback
          setPlaylist([
            {
              id: "1",
              title: "Meditação Guiada - Respiração",
              artist: "Almah Wellness",
              url: "/audio/meditation-breathing.mp3"
            }
          ]);
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error("Error loading audio files:", error);
        // Fallback playlist on error
        setPlaylist([
          {
            id: "1",
            title: "Meditação Guiada - Respiração",
            artist: "Almah Wellness",
            url: "/audio/meditation-breathing.mp3"
          }
        ]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAudioFiles();
    
    return () => {
      isMounted = false;
    };
  }, [isProtectedRoute, setPlaylist]);

  // Só renderizar o player em rotas protegidas e quando não estiver carregando
  return isProtectedRoute && !isLoading ? <AudioPlayerBar /> : null;
}