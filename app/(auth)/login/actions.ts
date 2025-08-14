"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export type LoginState = {
  success: null | boolean;
  message?: string;
};

export async function login(previousState: LoginState, formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/confirm`,
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Email enviado!",
  };
}

export async function signInWithGoogle() {
  console.log("🚀 Starting Google OAuth sign in");
  console.log("Redirect URL:", `${process.env.NEXT_PUBLIC_URL}/auth/confirm`);
  
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/confirm`,
    },
  });

  console.log("📊 OAuth initiation result:");
  console.log("- Error:", error);
  console.log("- Data URL exists:", !!data?.url);
  
  if (data?.url) {
    console.log("- OAuth URL:", data.url.substring(0, 50) + "...");
  }

  if (error) {
    console.error("❌ Google OAuth error:", error);
    redirect("/login?message=Could not authenticate user");
  }

  if (data?.url) {
    console.log("✅ Redirecting to Google OAuth URL");
    redirect(data.url);
  }
  
  console.error("❌ No OAuth URL received");
  redirect("/login?message=Could not authenticate user");
}

export async function signInWithApple() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/confirm`,
    },
  });

  if (error) {
    redirect("/login?message=Could not authenticate user");
  }

  redirect(data.url);
}

