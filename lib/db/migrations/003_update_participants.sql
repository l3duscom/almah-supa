-- Update participants table
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_group_id ON public.participants(group_id);
CREATE INDEX IF NOT EXISTS idx_participants_assigned_to ON public.participants(assigned_to);
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);

-- Enable RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view participants in their groups" ON public.participants;
DROP POLICY IF EXISTS "Users can manage participants in their groups" ON public.participants;

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