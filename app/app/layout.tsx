import Header from "@/components/header";
import UpgradeBanner from "@/components/upgrade-banner";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserGroupCount } from "@/lib/subscription";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  // Get user info for upgrade banner
  const user = await getCurrentUser();
  const groupCount = user ? await getUserGroupCount(user.id) : 0;
  const plan = user?.plan || 'free';

  return (
    <div>
      <UpgradeBanner groupCount={groupCount} plan={plan} />
      <Header />
      {children}
    </div>
  );
}
