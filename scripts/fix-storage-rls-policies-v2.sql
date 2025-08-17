-- Fix Row Level Security policies for storage.objects table
-- This version handles existing policies properly

-- First, let's see what policies currently exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- Drop ALL existing policies for cars bucket (including the ones that already exist)
DROP POLICY IF EXISTS "Cars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_upload" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_update" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_delete" ON storage.objects;

-- Also drop any other variations that might exist
DROP POLICY IF EXISTS "Cars_public_access" ON storage.objects;
DROP POLICY IF EXISTS "Cars_upload" ON storage.objects;
DROP POLICY IF EXISTS "Cars_read" ON storage.objects;

-- Wait a moment for the drops to complete
SELECT pg_sleep(1);

-- Now create the new permissive policies for cars bucket

-- 1. Allow public read access to cars bucket
CREATE POLICY "Cars_public_read_v2" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cars');

-- 2. Allow public upload to cars bucket (no auth required)
CREATE POLICY "Cars_public_upload_v2" ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'cars');

-- 3. Allow public update in cars bucket (no auth required)
CREATE POLICY "Cars_public_update_v2" ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'cars')
WITH CHECK (bucket_id = 'cars');

-- 4. Allow public delete in cars bucket (no auth required)
CREATE POLICY "Cars_public_delete_v2" ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'cars');

-- Verify the new policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%Cars%'
ORDER BY policyname;

-- Check bucket configuration
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
WHERE id = 'cars';

-- Make sure the cars bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'cars';

-- Verify bucket is now public
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'cars';

-- Final verification - test if we can access the bucket
SELECT 'Storage setup complete! Cars bucket is now public with permissive RLS policies.' as status;
