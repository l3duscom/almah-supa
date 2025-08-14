"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export type LoginState = {
  success: null | boolean;
  message?: string;
};

export async function login(_previousState: LoginState, formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  console.log("=== MAGIC LINK DEBUG ===");
  console.log("Email:", email);
  console.log("Redirect URL:", `${process.env.NEXT_PUBLIC_URL}/auth/confirm`);
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_URL?.replace(/\/$/, '')}/auth/confirm`,
    },
  });

  console.log("Supabase signInWithOtp result:");
  console.log("- Error:", error);

  if (error) {
    console.log("❌ Magic link failed:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }

  console.log("✅ Magic link sent successfully");
  return {
    success: true,
    message: "Email enviado!",
  };
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // With new API Keys we use PKCE; callback will hit /auth/confirm which exchanges code
      redirectTo: `${process.env.NEXT_PUBLIC_URL?.replace(/\/$/, '')}/auth/confirm`,
    },
  });

  if (error || !data?.url) {
    redirect("/login?message=Could not authenticate user");
  }

  redirect(data.url);
}

export async function signInWithApple() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_URL?.replace(/\/$/, '')}/auth/confirm`,
    },
  });

  if (error) {
    redirect("/login?message=Could not authenticate user");
  }

  redirect(data.url);
}

