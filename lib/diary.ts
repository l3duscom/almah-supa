import { createClient } from "@/utils/supabase/server";

/**
 * Get the total number of diary pages for a user
 */
export async function getUserDiaryPageCount(userId: string): Promise<number> {
  const supabase = await createClient();
  
  const { count, error } = await supabase
    .from("diary_pages")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Error counting diary pages:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Get diary pages for a user with pagination
 */
export async function getUserDiaryPages(
  userId: string,
  limit: number = 10,
  offset: number = 0
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("diary_pages")
    .select(`
      id,
      date,
      title,
      created_at,
      diary_entries (count)
    `)
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching diary pages:", error);
    return [];
  }

  return data || [];
}

/**
 * Check if user can create more diary pages based on their plan
 */
export async function canUserCreateDiaryPage(
  userId: string,
  userPlan: string = "free"
): Promise<{ canCreate: boolean; currentCount: number; limit: number }> {
  const currentCount = await getUserDiaryPageCount(userId);
  
  // Define limits based on plan
  const limits = {
    free: 30,      // 30 pages for free plan (1 month)
    premium: 365,  // 365 pages for premium (1 year)
    unlimited: -1  // No limit
  };
  
  const limit = limits[userPlan as keyof typeof limits] || limits.free;
  const canCreate = limit === -1 || currentCount < limit;
  
  return {
    canCreate,
    currentCount,
    limit
  };
}