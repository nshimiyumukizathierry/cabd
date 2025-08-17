-- Ensure admin account exists and is properly configured
-- Run this script to set up the admin account for thierrynshimiyumukiza@gmail.com

-- First, check if the profile exists
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Try to find existing user by email
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'thierrynshimiyumukiza@gmail.com' 
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Update existing profile to admin
        INSERT INTO public.profiles (id, email, role, created_at)
        VALUES (admin_user_id, 'thierrynshimiyumukiza@gmail.com', 'admin', NOW())
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            email = 'thierrynshimiyumukiza@gmail.com';
            
        RAISE NOTICE 'Admin profile updated for existing user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'No user found with email thierrynshimiyumukiza@gmail.com';
        RAISE NOTICE 'Please register this email first, then run this script again';
    END IF;
END $$;

-- Verify the admin setup
SELECT 
    p.id,
    p.email,
    p.role,
    p.created_at,
    CASE 
        WHEN p.role = 'admin' THEN '✅ Admin access granted'
        ELSE '❌ Not an admin'
    END as status
FROM public.profiles p
WHERE p.email = 'thierrynshimiyumukiza@gmail.com';

-- Grant admin permissions
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'thierrynshimiyumukiza@gmail.com';

-- Show final status
SELECT 'Admin setup complete!' as message;
