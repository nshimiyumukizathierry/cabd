-- COMPREHENSIVE PROFILES TABLE FIX
-- This script will fix all profiles table issues and ensure proper structure

-- First, let's check what columns currently exist
DO $$
DECLARE
    has_updated_at BOOLEAN := FALSE;
    has_user_id BOOLEAN := FALSE;
    has_phone BOOLEAN := FALSE;
    has_full_name BOOLEAN := FALSE;
    has_avatar_url BOOLEAN := FALSE;
    table_exists BOOLEAN := FALSE;
BEGIN
    -- Check if profiles table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Profiles table exists, checking columns...';
        
        -- Check for updated_at column
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'updated_at'
        ) INTO has_updated_at;
        
        -- Check for user_id column
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'user_id'
        ) INTO has_user_id;
        
        -- Check for phone column
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'phone'
        ) INTO has_phone;
        
        -- Check for full_name column
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'full_name'
        ) INTO has_full_name;
        
        -- Check for avatar_url column
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'avatar_url'
        ) INTO has_avatar_url;
        
        RAISE NOTICE 'Column check - updated_at: %, user_id: %, phone: %, full_name: %, avatar_url: %', 
                     has_updated_at, has_user_id, has_phone, has_full_name, has_avatar_url;
    ELSE
        RAISE NOTICE 'Profiles table does not exist, will create it';
    END IF;
END $$;

-- Create the profiles table with complete structure if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns one by one (this won't fail if they already exist)
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'user_id column already exists';
    END;
    
    -- Add updated_at column if it doesn't exist
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'updated_at column already exists';
    END;
    
    -- Add full_name column if it doesn't exist
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        RAISE NOTICE 'Added full_name column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'full_name column already exists';
    END;
    
    -- Add avatar_url column if it doesn't exist
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'avatar_url column already exists';
    END;
    
    -- Add phone column if it doesn't exist
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
        RAISE NOTICE 'Added phone column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'phone column already exists';
    END;
END $$;

-- Create unique constraints if they don't exist
DO $$
BEGIN
    -- Add unique constraint on user_id if it doesn't exist
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint on user_id';
    EXCEPTION
        WHEN duplicate_table THEN
            RAISE NOTICE 'Unique constraint on user_id already exists';
    END;
    
    -- Add unique constraint on email if it doesn't exist
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
        RAISE NOTICE 'Added unique constraint on email';
    EXCEPTION
        WHEN duplicate_table THEN
            RAISE NOTICE 'Unique constraint on email already exists';
    END;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Now safely migrate existing data
DO $$
DECLARE
    missing_profiles_count INTEGER;
BEGIN
    -- Count users in auth.users who don't have profiles
    SELECT COUNT(*) INTO missing_profiles_count
    FROM auth.users au
    LEFT JOIN profiles p ON au.id = p.user_id OR au.id = p.id
    WHERE p.id IS NULL;
    
    RAISE NOTICE 'Found % users without profiles', missing_profiles_count;
    
    -- Create profiles for users who don't have them
    IF missing_profiles_count > 0 THEN
        INSERT INTO profiles (user_id, email, role, created_at, updated_at)
        SELECT 
            au.id,
            COALESCE(au.email, ''),
            'user',
            COALESCE(au.created_at, NOW()),
            NOW()
        FROM auth.users au
        LEFT JOIN profiles p ON au.id = p.user_id
        WHERE p.user_id IS NULL
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = EXCLUDED.updated_at;
            
        RAISE NOTICE 'Created/updated profiles for missing users';
    END IF;
    
    -- Update existing profiles that might be missing user_id
    UPDATE profiles 
    SET user_id = id, updated_at = NOW()
    WHERE user_id IS NULL 
    AND id IN (SELECT id FROM auth.users);
    
    -- Update existing profiles to ensure they have email data
    UPDATE profiles 
    SET email = au.email, updated_at = NOW()
    FROM auth.users au
    WHERE profiles.user_id = au.id
    AND (profiles.email IS NULL OR profiles.email = '');
    
END $$;

-- Create or replace the trigger function for new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        'user',
        COALESCE(NEW.created_at, NOW()),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = EXCLUDED.updated_at;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists and is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to sync user emails when they change
CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS trigger AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        email = NEW.email,
        updated_at = NOW()
    WHERE user_id = NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to sync email for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email changes
DROP TRIGGER IF EXISTS on_auth_user_email_change ON auth.users;
CREATE TRIGGER on_auth_user_email_change
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW 
    WHEN (OLD.email IS DISTINCT FROM NEW.email)
    EXECUTE FUNCTION public.handle_user_email_change();

-- Final verification and reporting
SELECT 
    'FINAL VERIFICATION' as status,
    'Profiles table structure:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'DATA SUMMARY' as status,
    'Profile counts:' as info;

SELECT 
    'auth.users' as table_name,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
    'profiles_with_email' as table_name,
    COUNT(*) as count
FROM profiles
WHERE email IS NOT NULL AND email != ''
UNION ALL
SELECT 
    'admin_profiles' as table_name,
    COUNT(*) as count
FROM profiles
WHERE role = 'admin';

-- Show sample data to verify everything is working
SELECT 
    'SAMPLE DATA' as status,
    'Recent profiles:' as info;

SELECT 
    p.id,
    p.user_id,
    p.email,
    p.role,
    p.created_at,
    p.updated_at,
    au.email as auth_email
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
ORDER BY p.created_at DESC
LIMIT 5;
