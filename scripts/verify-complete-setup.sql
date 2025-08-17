-- Complete database verification for CarBD platform
-- Run this to check if everything is set up correctly

-- 1. Check all required tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'cars', 'cart_items', 'favorites', 'founders')
ORDER BY table_name;

-- 2. Check RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'cars', 'cart_items', 'favorites', 'founders')
ORDER BY tablename;

-- 3. Check all RLS policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Check storage bucket and policies
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'cars';

SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%Cars%'
ORDER BY policyname;

-- 5. Check sample data exists
SELECT 'Cars' as table_name, COUNT(*) as record_count FROM cars
UNION ALL
SELECT 'Profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'Founders' as table_name, COUNT(*) as record_count FROM founders
ORDER BY table_name;

-- 6. Check for any cars with images
SELECT 
    make,
    model,
    year,
    price,
    stock_quantity,
    CASE 
        WHEN image_url IS NOT NULL AND image_url != '' THEN 'Has Image'
        ELSE 'No Image'
    END as image_status
FROM cars
ORDER BY created_at DESC
LIMIT 10;

-- 7. Check for any founders with images
SELECT 
    name,
    position,
    CASE 
        WHEN image_path IS NOT NULL AND image_path != '' THEN 'Has Image'
        ELSE 'No Image'
    END as image_status
FROM founders
ORDER BY display_order
LIMIT 10;

-- 8. Final status check
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM cars) > 0 
        AND (SELECT COUNT(*) FROM storage.buckets WHERE id = 'cars' AND public = true) > 0
        AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND policyname LIKE '%Cars%') > 0
        THEN '✅ CarBD Platform Ready!'
        ELSE '❌ Setup Incomplete - Check above results'
    END as platform_status;
