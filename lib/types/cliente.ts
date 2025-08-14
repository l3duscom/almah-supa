// Types for cliente table and related operations

export interface Endereco {
  rua?: string
  cidade?: string
  estado?: string
  cep?: string
  pais?: string
}

export interface ClientePreferencias {
  tema?: 'dark' | 'light' | 'auto'
  idioma?: string
  timezone?: string
  notificacoes_email?: boolean
  notificacoes_push?: boolean
  [key: string]: string | boolean | number | undefined
}

export interface ClienteConfiguracoes {
  privacidade_perfil?: 'publico' | 'privado' | 'amigos'
  mostrar_email?: boolean
  mostrar_telefone?: boolean
  mostrar_redes_sociais?: boolean
  [key: string]: string | boolean | number | undefined
}

export interface Cliente {
  id: string
  
  // Basic Info
  email: string
  nome_completo?: string
  nome_display?: string
  avatar_url?: string
  
  // Contact Information
  telefone?: string
  whatsapp?: string
  endereco?: Endereco
  
  // Social Media & Links
  instagram?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  tiktok?: string
  website?: string
  
  // OAuth Provider Data
  google_id?: string
  google_picture?: string
  google_locale?: string
  provider_data?: Record<string, unknown>
  
  // Auth & Subscription (now in clientes table)
  role?: 'user' | 'admin' | 'super_admin'
  plan?: 'free' | 'premium'
  plan_expires_at?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  current_price_id?: string
  
  // Preferences & Settings
  preferencias?: ClientePreferencias
  configuracoes?: ClienteConfiguracoes
  
  // Business/Professional Info
  empresa?: string
  cargo?: string
  setor?: string
  
  // Personal Info
  data_nascimento?: string
  genero?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar'
  
  // Engagement & Analytics
  ultimo_acesso?: string
  origem_cadastro?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  
  // Status & Flags
  aceita_marketing?: boolean
  aceita_notificacoes?: boolean
  status?: 'ativo' | 'inativo' | 'suspenso'
  
  // Timestamps
  created_at?: string
  updated_at?: string
}

// ClienteCompleto is now the same as Cliente since everything is in one table
export type ClienteCompleto = Cliente


export interface ClientePerfilForm {
  nome_display?: string
  telefone?: string
  whatsapp?: string
  endereco?: Endereco
  instagram?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  tiktok?: string
  website?: string
  empresa?: string
  cargo?: string
  setor?: string
  data_nascimento?: string
  genero?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar'
  preferencias?: ClientePreferencias
  configuracoes?: ClienteConfiguracoes
}

// API response types
export interface ClienteUpdateResponse {
  success: boolean
  cliente?: Cliente
  error?: string
}

export interface ClienteProfileResponse {
  success: boolean
  cliente?: ClienteCompleto
  error?: string
}