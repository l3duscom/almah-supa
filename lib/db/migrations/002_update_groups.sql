-- Update groups table to reference new users table and add more fields
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'));
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS description TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_groups_owner_id ON public.groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON public.groups(created_at);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON public.groups;

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