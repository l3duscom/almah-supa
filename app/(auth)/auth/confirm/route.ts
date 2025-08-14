import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  console.log("=== AUTH CONFIRM CALLBACK ===");
  console.log("URL:", request.url);
  console.log("Search params:", Object.fromEntries(searchParams.entries()));
  console.log("Code exists:", !!code);
  console.log("Token hash exists:", !!token_hash);
  console.log("Type:", type);
  console.log("Next:", next);

  const supabase = await createClient();

  // Handle OAuth callback (Google, etc.)
  if (code) {
    console.log(
      "🔄 Processing OAuth callback with code:",
      code.substring(0, 10) + "..."
    );

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      console.log("📊 OAuth exchange result:");
      console.log("- Error:", error);
      console.log("- Session exists:", !!data.session);
      console.log("- User exists:", !!data.user);

      if (data.user) {
        console.log("👤 User info:");
        console.log("- ID:", data.user.id);
        console.log("- Email:", data.user.email);
        console.log("- Created:", data.user.created_at);
      }

      if (!error && data.session) {
        console.log(
          "✅ OAuth session exchange successful, redirecting to:",
          next
        );
        redirect(next);
      } else {
        console.error("❌ OAuth session exchange failed:", error);
        redirect(
          "/login?message=OAuth exchange failed: " +
            (error?.message || "Unknown error")
        );
      }
    } catch (exchangeError) {
      console.error("💥 Exception during OAuth exchange:", exchangeError);
      console.error("Stack trace:", (exchangeError as Error).stack);
      console.error(
        "Full error details:",
        JSON.stringify(exchangeError, null, 2)
      );
      redirect(
        "/login?message=OAuth exchange exception: " +
          (exchangeError as Error).message
      );
    }
  }

  // Handle email OTP (magic link)
  if (token_hash && type) {
    console.log("📧 Processing email OTP with type:", type);
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      console.log(
        "✅ Email OTP verification successful, redirecting to:",
        next
      );
      redirect(next);
    } else {
      console.error("❌ Email OTP verification failed:", error);
      redirect(
        "/login?message=Email verification failed: " +
          (error?.message || "Unknown error")
      );
    }
  }

  // If we get here, something went wrong
  console.error(
    "❌ Authentication failed - no valid code or token_hash/type provided"
  );
  console.log("Available params:", Object.fromEntries(searchParams.entries()));
  redirect("/login?message=No valid authentication parameters provided");
}
