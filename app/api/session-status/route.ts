import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    // Try to get user from database if authenticated
    let dbUser = null;
    if (user?.id) {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!dbError) {
        dbUser = data;
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      auth: {
        user: user ? {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          app_metadata: user.app_metadata,
          user_metadata: user.user_metadata
        } : null,
        error: authError?.message || null,
        hasSession: !!user
      },
      session: {
        exists: !!session?.session,
        expiresAt: session?.session?.expires_at || null,
        error: sessionError?.message || null
      },
      database: {
        user: dbUser,
        synced: !!(user && dbUser)
      }
    });
  } catch (err) {
    return NextResponse.json({
      error: "Failed to check session status",
      details: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}