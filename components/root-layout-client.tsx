"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import AudioPlayerBar from "@/components/audio-player-bar";
import { createClient } from "@/utils/supabase/client";
import { getAudioUrl, type AudioFile } from "@/lib/audio";

export default function RootLayoutClient() {
  const { setPlaylist } = useAudioPlayer();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar se está em uma rota protegida (rotas que começam com /app)
  const isProtectedRoute = pathname.startsWith('/app');

  useEffect(() => {
    async function loadAudioFiles() {
      if (!isProtectedRoute) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        
        // Get user to check plan
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
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
            .filter(Boolean); // Remove null entries
          
          setPlaylist(playlist);
        } else {
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
        setIsLoading(false);
      }
    }

    loadAudioFiles();
  }, [isProtectedRoute, setPlaylist]);

  // Só renderizar o player em rotas protegidas e quando não estiver carregando
  return isProtectedRoute && !isLoading ? <AudioPlayerBar /> : null;
}