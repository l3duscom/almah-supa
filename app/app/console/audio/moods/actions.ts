"use server";

import { createClient } from "@/utils/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type AudioMoodActionState = {
  success: boolean;
  message?: string;
  moodId?: string;
};

export async function createAudioMood(
  _previousState: AudioMoodActionState,
  formData: FormData
): Promise<AudioMoodActionState> {
  try {
    await requireSuperAdmin();
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const moodLevel = parseInt(formData.get("mood_level") as string);
    const color = formData.get("color") as string;

    if (!name.trim()) {
      return {
        success: false,
        message: "Nome do humor é obrigatório.",
      };
    }

    if (!moodLevel || moodLevel < 1 || moodLevel > 5) {
      return {
        success: false,
        message: "Nível do humor deve ser entre 1 e 5.",
      };
    }

    // Check if mood level already exists
    const { data: existingMood } = await supabase
      .from("audio_moods")
      .select("id")
      .eq("mood_level", moodLevel)
      .single();

    if (existingMood) {
      return {
        success: false,
        message: `Já existe um humor com nível ${moodLevel}.`,
      };
    }

    const { data, error } = await supabase
      .from("audio_moods")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        mood_level: moodLevel,
        color: color || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating audio mood:", error);
      if (error.code === "23505") {
        return {
          success: false,
          message: "Já existe um humor com este nome.",
        };
      }
      return {
        success: false,
        message: "Erro ao criar humor. Tente novamente.",
      };
    }

    revalidatePath("/app/console/audio");

    return {
      success: true,
      message: "Humor criado com sucesso!",
      moodId: data.id,
    };
  } catch (error) {
    console.error("Error in createAudioMood:", error);
    return {
      success: false,
      message: "Erro inesperado. Tente novamente.",
    };
  }
}

export async function updateAudioMood(
  moodId: string,
  _previousState: AudioMoodActionState,
  formData: FormData
): Promise<AudioMoodActionState> {
  try {
    await requireSuperAdmin();
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const moodLevel = parseInt(formData.get("mood_level") as string);
    const color = formData.get("color") as string;
    const isActive = formData.get("is_active") === "true";

    if (!name.trim()) {
      return {
        success: false,
        message: "Nome do humor é obrigatório.",
      };
    }

    if (!moodLevel || moodLevel < 1 || moodLevel > 5) {
      return {
        success: false,
        message: "Nível do humor deve ser entre 1 e 5.",
      };
    }

    // Check if mood level already exists (excluding current mood)
    const { data: existingMood } = await supabase
      .from("audio_moods")
      .select("id")
      .eq("mood_level", moodLevel)
      .neq("id", moodId)
      .single();

    if (existingMood) {
      return {
        success: false,
        message: `Já existe outro humor com nível ${moodLevel}.`,
      };
    }

    const { error } = await supabase
      .from("audio_moods")
      .update({
        name: name.trim(),
        description: description.trim() || null,
        mood_level: moodLevel,
        color: color || null,
        is_active: isActive,
      })
      .eq("id", moodId);

    if (error) {
      console.error("Error updating audio mood:", error);
      if (error.code === "23505") {
        return {
          success: false,
          message: "Já existe um humor com este nome.",
        };
      }
      return {
        success: false,
        message: "Erro ao atualizar humor.",
      };
    }

    revalidatePath("/app/console/audio");

    return {
      success: true,
      message: "Humor atualizado com sucesso!",
    };
  } catch (error) {
    console.error("Error in updateAudioMood:", error);
    return {
      success: false,
      message: "Erro inesperado.",
    };
  }
}

export async function deleteAudioMood(moodId: string): Promise<AudioMoodActionState> {
  try {
    await requireSuperAdmin();
    const supabase = await createClient();

    // Check if mood has associated audio files
    const { count } = await supabase
      .from("audio_files")
      .select("*", { count: "exact", head: true })
      .eq("mood_id", moodId);

    if (count && count > 0) {
      return {
        success: false,
        message: `Não é possível excluir. Este humor possui ${count} áudio(s) associado(s).`,
      };
    }

    const { error } = await supabase
      .from("audio_moods")
      .delete()
      .eq("id", moodId);

    if (error) {
      console.error("Error deleting audio mood:", error);
      return {
        success: false,
        message: "Erro ao excluir humor.",
      };
    }

    revalidatePath("/app/console/audio");

    return {
      success: true,
      message: "Humor excluído com sucesso!",
    };
  } catch (error) {
    console.error("Error in deleteAudioMood:", error);
    return {
      success: false,
      message: "Erro inesperado.",
    };
  }
}