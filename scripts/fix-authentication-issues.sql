-- Fix authentication issues and ensure proper user registration/login flow
-- This script addresses login credential issues and email confirmation problems

BEGIN;

-- First, let's check the current state of auth.users and profiles
SELECT 'Current auth.users count:' as info, COUNT(*) as count FROM auth.users;
SELECT 'Current profiles count:' as info, COUNT(*) as count FROM public.profiles;

-- Check if there are users in auth.users without profiles
SELECT 'Users without profiles:' as info, COUNT(*) as count 
FROM auth.users au 
LEFT JOIN public.profiles p ON au.id = p.user_id 
WHERE p.user_id IS NULL;

-- Check email confirmation status
SELECT 
    'Email confirmation status:' as info,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmed,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unconfirmed
FROM auth.users;

-- Create profiles for any auth.users that don't have them
INSERT INTO public.profiles (user_id, email, role, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(au.email, ''),
    CASE 
        WHEN au.email = 'thierrynshimiyumukiza@gmail.com' THEN 'admin'
        WHEN au.email ILIKE '%admin%' THEN 'admin'
        ELSE 'user'
    END,
    COALESCE(au.created_at, NOW()),
    NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = EXCLUDED.updated_at;

-- Update auth.users metadata to include role information
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', p.role)
FROM public.profiles p 
WHERE auth.users.id = p.user_id;

-- For the specific user having login issues, let's check their status
DO $$
DECLARE
    user_record RECORD;
    profile_record RECORD;
BEGIN
    -- Check if the user exists in auth.users
    SELECT * INTO user_record 
    FROM auth.users 
    WHERE email = 'thierrynshimiyumukiza@gmail.com';
    
    IF user_record.id IS NOT NULL THEN
        RAISE NOTICE 'User found in auth.users: ID=%, Email=%, Confirmed=%', 
            user_record.id, 
            user_record.email, 
            CASE WHEN user_record.email_confirmed_at IS NOT NULL THEN 'YES' ELSE 'NO' END;
            
        -- Check if they have a profile
        SELECT * INTO profile_record 
        FROM public.profiles 
        WHERE user_id = user_record.id;
        
        IF profile_record.id IS NOT NULL THEN
            RAISE NOTICE 'Profile found: Role=%, Created=%', 
                profile_record.role, 
                profile_record.created_at;
        ELSE
            RAISE NOTICE 'No profile found - creating one now';
            INSERT INTO public.profiles (user_id, email, role, created_at, updated_at)
            VALUES (
                user_record.id,
                user_record.email,
                'admin',
                NOW(),
                NOW()
            );
        END IF;
    ELSE
        RAISE NOTICE 'User not found in auth.users table';
    END IF;
END $$;

-- Ensure the user registration trigger is working properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile for new user
    INSERT INTO public.profiles (user_id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        CASE 
            WHEN NEW.email = 'thierrynshimiyumukiza@gmail.com' THEN 'admin'
            WHEN NEW.email ILIKE '%admin%' THEN 'admin'
            ELSE 'user'
        END,
        COALESCE(NEW.created_at, NOW()),
        NOW()
    );
    
    -- Update user metadata with role
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', 
            CASE 
                WHEN NEW.email = 'thierrynshimiyumukiza@gmail.com' THEN 'admin'
                WHEN NEW.email ILIKE '%admin%' THEN 'admin'
                ELSE 'user'
            END
        )
    WHERE id = NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- Final verification
SELECT 'Final verification:' as info;
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    au.created_at as auth_created,
    p.role,
    p.created_at as profile_created
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE au.email = 'thierrynshimiyumukiza@gmail.com';

SELECT 'All users summary:' as info;
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmed_users,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unconfirmed_users
FROM auth.users;
