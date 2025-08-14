-- Reset Supabase Database
-- WARNING: This will delete ALL data and tables
-- Use with extreme caution, only for development/testing

-- Drop all tables in correct order (respecting foreign keys)
-- CASCADE automatically removes all associated policies, indexes, constraints, etc.
DROP TABLE IF EXISTS public.participants CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public._migrations CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop all triggers (they should cascade with functions, but just to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Optional: Reset auth users (WARNING: This will delete all authentication data)
-- Uncomment only if you want to completely reset authentication
-- DELETE FROM auth.users;

-- Clear storage buckets if any exist
-- DELETE FROM storage.objects;
-- DELETE FROM storage.buckets;

-- Success message
SELECT 'Database reset complete. All tables, functions, and triggers removed.' as status;