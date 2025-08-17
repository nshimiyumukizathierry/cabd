-- Setup RLS policies for 'cars' bucket with S3 endpoint
-- Execute this script in Supabase SQL Editor

-- First, let's check if the bucket exists
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'cars';

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "CarBD_public_read" ON storage.objects;
DROP POLICY IF EXISTS "CarBD_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "CarBD_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "CarBD_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_delete" ON storage.objects;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for the 'cars' bucket
-- Policy 1: Allow public read access to cars bucket
CREATE POLICY "Cars_S3_public_read" ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'cars');

-- Policy 2: Allow authenticated users to upload to cars bucket
CREATE POLICY "Cars_S3_authenticated_upload" ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'cars');

-- Policy 3: Allow authenticated users to update files in cars bucket
CREATE POLICY "Cars_S3_authenticated_update" ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'cars')
WITH CHECK (bucket_id = 'cars');

-- Policy 4: Allow authenticated users to delete files from cars bucket
CREATE POLICY "Cars_S3_authenticated_delete" ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'cars');

-- Policy 5: Allow service role full access (for admin operations)
CREATE POLICY "Cars_S3_service_role_access" ON storage.objects 
FOR ALL 
TO service_role 
USING (bucket_id = 'cars')
WITH CHECK (bucket_id = 'cars');

-- Ensure the bucket is public if it exists
UPDATE storage.buckets 
SET public = true 
WHERE id = 'cars';

-- Create the bucket if it doesn't exist (optional)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cars', 
  'cars', 
  true, 
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Verify the policies were created
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
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%Cars_S3%'
ORDER BY policyname;

-- Check bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'cars';

-- Test query to see if we can access the bucket
SELECT COUNT(*) as file_count
FROM storage.objects 
WHERE bucket_id = 'cars';
