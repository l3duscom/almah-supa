-- Seeder to create super admin user
-- This will only run if no super admin exists

DO $$
DECLARE
    super_admin_email TEXT := 'ledusdigital@gmail.com';
    super_admin_exists BOOLEAN;
BEGIN
    -- Check if super admin already exists
    SELECT EXISTS(
        SELECT 1 FROM public.users 
        WHERE role = 'super_admin'
    ) INTO super_admin_exists;
    
    -- Only create super admin if none exists
    IF NOT super_admin_exists THEN
        -- Insert super admin user directly into users table
        -- Note: In production, you should create this user through Supabase Auth
        -- and then update their role, or use Supabase Auth Admin API
        
        RAISE NOTICE 'No super admin found. Please create a super admin user manually:';
        RAISE NOTICE '1. Go to your Supabase Auth dashboard';
        RAISE NOTICE '2. Create a user with email: %', super_admin_email;
        RAISE NOTICE '3. Run the following SQL after user creation:';
        RAISE NOTICE 'UPDATE public.users SET role = ''super_admin'' WHERE email = ''%'';', super_admin_email;
        
        -- Do NOT create placeholder users directly in public.users
        -- The users table has foreign key constraint to auth.users
        -- Users must be created through Supabase Auth first
        
        RAISE NOTICE 'Super admin setup complete. Follow the instructions above.';
        
    ELSE
        RAISE NOTICE 'Super admin already exists, skipping creation.';
    END IF;
END
$$;