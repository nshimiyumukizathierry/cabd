-- COMPREHENSIVE DATABASE STATUS VERIFICATION
-- This script checks all aspects of the database setup

-- Check if all required tables exist
SELECT 
    'TABLE EXISTENCE CHECK' as check_type,
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM (
    VALUES 
        ('profiles'),
        ('cars'),
        ('founders')
) AS required_tables(table_name);

-- Check profiles table structure
SELECT 
    'PROFILES TABLE STRUCTURE' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if RLS is enabled on profiles
SELECT 
    'RLS STATUS' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'cars', 'founders')
AND schemaname = 'public';

-- Check existing policies
SELECT 
    'EXISTING POLICIES' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check triggers
SELECT 
    'TRIGGERS' as check_type,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check user data integrity
SELECT 
    'USER DATA INTEGRITY' as check_type,
    'auth.users vs profiles' as comparison,
    (SELECT COUNT(*) FROM auth.users) as auth_users_count,
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    (SELECT COUNT(*) FROM profiles WHERE user_id IS NOT NULL) as profiles_with_user_id,
    (SELECT COUNT(*) FROM profiles WHERE email IS NOT NULL AND email != '') as profiles_with_email;

-- Check for orphaned profiles
SELECT 
    'ORPHANED PROFILES' as check_type,
    COUNT(*) as orphaned_count
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE au.id IS NULL AND p.user_id IS NOT NULL;

-- Check for users without profiles
SELECT 
    'USERS WITHOUT PROFILES' as check_type,
    COUNT(*) as missing_profiles_count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- Check storage buckets
SELECT 
    'STORAGE BUCKETS' as check_type,
    name as bucket_name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- Check storage policies
SELECT 
    'STORAGE POLICIES' as check_type,
    bucket_id,
    name as policy_name,
    definition
FROM storage.policies
ORDER BY bucket_id, name;

-- Sample data verification
SELECT 
    'SAMPLE DATA' as check_type,
    'Recent profiles' as data_type;

SELECT 
    p.id,
    p.user_id,
    p.email,
    p.role,
    p.created_at,
    au.email as auth_email,
    CASE 
        WHEN p.user_id = au.id THEN 'MATCHED'
        ELSE 'MISMATCH'
    END as id_match_status
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Final health summary
SELECT 
    'HEALTH SUMMARY' as check_type,
    'Overall Status' as metric,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('profiles', 'cars', 'founders')
        ) = 3 
        AND (
            SELECT COUNT(*) FROM auth.users au
            LEFT JOIN profiles p ON au.id = p.user_id
            WHERE p.user_id IS NULL
        ) = 0
        AND (
            SELECT rowsecurity FROM pg_tables 
            WHERE tablename = 'profiles' AND schemaname = 'public'
        ) = true
        THEN 'HEALTHY'
        ELSE 'NEEDS_ATTENTION'
    END as status;
