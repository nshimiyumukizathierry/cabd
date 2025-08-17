-- Fix user profile creation and ensure proper email synchronization
-- This script ensures that all user profiles are created with proper email data

-- First, let's check if we have any users without profiles
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
        -- Try with user_id column first
        INSERT INTO profiles (user_id, email, role, created_at, updated_at)
        SELECT 
            au.id,
            au.email,
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
END $$;

-- Update existing profiles to ensure they have email data
UPDATE profiles 
SET email = au.email, updated_at = NOW()
FROM auth.users au
WHERE (profiles.user_id = au.id OR profiles.id = au.id)
AND (profiles.email IS NULL OR profiles.email = '');

-- Create or replace the trigger function for new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Insert new profile with user data
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
        -- Log the error but don't fail the user creation
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
    -- Update profile email when auth user email changes
    UPDATE public.profiles 
    SET 
        email = NEW.email,
        updated_at = NOW()
    WHERE user_id = NEW.id OR id = NEW.id;
    
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

-- Verify the setup
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
WHERE email IS NOT NULL AND email != '';

-- Show sample data to verify
SELECT 
    p.id,
    p.user_id,
    p.email,
    p.role,
    p.created_at,
    au.email as auth_email
FROM profiles p
LEFT JOIN auth.users au ON (p.user_id = au.id OR p.id = au.id)
ORDER BY p.created_at DESC
LIMIT 5;
