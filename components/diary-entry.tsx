"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit3, Trash2, Save, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { updateDiaryEntry, deleteDiaryEntry } from "@/app/app/diario/actions";
import { toast } from "sonner";

interface DiaryEntryProps {
  entry: {
    id: string;
    content: string;
    mood: number;
    created_at: string;
    updated_at: string;
  };
  canEdit: boolean;
}

const getMoodDisplay = (mood: number) => {
  const moods = {
    1: { emoji: "😢", label: "Muito triste", bg: "bg-red-100 text-red-800" },
    2: { emoji: "😔", label: "Triste", bg: "bg-orange-100 text-orange-800" },
    3: { emoji: "😐", label: "Neutro", bg: "bg-yellow-100 text-yellow-800" },
    4: { emoji: "😊", label: "Feliz", bg: "bg-green-100 text-green-800" },
    5: { emoji: "😄", label: "Muito feliz", bg: "bg-emerald-100 text-emerald-800" },
  };
  return moods[mood as keyof typeof moods] || moods[3];
};

export default function DiaryEntry({ entry, canEdit }: DiaryEntryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);
  const [isLoading, setIsLoading] = useState(false);

  const moodDisplay = getMoodDisplay(entry.mood);
  const formattedTime = format(new Date(entry.created_at), "HH:mm", { locale: ptBR });
  const wasUpdated = entry.created_at !== entry.updated_at;

  const handleSave = async () => {
    if (!editContent.trim()) {
      toast.error("O conteúdo não pode estar vazio");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateDiaryEntry(entry.id, editContent);
      if (result.success) {
        setIsEditing(false);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao salvar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteDiaryEntry(entry.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao excluir");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditContent(entry.content);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="relative group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={moodDisplay.bg}>
                <span className="mr-1">{moodDisplay.emoji}</span>
                {moodDisplay.label}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formattedTime}
                {wasUpdated && <span className="ml-1">(editado)</span>}
              </div>
            </div>

            {canEdit && !isEditing && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir entrada</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta entrada do diário? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-24 resize-none"
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading || !editContent.trim()}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}