"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Eye, EyeOff, BarChart3 } from "lucide-react";
import { deleteAudioMood } from "@/app/app/console/audio/moods/actions";
import { useRouter } from "next/navigation";

interface AudioMood {
  id: string;
  name: string;
  description: string | null;
  mood_level: number;
  color: string | null;
  is_active: boolean;
  created_at: string;
  audio_files?: { count: number }[];
}

interface AudioMoodListProps {
  moods: AudioMood[];
}

const getMoodLevelLabel = (level: number) => {
  const labels = {
    1: "Muito Triste",
    2: "Triste", 
    3: "Neutro",
    4: "Feliz",
    5: "Muito Feliz"
  };
  return labels[level as keyof typeof labels] || `Nível ${level}`;
};

const getMoodLevelEmoji = (level: number) => {
  const emojis = {
    1: "😢",
    2: "😔",
    3: "😐",
    4: "😊",
    5: "😄"
  };
  return emojis[level as keyof typeof emojis] || "😐";
};

export default function AudioMoodList({ moods }: AudioMoodListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (moodId: string, moodName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o humor "${moodName}"?`)) {
      return;
    }

    setDeletingId(moodId);
    try {
      const result = await deleteAudioMood(moodId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message || "Erro ao excluir humor");
      }
    } catch (error) {
      console.error("Error deleting mood:", error);
      alert("Erro inesperado ao excluir humor");
    } finally {
      setDeletingId(null);
    }
  };

  if (moods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum humor encontrado. Crie o primeiro humor acima.
      </div>
    );
  }

  // Sort moods by level for better organization
  const sortedMoods = [...moods].sort((a, b) => a.mood_level - b.mood_level);

  return (
    <div className="space-y-4">
      {sortedMoods.map((mood) => {
        const audioCount = mood.audio_files?.[0]?.count || 0;
        
        return (
          <Card key={mood.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMoodLevelEmoji(mood.mood_level)}</span>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="font-mono">
                        Nível {mood.mood_level}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{mood.name}</h3>
                      {mood.color && (
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: mood.color }}
                        />
                      )}
                    </div>
                    {mood.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {mood.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={mood.is_active ? "default" : "secondary"}>
                        {mood.is_active ? (
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
                      <Badge variant="outline">
                        {audioCount} áudio{audioCount !== 1 ? 's' : ''}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        style={{ 
                          backgroundColor: mood.color ? `${mood.color}20` : undefined,
                          color: mood.color || undefined,
                          borderColor: mood.color || undefined
                        }}
                      >
                        {getMoodLevelLabel(mood.mood_level)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
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
                    onClick={() => handleDelete(mood.id, mood.name)}
                    disabled={deletingId === mood.id || audioCount > 0}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deletingId === mood.id ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}