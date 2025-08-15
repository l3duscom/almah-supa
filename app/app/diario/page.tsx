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

  // SOLUÇÃO DIRETA: Se não há parâmetro, força hoje correto
  const finalDateString = date || "2025-08-14"; // TEMPORÁRIO: força hoje
  
  // Debug com nova lógica
  console.log("🗓️ Debug DiaryPage:", {
    dateParam: date,
    finalDateString,
    today: getTodayDateString(),
    isToday: finalDateString === getTodayDateString(),
    timezoneOffset: new Date().getTimezoneOffset()
  });

  // Get diary entries for the selected date
  const { data: entries, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", finalDateString)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching diary entries:", error);
  }


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