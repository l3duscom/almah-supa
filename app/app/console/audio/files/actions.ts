"use server";

import { createClient } from "@/utils/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type AudioFileActionState = {
  success: boolean;
  message?: string;
  audioId?: string;
};

export async function createAudioFile(
  _previousState: AudioFileActionState,
  formData: FormData
): Promise<AudioFileActionState> {
  try {
    const user = await requireSuperAdmin();
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const artist = formData.get("artist") as string;
    const description = formData.get("description") as string;
    const fileUrl = formData.get("file_url") as string;
    const storagePath = formData.get("storage_path") as string;
    const durationSeconds = parseInt(formData.get("duration_seconds") as string) || null;
    const fileSizeBytes = parseInt(formData.get("file_size_bytes") as string) || null;
    const fileFormat = formData.get("file_format") as string;
    const categoryId = formData.get("category_id") as string;
    const moodId = formData.get("mood_id") as string;
    const tagsString = formData.get("tags") as string;
    const isPremium = formData.get("is_premium") === "true";

    if (!title.trim()) {
      return {
        success: false,
        message: "Título é obrigatório.",
      };
    }

    if (!fileUrl.trim() && !storagePath.trim()) {
      return {
        success: false,
        message: "URL do arquivo ou upload é obrigatório.",
      };
    }

    // Parse tags
    const tags = tagsString
      ? tagsString.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];

    const { data, error } = await supabase
      .from("audio_files")
      .insert({
        title: title.trim(),
        artist: artist.trim() || null,
        description: description.trim() || null,
        file_url: fileUrl.trim() || null,
        storage_path: storagePath.trim() || null,
        duration_seconds: durationSeconds,
        file_size_bytes: fileSizeBytes,
        file_format: fileFormat.trim() || null,
        category_id: categoryId || null,
        mood_id: moodId || null,
        tags: tags.length > 0 ? tags : null,
        is_premium: isPremium,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating audio file:", error);
      return {
        success: false,
        message: "Erro ao criar arquivo de áudio. Tente novamente.",
      };
    }

    revalidatePath("/app/console/audio");

    return {
      success: true,
      message: "Arquivo de áudio criado com sucesso!",
      audioId: data.id,
    };
  } catch (error) {
    console.error("Error in createAudioFile:", error);
    return {
      success: false,
      message: "Erro inesperado. Tente novamente.",
    };
  }
}

export async function updateAudioFile(
  audioId: string,
  _previousState: AudioFileActionState,
  formData: FormData
): Promise<AudioFileActionState> {
  try {
    await requireSuperAdmin();
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const artist = formData.get("artist") as string;
    const description = formData.get("description") as string;
    const fileUrl = formData.get("file_url") as string;
    const storagePath = formData.get("storage_path") as string;
    const durationSeconds = parseInt(formData.get("duration_seconds") as string) || null;
    const fileSizeBytes = parseInt(formData.get("file_size_bytes") as string) || null;
    const fileFormat = formData.get("file_format") as string;
    const categoryId = formData.get("category_id") as string;
    const moodId = formData.get("mood_id") as string;
    const tagsString = formData.get("tags") as string;
    const isPremium = formData.get("is_premium") === "true";
    const isActive = formData.get("is_active") === "true";

    if (!title.trim()) {
      return {
        success: false,
        message: "Título é obrigatório.",
      };
    }

    if (!fileUrl.trim() && !storagePath.trim()) {
      return {
        success: false,
        message: "URL do arquivo ou upload é obrigatório.",
      };
    }

    // Parse tags
    const tags = tagsString
      ? tagsString.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];

    const { error } = await supabase
      .from("audio_files")
      .update({
        title: title.trim(),
        artist: artist.trim() || null,
        description: description.trim() || null,
        file_url: fileUrl.trim() || null,
        storage_path: storagePath.trim() || null,
        duration_seconds: durationSeconds,
        file_size_bytes: fileSizeBytes,
        file_format: fileFormat.trim() || null,
        category_id: categoryId || null,
        mood_id: moodId || null,
        tags: tags.length > 0 ? tags : null,
        is_premium: isPremium,
        is_active: isActive,
      })
      .eq("id", audioId);

    if (error) {
      console.error("Error updating audio file:", error);
      return {
        success: false,
        message: "Erro ao atualizar arquivo de áudio.",
      };
    }

    revalidatePath("/app/console/audio");

    return {
      success: true,
      message: "Arquivo de áudio atualizado com sucesso!",
    };
  } catch (error) {
    console.error("Error in updateAudioFile:", error);
    return {
      success: false,
      message: "Erro inesperado.",
    };
  }
}

export async function deleteAudioFile(audioId: string): Promise<AudioFileActionState> {
  try {
    await requireSuperAdmin();
    const supabase = await createClient();

    // First, get the audio file to check if it has a storage_path
    const { data: audioFile, error: fetchError } = await supabase
      .from("audio_files")
      .select("storage_path")
      .eq("id", audioId)
      .single();

    if (fetchError) {
      console.error("Error fetching audio file:", fetchError);
      return {
        success: false,
        message: "Erro ao buscar arquivo de áudio.",
      };
    }

    // Delete from storage if it's a stored file
    if (audioFile?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('audio-files')
        .remove([audioFile.storage_path]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error } = await supabase
      .from("audio_files")
      .delete()
      .eq("id", audioId);

    if (error) {
      console.error("Error deleting audio file:", error);
      return {
        success: false,
        message: "Erro ao excluir arquivo de áudio.",
      };
    }

    revalidatePath("/app/console/audio");

    return {
      success: true,
      message: "Arquivo de áudio excluído com sucesso!",
    };
  } catch (error) {
    console.error("Error in deleteAudioFile:", error);
    return {
      success: false,
      message: "Erro inesperado.",
    };
  }
}

export async function incrementAudioPlayCount(audioId: string): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Call the database function to increment play count
    const { error } = await supabase.rpc('increment_audio_play_count', {
      audio_id: audioId
    });

    if (error) {
      console.error("Error incrementing play count:", error);
    }
  } catch (error) {
    console.error("Error in incrementAudioPlayCount:", error);
  }
}