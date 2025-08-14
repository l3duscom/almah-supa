-- Complete Database Migration - All Migrations Combined
-- WARNING: This will create ALL tables, functions, and policies
-- Use with extreme caution, preferably on a fresh database

-- ==================================================
-- Migration 000: Create Initial Tables
-- ==================================================

-- Create _migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS public._migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.participants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_groups_owner_id ON public.groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_participants_group_id ON public.participants(group_id);

-- Enable RLS on both tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- ==================================================
-- Migration 001: Create Users Table
-- ==================================================

-- Create users table to extend Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create function to handle user creation on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update all users" ON public.users;

-- Create policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Super admins can view and manage all users (fixed to avoid recursion)
CREATE POLICY "Super admins can view all users" ON public.users
  FOR SELECT USING (
    -- Use service role bypass or hardcoded super admin emails to avoid recursion
    (auth.jwt() ->> 'role')::text = 'service_role'
    OR
    auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
  );

CREATE POLICY "Super admins can update all users" ON public.users
  FOR UPDATE USING (
    (auth.jwt() ->> 'role')::text = 'service_role'
    OR
    auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
  );

-- ==================================================
-- Migration 002: Update Groups Table
-- ==================================================

-- Update groups table to add more fields
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'));
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS description TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_groups_owner_id ON public.groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON public.groups(created_at);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON public.groups;
DROP POLICY IF EXISTS "Super admins can view all groups" ON public.groups;

-- Create policies
CREATE POLICY "Users can view their own groups" ON public.groups
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own groups" ON public.groups
  FOR UPDATE USING (owner_id = auth.uid());

-- Super admins can view all groups (fixed to avoid recursion)
CREATE POLICY "Super admins can view all groups" ON public.groups
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text = 'service_role'
    OR
    auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
    OR
    owner_id = auth.uid()
  );

-- ==================================================
-- Migration 003: Update Participants Table
-- ==================================================

-- Update participants table
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_group_id ON public.participants(group_id);
CREATE INDEX IF NOT EXISTS idx_participants_assigned_to ON public.participants(assigned_to);
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view participants in their groups" ON public.participants;
DROP POLICY IF EXISTS "Users can manage participants in their groups" ON public.participants;
DROP POLICY IF EXISTS "Users can insert participants in their groups" ON public.participants;
DROP POLICY IF EXISTS "Users can update participants in their groups" ON public.participants;
DROP POLICY IF EXISTS "Super admins can view all participants" ON public.participants;

-- Create policies
CREATE POLICY "Users can view participants in their groups" ON public.participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = participants.group_id 
      AND groups.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert participants in their groups" ON public.participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = participants.group_id 
      AND groups.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update participants in their groups" ON public.participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = participants.group_id 
      AND groups.owner_id = auth.uid()
    )
  );

-- Super admins can view all participants (fixed to avoid recursion)
CREATE POLICY "Super admins can view all participants" ON public.participants
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text = 'service_role'
    OR
    auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
    OR
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = participants.group_id 
      AND groups.owner_id = auth.uid()
    )
  );

-- ==================================================
-- Migration 004: Add Subscription Plans
-- ==================================================

-- Add subscription plan fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Create index for plan queries
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_users_plan_expires_at ON public.users(plan_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);

-- Create subscription_limits table for plan-based feature limits
CREATE TABLE IF NOT EXISTS public.subscription_limits (
  plan TEXT PRIMARY KEY CHECK (plan IN ('free', 'premium')),
  max_groups INTEGER NOT NULL,
  max_participants_per_group INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default limits
INSERT INTO public.subscription_limits (plan, max_groups, max_participants_per_group, features) VALUES
  ('free', 3, 20, '{"email_notifications": false, "custom_themes": false, "advanced_analytics": false}'),
  ('premium', -1, -1, '{"email_notifications": true, "custom_themes": true, "advanced_analytics": true}')
ON CONFLICT (plan) DO UPDATE SET
  max_groups = EXCLUDED.max_groups,
  max_participants_per_group = EXCLUDED.max_participants_per_group,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Enable RLS on subscription_limits
ALTER TABLE public.subscription_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view subscription limits" ON public.subscription_limits;
DROP POLICY IF EXISTS "Super admins can manage subscription limits" ON public.subscription_limits;

-- Create policies for subscription_limits
CREATE POLICY "Users can view subscription limits" ON public.subscription_limits
  FOR SELECT USING (auth.role() = 'authenticated');

-- Super admins can manage subscription limits
CREATE POLICY "Super admins can manage subscription limits" ON public.subscription_limits
  FOR ALL USING (
    (auth.jwt() ->> 'role')::text = 'service_role'
    OR
    auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
  );

-- ==================================================
-- Migration 005: Create Pricing Plans
-- ==================================================

-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., "Premium"
  description TEXT,
  stripe_price_id TEXT NOT NULL UNIQUE, -- Stripe Price ID
  stripe_product_id TEXT NOT NULL, -- Stripe Product ID
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'quarterly', 'semiannual', 'annual')),
  price_cents INTEGER NOT NULL, -- Price in cents
  currency TEXT NOT NULL DEFAULT 'brl',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]', -- Array of features
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON public.pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_billing_period ON public.pricing_plans(billing_period);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_sort_order ON public.pricing_plans(sort_order);

-- Enable RLS
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Pricing plans are viewable by everyone" ON public.pricing_plans;
DROP POLICY IF EXISTS "Only super admins can manage pricing plans" ON public.pricing_plans;

-- Create policies
CREATE POLICY "Pricing plans are viewable by everyone" ON public.pricing_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only super admins can manage pricing plans" ON public.pricing_plans
  FOR ALL USING (
    auth.email() IN (
      'ledusdigital@gmail.com',
      'admin@almah-supa.com'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pricing_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS pricing_plans_updated_at ON public.pricing_plans;

-- Trigger for updated_at
CREATE TRIGGER pricing_plans_updated_at
  BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_plans_updated_at();

-- ==================================================
-- Migration 006: Add Current Price ID
-- ==================================================

-- Add current_price_id column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS current_price_id TEXT;


-- ==================================================
-- Migration Records
-- ==================================================

-- Insert migration records
INSERT INTO public._migrations (version, name, executed_at) VALUES
('000', 'create_initial_tables', NOW()),
('001', 'create_users', NOW()),
('002', 'update_groups', NOW()),
('003', 'update_participants', NOW()),
('004', 'add_subscription_plans', NOW()),
('005', 'create_pricing_plans', NOW()),
('006', 'add_current_price_id', NOW())
ON CONFLICT (version) DO NOTHING;

-- Success message
SELECT 'All migrations applied successfully!' as status;