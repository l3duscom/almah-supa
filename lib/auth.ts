import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user profile with role and subscription info
  const { data: profile } = await supabase
    .from('users')
    .select('role, name, email, plan, plan_expires_at, plan_started_at')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    role: profile?.role || 'user',
    name: profile?.name,
    profile_email: profile?.email,
    plan: profile?.plan || 'free',
    plan_expires_at: profile?.plan_expires_at,
    plan_started_at: profile?.plan_started_at
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

export async function requireSuperAdmin() {
  const user = await requireAuth()
  
  if (user.role !== 'super_admin') {
    redirect('/app')
  }
  
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    redirect('/app')
  }
  
  return user
}