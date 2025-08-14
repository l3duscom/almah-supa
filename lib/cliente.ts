import { createClient } from '@/utils/supabase/server'
import { ClienteCompleto } from './types/cliente'

export async function getClienteProfile(userId: string): Promise<ClienteCompleto | null> {
  const supabase = await createClient()
  
  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching cliente profile:', error)
    return null
  }

  return cliente
}


export async function createClienteProfile(userId: string, email: string, userData: Record<string, unknown> = {}) {
  const supabase = await createClient()
  
  // Always update these core fields from Google data
  const coreUpdateData: Record<string, string> = {
    email,
    ultimo_acesso: new Date().toISOString(),
  }

  // Add Google-specific data if available
  if (userData.name || userData.full_name) {
    const fullName = (userData.name as string) || (userData.full_name as string)
    coreUpdateData.nome_completo = fullName
    coreUpdateData.nome_display = fullName
  }

  if (userData.picture || userData.avatar_url) {
    coreUpdateData.avatar_url = (userData.picture as string) || (userData.avatar_url as string)
    coreUpdateData.google_picture = (userData.picture as string) || (userData.avatar_url as string)
  }

  // Complete profile data for new users
  const clienteData = {
    id: userId,
    ...coreUpdateData,
    nome_completo: coreUpdateData.nome_completo || email.split('@')[0],
    nome_display: coreUpdateData.nome_display || email.split('@')[0],
    google_id: userData.sub as string,
    google_locale: userData.locale as string,
    provider_data: userData,
    origem_cadastro: userData.sub ? 'google' : 'email',
  }

  const { data, error } = await supabase
    .from('clientes')
    .upsert(clienteData, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('Error creating/updating cliente profile:', error)
    return null
  }

  return data
}