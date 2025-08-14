-- Seeder to create super admin user
-- This will only run if no super admin exists

DO $$
DECLARE
    super_admin_email TEXT := 'ledusdigital@gmail.com';
    super_admin_exists BOOLEAN;
    user_id uuid;
    existing_user_id uuid;
BEGIN
    -- Check if super admin already exists
    SELECT EXISTS(
        SELECT 1 FROM public.users 
        WHERE role = 'super_admin'
    ) INTO super_admin_exists;
    
    -- Only create super admin if none exists
    IF NOT super_admin_exists THEN
        -- First check if the user exists in auth.users
        SELECT id INTO existing_user_id
        FROM auth.users
        WHERE email = super_admin_email;
        
        -- Use existing user id if found, otherwise generate new one
        user_id := COALESCE(existing_user_id, gen_random_uuid());
        
        IF existing_user_id IS NULL THEN
            -- Create user in auth.users if doesn't exist
            INSERT INTO auth.users (
                id,
                email,
                email_confirmed_at,
                instance_id,
                role,
                created_at,
                updated_at,
                confirmation_sent_at,
                email_change_sent_at,
                last_sign_in_at,
                raw_app_meta_data,
                raw_user_meta_data,
                is_super_admin,
                encrypted_password
            )
            VALUES (
                user_id,
                super_admin_email,
                NOW(),
                '00000000-0000-0000-0000-000000000000',
                'authenticated',
                NOW(),
                NOW(),
                NOW(),
                NOW(),
                NOW(),
                '{"provider":"email","providers":["email"]}',
                '{}',
                TRUE,
                crypt('supabase', gen_salt('bf')) -- Senha temporária: supabase
            );
            
            -- Create identities record
            INSERT INTO auth.identities (
                id,
                user_id,
                identity_data,
                provider,
                provider_id,
                last_sign_in_at,
                created_at,
                updated_at
            )
            VALUES (
                user_id,
                user_id,
                format('{"sub":"%s","email":"%s"}', user_id::text, super_admin_email)::jsonb,
                'email',
                super_admin_email, -- usando o email como provider_id para autenticação por email
                NOW(),
                NOW(),
                NOW()
            );
        END IF;
        
        -- Update or insert into public.users
        INSERT INTO public.users (id, email, role)
        VALUES (user_id, super_admin_email, 'super_admin')
        ON CONFLICT (id) DO UPDATE
        SET role = 'super_admin'
        WHERE users.id = EXCLUDED.id;
        
        RAISE NOTICE 'Super admin created with email: % and id: %', super_admin_email, user_id;
        RAISE NOTICE 'Important: Set a password for this user through the Supabase dashboard or Auth API';
    ELSE
        RAISE NOTICE 'Super admin already exists, skipping creation.';
    END IF;
END
$$;