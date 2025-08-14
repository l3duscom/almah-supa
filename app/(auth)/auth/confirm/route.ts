import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createClienteProfile } from "@/lib/cliente";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  const supabase = await createClient();

  // Handle OAuth callback (Google, etc.)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Sync user data from OAuth provider
      await syncUserProfile(supabase);
      redirect(next);
    }
  }

  // Handle email OTP (magic link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // Sync user data after successful login
      await syncUserProfile(supabase);
      redirect(next);
    }
  }

  // redirect the user to an error page with some instructions
  redirect("/login?message=Could not authenticate user");
}

async function syncUserProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Extract user data from auth metadata
    const userData = {
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      email: user.email,
      picture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      ...user.user_metadata
    };

    // Create or update cliente profile
    await createClienteProfile(user.id, user.email!, userData);
  } catch (error) {
    console.error('Error syncing user profile:', error);
    // Don't throw error to avoid breaking the auth flow
  }
}
