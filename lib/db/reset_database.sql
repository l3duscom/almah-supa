-- Reset Supabase Database
-- WARNING: This will delete ALL data and tables
-- Use with extreme caution, only for development/testing

-- Drop all tables in correct order (respecting foreign keys)
-- CASCADE automatically removes all associated policies, indexes, constraints, etc.
DROP TABLE IF EXISTS public.participants CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.subscription_limits CASCADE;
DROP TABLE IF EXISTS public.pricing_plans CASCADE;
DROP TABLE IF EXISTS public._migrations CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_cliente() CASCADE;
DROP FUNCTION IF EXISTS public.update_clientes_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_pricing_plans_updated_at() CASCADE;

-- Drop all triggers (they should cascade with functions, but just to be safe)
-- Note: Only drop triggers on tables that might exist
DO $$
BEGIN
    -- Drop triggers on auth.users (this table always exists)
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS on_auth_user_cliente_created ON auth.users;
    
    -- Drop triggers on tables only if they exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clientes' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_clientes_updated_at ON public.clientes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_plans' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS pricing_plans_updated_at ON public.pricing_plans;
    END IF;
END
$$;

-- Optional: Reset auth users (WARNING: This will delete all authentication data)
-- Uncomment only if you want to completely reset authentication
-- DELETE FROM auth.users;

-- Clear storage buckets if any exist
-- DELETE FROM storage.objects;
-- DELETE FROM storage.buckets;

-- Success message
SELECT 'Database reset complete. All tables, functions, and triggers removed.' as status;