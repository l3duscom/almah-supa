-- Drop all RLS policies from Supabase
-- WARNING: This removes ALL security policies
-- Use with extreme caution

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop through all policies in the public schema
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
        
        RAISE NOTICE 'Dropped policy: % on table %', 
                     policy_record.policyname, 
                     policy_record.tablename;
    END LOOP;
    
    RAISE NOTICE 'All policies dropped successfully';
END
$$;