"use server";

import { createClient } from "@/utils/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type AudioCategoryActionState = {
  success: boolean;
  message?: string;
  categoryId?: string;
};

export async function createAudioCategory(
  _previousState: AudioCategoryActionState,
  formData: FormData
): Promise<AudioCategoryActionState> {
  try {
    await requireSuperAdmin();
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const icon = formData.get("icon") as string;
    const color = formData.get("color") as string;
    const sortOrder = parseInt(formData.get("sort_order") as string) || 0;

    if (!name.trim()) {
      return {
        success: false,
        message: "Nome da categoria é obrigatório.",
      };
    }

    const { data, error } = await supabase
      .from("audio_categories")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        icon: icon.trim() || null,
        color: color || null,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating audio category:", error);
      if (error.code === "23505") {
        return {
          success: false,
          message: "Já existe uma categoria com este nome.",
        };
      }
      return {
        success: false,
        message: "Erro ao criar categoria. Tente novamente.",
      };
    }

    revalidatePath("/app/console/audio");

    return {
      success: true,
      message: "Categoria criada com sucesso!",
      categoryId: data.id,
    };
  } catch (error) {
    console.error("Error in createAudioCategory:", error);
    return {
      success: false,
      message: "Erro inesperado. Tente novamente.",
    };
  }
}

export async function updateAudioCategory(
  categoryId: string,
  _previousState: AudioCategoryActionState,
  formData: FormData
): Promise<AudioCategoryActionState> {
  try {
    await requireSuperAdmin();
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const icon = formData.get("icon") as string;
    const color = formData.get("color") as string;
    const sortOrder = parseInt(formData.get("sort_order") as string) || 0;
    const isActive = formData.get("is_active") === "true";

    if (!name.trim()) {
      return {
        success: false,
        message: "Nome da categoria é obrigatório.",
      };
    }

    const { error } = await supabase
      .from("audio_categories")
      .update({
        name: name.trim(),
        description: description.trim() || null,
        icon: icon.trim() || null,
        color: color || null,
        sort_order: sortOrder,
        is_active: isActive,
      })
      .eq("id", categoryId);

    if (error) {
      console.error("Error updating audio category:", error);
      if (error.code === "23505") {
        return {
          success: false,
          message: "Já existe uma categoria com este nome.",
        };
      }
      return {
        success: false,
        message: "Erro ao atualizar categoria.",
      };
    }

    revalidatePath("/app/console/audio");

    return {
      success: true,
      message: "Categoria atualizada com sucesso!",
    };
  } catch (error) {
    console.error("Error in updateAudioCategory:", error);
    return {
      success: false,
      message: "Erro inesperado.",
    };
  }
}

export async function deleteAudioCategory(categoryId: string): Promise<AudioCategoryActionState> {
  try {
    await requireSuperAdmin();
    const supabase = await createClient();

    // Check if category has associated audio files
    const { count } = await supabase
      .from("audio_files")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId);

    if (count && count > 0) {
      return {
        success: false,
        message: `Não é possível excluir. Esta categoria possui ${count} áudio(s) associado(s).`,
      };
    }

    const { error } = await supabase
      .from("audio_categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.error("Error deleting audio category:", error);
      return {
        success: false,
        message: "Erro ao excluir categoria.",
      };
    }

    revalidatePath("/app/console/audio");

    return {
      success: true,
      message: "Categoria excluída com sucesso!",
    };
  } catch (error) {
    console.error("Error in deleteAudioCategory:", error);
    return {
      success: false,
      message: "Erro inesperado.",
    };
  }
}