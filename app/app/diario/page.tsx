import { requireAuth } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import DiaryInterface from "@/components/diary-interface";
import DiaryNavigation from "@/components/diary-navigation";
import { getTodayDateString } from "@/lib/date-utils";

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireAuth();
  const { date } = await searchParams;
  const supabase = await createClient();

  // SOLUÇÃO ROBUSTA: Se não há parâmetro, usa função que funciona no servidor e cliente
  const finalDateString = date || getTodayDateString();
  

  // Get diary page and entries for the selected date
  const { data: page } = await supabase
    .from("diary_pages")
    .select(`
      id,
      title,
      date,
      created_at,
      diary_entries (
        id,
        content,
        mood,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", user.id)
    .eq("date", finalDateString)
    .single();

  // Extract entries from page or use empty array
  const entries = page?.diary_entries || [];


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">📖 Meu Diário</h1>
        <p className="text-muted-foreground">
          Um espaço seguro para seus pensamentos e sentimentos
        </p>
      </div>

      <DiaryNavigation currentDate={finalDateString} />

      <DiaryInterface
        entries={entries || []}
        currentDate={finalDateString}
      />
    </div>
  );
}