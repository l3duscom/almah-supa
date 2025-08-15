import { createClient } from "@/utils/supabase/server";

export interface AudioFile {
  id: string;
  title: string;
  artist: string | null;
  description: string | null;
  file_url: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  file_format: string | null;
  category_id: string | null;
  mood_id: string | null;
  tags: string[] | null;
  is_premium: boolean;
  is_active: boolean;
  play_count: number;
  created_at: string;
  category?: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  mood?: {
    id: string;
    name: string;
    mood_level: number;
    color: string | null;
  };
}

export interface AudioCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface AudioMood {
  id: string;
  name: string;
  description: string | null;
  mood_level: number;
  color: string | null;
  is_active: boolean;
}

/**
 * Get all active audio files for the player
 */
export async function getActiveAudioFiles(userPlan: string = "free"): Promise<AudioFile[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("audio_files")
    .select(`
      *,
      audio_categories!inner (
        id,
        name,
        icon,
        color
      ),
      audio_moods (
        id,
        name,
        mood_level,
        color
      )
    `)
    .eq("is_active", true)
    .eq("audio_categories.is_active", true)
    .or(`is_premium.eq.false,is_premium.eq.${userPlan === 'premium'}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching audio files:", error);
    return [];
  }

  return data.map(file => ({
    ...file,
    category: file.audio_categories,
    mood: file.audio_moods,
  })) || [];
}

/**
 * Get audio files by category
 */
export async function getAudioFilesByCategory(
  categoryId: string,
  userPlan: string = "free"
): Promise<AudioFile[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("audio_files")
    .select(`
      *,
      audio_categories!inner (
        id,
        name,
        icon,
        color
      ),
      audio_moods (
        id,
        name,
        mood_level,
        color
      )
    `)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .eq("audio_categories.is_active", true)
    .or(`is_premium.eq.false,is_premium.eq.${userPlan === 'premium'}`)
    .order("title");

  if (error) {
    console.error("Error fetching audio files by category:", error);
    return [];
  }

  return data.map(file => ({
    ...file,
    category: file.audio_categories,
    mood: file.audio_moods,
  })) || [];
}

/**
 * Get audio files by mood
 */
export async function getAudioFilesByMood(
  moodLevel: number,
  userPlan: string = "free"
): Promise<AudioFile[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("audio_files")
    .select(`
      *,
      audio_categories (
        id,
        name,
        icon,
        color
      ),
      audio_moods!inner (
        id,
        name,
        mood_level,
        color
      )
    `)
    .eq("is_active", true)
    .eq("audio_moods.mood_level", moodLevel)
    .eq("audio_moods.is_active", true)
    .or(`is_premium.eq.false,is_premium.eq.${userPlan === 'premium'}`)
    .order("title");

  if (error) {
    console.error("Error fetching audio files by mood:", error);
    return [];
  }

  return data.map(file => ({
    ...file,
    category: file.audio_categories,
    mood: file.audio_moods,
  })) || [];
}

/**
 * Get all active categories
 */
export async function getActiveAudioCategories(): Promise<AudioCategory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("audio_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("Error fetching audio categories:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all active moods
 */
export async function getActiveAudioMoods(): Promise<AudioMood[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("audio_moods")
    .select("*")
    .eq("is_active", true)
    .order("mood_level");

  if (error) {
    console.error("Error fetching audio moods:", error);
    return [];
  }

  return data || [];
}

/**
 * Search audio files by title, artist, or tags
 */
export async function searchAudioFiles(
  query: string,
  userPlan: string = "free"
): Promise<AudioFile[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("audio_files")
    .select(`
      *,
      audio_categories (
        id,
        name,
        icon,
        color
      ),
      audio_moods (
        id,
        name,
        mood_level,
        color
      )
    `)
    .eq("is_active", true)
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%,tags.cs.{${query}}`)
    .or(`is_premium.eq.false,is_premium.eq.${userPlan === 'premium'}`)
    .order("play_count", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error searching audio files:", error);
    return [];
  }

  return data.map(file => ({
    ...file,
    category: file.audio_categories,
    mood: file.audio_moods,
  })) || [];
}