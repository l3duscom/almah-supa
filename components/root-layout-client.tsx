"use client";

import { useEffect } from "react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import AudioPlayerBar from "@/components/audio-player-bar";

export default function RootLayoutClient() {
  const { setPlaylist } = useAudioPlayer();

  useEffect(() => {
    // Inicializar playlist com áudios de exemplo
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
  }, [setPlaylist]);

  return <AudioPlayerBar />;
}