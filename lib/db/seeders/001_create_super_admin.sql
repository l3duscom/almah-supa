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
        
        -- Alternative: Create a placeholder that will be updated when user signs up
        -- This ensures the system knows what email should become super admin
        INSERT INTO public.users (id, email, name, role, created_at)
        VALUES (
            gen_random_uuid(), -- This will be replaced when real user signs up
            super_admin_email,
            'Super Admin',
            'super_admin',
            NOW()
        ) ON CONFLICT (email) DO NOTHING;
        
    ELSE
        RAISE NOTICE 'Super admin already exists, skipping creation.';
    END IF;
END
$$;