-- Migration: Create simplified clientes table
-- Created: 2025-01-13
-- Description: Single table with all user data including auth fields

-- Create clientes table with comprehensive user information
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info (some may come from OAuth)
  email TEXT NOT NULL,
  nome_completo TEXT,
  nome_display TEXT,
  avatar_url TEXT,
  
  -- Contact Information
  telefone TEXT,
  whatsapp TEXT,
  endereco JSONB,
  
  -- Social Media & Links
  instagram TEXT,
  facebook TEXT,
  twitter TEXT,
  linkedin TEXT,
  tiktok TEXT,
  website TEXT,
  
  -- OAuth Provider Data
  google_id TEXT,
  google_picture TEXT,
  google_locale TEXT,
  provider_data JSONB,
  
  -- Auth & Subscription (instead of separate users table)
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_price_id TEXT,
  
  -- Preferences & Settings
  preferencias JSONB DEFAULT '{}',
  configuracoes JSONB DEFAULT '{}',
  
  -- Business/Professional Info
  empresa TEXT,
  cargo TEXT,
  setor TEXT,
  
  -- Personal Info
  data_nascimento DATE,
  genero TEXT CHECK (genero IN ('masculino', 'feminino', 'outro', 'prefiro_nao_informar')),
  
  -- Engagement & Analytics
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  origem_cadastro TEXT DEFAULT 'website',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Status & Flags
  perfil_completo BOOLEAN DEFAULT FALSE,
  aceita_marketing BOOLEAN DEFAULT TRUE,
  aceita_notificacoes BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_role ON public.clientes(role);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON public.clientes(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_clientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_clientes_updated_at ON public.clientes;
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_clientes_updated_at();

-- Function to handle user creation with OAuth data
CREATE OR REPLACE FUNCTION public.handle_new_cliente()
RETURNS TRIGGER AS $$
DECLARE
  provider_name TEXT;
  raw_data JSONB;
BEGIN
  provider_name := COALESCE(NEW.app_metadata->>'provider', 'email');
  raw_data := NEW.raw_user_meta_data;
  
  INSERT INTO public.clientes (
    id, 
    email, 
    nome_completo,
    nome_display,
    avatar_url,
    google_id,
    google_picture,
    google_locale,
    provider_data,
    origem_cadastro,
    ultimo_acesso
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      raw_data->>'name',
      raw_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      raw_data->>'name',
      raw_data->>'full_name', 
      split_part(NEW.email, '@', 1)
    ),
    raw_data->>'avatar_url',
    CASE WHEN provider_name = 'google' THEN raw_data->>'sub' ELSE NULL END,
    CASE WHEN provider_name = 'google' THEN raw_data->>'picture' ELSE NULL END,
    CASE WHEN provider_name = 'google' THEN raw_data->>'locale' ELSE NULL END,
    raw_data,
    provider_name,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    ultimo_acesso = NOW(),
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create/update cliente profile
DROP TRIGGER IF EXISTS on_auth_user_cliente_created ON auth.users;
CREATE TRIGGER on_auth_user_cliente_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_cliente();

-- Enable RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cliente profile" ON public.clientes
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own cliente profile" ON public.clientes
  FOR UPDATE USING (auth.uid() = id);

-- Super admins can view and manage all clientes
CREATE POLICY "Super admins can view all clientes" ON public.clientes
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text = 'service_role'
    OR
    auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
  );

CREATE POLICY "Super admins can update all clientes" ON public.clientes
  FOR UPDATE USING (
    (auth.jwt() ->> 'role')::text = 'service_role'
    OR
    auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
  );

-- Grant permissions
GRANT ALL ON public.clientes TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.clientes TO authenticated;