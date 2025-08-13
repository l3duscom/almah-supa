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

-- Create policy for subscription_limits (read-only for all authenticated users)
CREATE POLICY "Users can view subscription limits" ON public.subscription_limits
  FOR SELECT USING (auth.role() = 'authenticated');

-- Super admins can manage subscription limits
CREATE POLICY "Super admins can manage subscription limits" ON public.subscription_limits
  FOR ALL USING (
    (auth.jwt() ->> 'role')::text = 'service_role'
    OR
    auth.email() IN ('ledusdigital@gmail.com', 'admin@almah-supa.com')
  );