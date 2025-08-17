-- Run this script to verify your database setup is correct

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'cars', 'cart_items', 'favorites');

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'cars', 'cart_items', 'favorites');

-- Check if there are any users in profiles table
SELECT COUNT(*) as user_count, 
       COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count
FROM public.profiles;

-- Check if there are any cars
SELECT COUNT(*) as car_count FROM public.cars;

-- Check if RLS policies exist
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public';
