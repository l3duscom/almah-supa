"use server";

import { createClient } from "@/utils/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type DiaryActionState = {
  success: boolean;
  message?: string;
  entryId?: string;
};

export async function addDiaryEntry(
  _previousState: DiaryActionState,
  formData: FormData
): Promise<DiaryActionState> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const content = formData.get("content") as string;
    const mood = parseInt(formData.get("mood") as string);
    const date = formData.get("date") as string;

    if (!content.trim()) {
      return {
        success: false,
        message: "Por favor, escreva algo no seu diário.",
      };
    }

    if (!mood || mood < 1 || mood > 5) {
      return {
        success: false,
        message: "Por favor, selecione como você está se sentindo.",
      };
    }

    const { data, error } = await supabase
      .from("diary_entries")
      .insert({
        user_id: user.id,
        content: content.trim(),
        mood,
        date,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding diary entry:", error);
      return {
        success: false,
        message: "Erro ao salvar sua entrada. Tente novamente.",
      };
    }

    revalidatePath("/app/diario");

    return {
      success: true,
      message: "Entrada salva com sucesso! ✨",
      entryId: data.id,
    };
  } catch (error) {
    console.error("Error in addDiaryEntry:", error);
    return {
      success: false,
      message: "Erro inesperado. Tente novamente.",
    };
  }
}

export async function updateDiaryEntry(
  entryId: string,
  content: string
): Promise<DiaryActionState> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    if (!content.trim()) {
      return {
        success: false,
        message: "O conteúdo não pode estar vazio.",
      };
    }

    const { error } = await supabase
      .from("diary_entries")
      .update({ content: content.trim() })
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating diary entry:", error);
      return {
        success: false,
        message: "Erro ao atualizar entrada.",
      };
    }

    revalidatePath("/app/diario");

    return {
      success: true,
      message: "Entrada atualizada! ✏️",
    };
  } catch (error) {
    console.error("Error in updateDiaryEntry:", error);
    return {
      success: false,
      message: "Erro inesperado.",
    };
  }
}

export async function deleteDiaryEntry(entryId: string): Promise<DiaryActionState> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase
      .from("diary_entries")
      .delete()
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting diary entry:", error);
      return {
        success: false,
        message: "Erro ao excluir entrada.",
      };
    }

    revalidatePath("/app/diario");

    return {
      success: true,
      message: "Entrada excluída.",
    };
  } catch (error) {
    console.error("Error in deleteDiaryEntry:", error);
    return {
      success: false,
      message: "Erro inesperado.",
    };
  }
}