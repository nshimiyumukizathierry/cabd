-- Complete database fix for CarBD platform
-- This script fixes all authentication, RLS, and user management issues

BEGIN;

-- Drop existing profiles table and recreate with proper structure
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with proper structure
CREATE TABLE public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies that don't cause recursion
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Create or replace function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users
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

COMMIT;

-- Verification queries
SELECT 'Auth users count:' as info, COUNT(*) as count FROM auth.users;
SELECT 'Profiles count:' as info, COUNT(*) as count FROM public.profiles;
SELECT 'Admin users:' as info, COUNT(*) as count FROM public.profiles WHERE role = 'admin';

-- Show sample data
SELECT 
    au.email,
    au.email_confirmed_at IS NOT NULL as confirmed,
    p.role,
    p.created_at
FROM auth.users au
JOIN public.profiles p ON au.id = p.user_id
ORDER BY p.created_at DESC
LIMIT 5;
