import { requireAuth } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import DiaryInterface from "@/components/diary-interface";
import DiaryNavigation from "@/components/diary-navigation";
import { format } from "date-fns";

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireAuth();
  const { date } = await searchParams;
  const supabase = await createClient();

  // Use current date if no date specified, com timezone local consistente
  const targetDate = date ? new Date(date) : (() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  })();
  const dateString = format(targetDate, "yyyy-MM-dd");
  
  // Debug temporário
  console.log("Debug DiaryPage:", {
    dateParam: date,
    targetDate,
    dateString,
    newDate: new Date(),
    todayFormatted: format(new Date(), "yyyy-MM-dd")
  });

  // Get diary entries for the selected date
  const { data: entries, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", dateString)
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

      <DiaryNavigation currentDate={dateString} />

      <DiaryInterface
        entries={entries || []}
        currentDate={dateString}
      />
    </div>
  );
}