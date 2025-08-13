import { createClient } from '@/utils/supabase/server'

export type Plan = 'free' | 'premium'

export interface SubscriptionLimits {
  plan: Plan
  max_groups: number
  max_participants_per_group: number
  features: {
    email_notifications?: boolean
    custom_themes?: boolean
    advanced_analytics?: boolean
  }
}

export interface UserSubscription {
  plan: Plan
  plan_started_at?: string
  plan_expires_at?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('plan, plan_started_at, plan_expires_at, stripe_customer_id, stripe_subscription_id')
    .eq('id', userId)
    .single()
    
  if (error || !data) return null
  
  return data
}

export async function getSubscriptionLimits(plan: Plan): Promise<SubscriptionLimits | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subscription_limits')
    .select('*')
    .eq('plan', plan)
    .single()
    
  if (error || !data) return null
  
  return data
}

export async function getUserLimits(userId: string): Promise<SubscriptionLimits | null> {
  const subscription = await getUserSubscription(userId)
  if (!subscription) return null
  
  return await getSubscriptionLimits(subscription.plan)
}

export async function getUserGroupCount(userId: string): Promise<number> {
  const supabase = await createClient()
  
  const { count } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)
    
  return count || 0
}

export async function canUserCreateGroup(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
  const limits = await getUserLimits(userId)
  if (!limits) return { canCreate: false, reason: 'Could not fetch user limits' }
  
  // Premium users have unlimited groups (-1)
  if (limits.max_groups === -1) return { canCreate: true }
  
  const currentCount = await getUserGroupCount(userId)
  
  if (currentCount >= limits.max_groups) {
    return { 
      canCreate: false, 
      reason: `You have reached your limit of ${limits.max_groups} groups. Upgrade to Premium for unlimited groups.` 
    }
  }
  
  return { canCreate: true }
}

export async function canGroupHaveParticipants(groupId: string, participantCount: number): Promise<{ canAdd: boolean; reason?: string }> {
  const supabase = await createClient()
  
  // Get group owner
  const { data: group } = await supabase
    .from('groups')
    .select('owner_id')
    .eq('id', groupId)
    .single()
    
  if (!group) return { canAdd: false, reason: 'Group not found' }
  
  const limits = await getUserLimits(group.owner_id)
  if (!limits) return { canAdd: false, reason: 'Could not fetch user limits' }
  
  // Premium users have unlimited participants (-1)
  if (limits.max_participants_per_group === -1) return { canAdd: true }
  
  if (participantCount > limits.max_participants_per_group) {
    return { 
      canAdd: false, 
      reason: `This group can have a maximum of ${limits.max_participants_per_group} participants. Upgrade to Premium for unlimited participants.` 
    }
  }
  
  return { canAdd: true }
}

export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  if (!subscription || subscription.plan === 'free') return true // Free plan is always "active"
  
  if (!subscription.plan_expires_at) return true // No expiry means active
  
  const expiryDate = new Date(subscription.plan_expires_at)
  return expiryDate > new Date()
}

export async function upgradeUserToPremium(userId: string, stripeCustomerId?: string, stripeSubscriptionId?: string): Promise<void> {
  const supabase = await createClient()
  
  const updateData: {
    plan: string;
    plan_started_at: string;
    plan_expires_at: string;
    updated_at: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
  } = {
    plan: 'premium',
    plan_started_at: new Date().toISOString(),
    // Set expiry to 1 month from now (adjust based on your billing cycle)
    plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
  
  if (stripeCustomerId) updateData.stripe_customer_id = stripeCustomerId
  if (stripeSubscriptionId) updateData.stripe_subscription_id = stripeSubscriptionId
  
  await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
}

export async function downgradeUserToFree(userId: string): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('users')
    .update({
      plan: 'free',
      plan_started_at: null,
      plan_expires_at: null,
      stripe_subscription_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
}

export function getPlanDisplayName(plan: Plan): string {
  return plan === 'free' ? 'Gratuito' : 'Premium'
}

export function getPlanFeatures(plan: Plan): string[] {
  if (plan === 'free') {
    return [
      'Até 3 grupos',
      'Até 20 participantes por grupo',
      'Suporte por email'
    ]
  }
  
  return [
    'Grupos ilimitados',
    'Participantes ilimitados',
    'Notificações por email',
    'Temas personalizados',
    'Analytics avançados',
    'Suporte prioritário'
  ]
}