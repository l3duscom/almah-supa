"use client";

import { Button } from "@/components/ui/button";
import { Heart, Play } from "lucide-react";
import { useNotification } from "@/hooks/use-notification";
import { useAudioPlayer } from "@/hooks/use-audio-player";

const boostMessages = [
  "Você é incrível e capaz de superar qualquer desafio! ✨",
  "Respire fundo... você consegue! Cada respiração te traz mais calma 💚", 
  "Cada dia é uma nova oportunidade de crescer e brilhar 🌅",
  "Você é mais forte e resiliente do que imagina 💪",
  "Seja gentil consigo mesmo, você merece todo carinho 🤗",
  "Seus sentimentos são válidos e importantes 💝",
  "Você merece todo o amor e felicidade do mundo 🌸",
  "Um passo de cada vez... você está no caminho certo 🚶‍♀️",
  "Lembre-se: você não está sozinho nesta jornada 🤝",
  "Suas conquistas, por menores que sejam, merecem ser celebradas 🎉"
];

export default function MoodBoostButton() {
  const { showNotification } = useNotification();
  const { playTrack } = useAudioPlayer();

  const handleBoost = () => {
    const randomMessage = boostMessages[Math.floor(Math.random() * boostMessages.length)];
    
    // Tocar áudio relaxante
    playTrack({
      id: "meditation-1",
      title: "Meditação Guiada - Respiração",
      artist: "Almah Wellness",
      url: "/audio/meditation-breathing.mp3"
    });
    
    showNotification({
      variant: "info",
      description: randomMessage,
      title: "💚 Mensagem de apoio",
      autoCloseDelay: 6000
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleBoost}
      className="hover:bg-pink-50 hover:border-pink-200 transition-colors h-[56px] px-4"
    >
      <Heart className="h-4 w-4 mr-2 text-pink-500" />
      Preciso de apoio
    </Button>
  );
}