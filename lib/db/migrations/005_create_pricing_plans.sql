-- Migration: Create pricing plans table
-- Created: 2025-01-13

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

-- RLS Policies - Drop and recreate to avoid conflicts
DROP POLICY IF EXISTS "Pricing plans are viewable by everyone" ON public.pricing_plans;
DROP POLICY IF EXISTS "Only super admins can manage pricing plans" ON public.pricing_plans;

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

-- Trigger for updated_at
CREATE TRIGGER pricing_plans_updated_at
  BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_plans_updated_at();

-- Add migration record
INSERT INTO public._migrations (version, name, executed_at)
VALUES ('005', 'create_pricing_plans', NOW())
ON CONFLICT (version) DO NOTHING;