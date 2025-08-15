"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { deleteAudioCategory } from "@/app/app/console/audio/categories/actions";
import { useRouter } from "next/navigation";

interface AudioCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  audio_files?: { count: number }[];
}

interface AudioCategoryListProps {
  categories: AudioCategory[];
}

export default function AudioCategoryList({ categories }: AudioCategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) {
      return;
    }

    setDeletingId(categoryId);
    try {
      const result = await deleteAudioCategory(categoryId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message || "Erro ao excluir categoria");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Erro inesperado ao excluir categoria");
    } finally {
      setDeletingId(null);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma categoria encontrada. Crie a primeira categoria acima.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const audioCount = category.audio_files?.[0]?.count || 0;
        
        return (
          <Card key={category.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {category.icon && (
                    <span className="text-2xl">{category.icon}</span>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{category.name}</h3>
                      {category.color && (
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Ativa
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inativa
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {audioCount} áudio{audioCount !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline">
                        Ordem: {category.sort_order}
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
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={deletingId === category.id || audioCount > 0}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deletingId === category.id ? (
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