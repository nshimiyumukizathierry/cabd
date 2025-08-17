-- Create and configure the cars storage bucket properly

-- First, ensure the storage schema and extensions are set up
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the cars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at) 
VALUES (
  'cars', 
  'cars', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  NOW(),
  NOW()
) 
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  updated_at = NOW();

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can view car images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update car images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to cars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload to cars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update in cars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete in cars bucket" ON storage.objects;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for the cars bucket
-- 1. Allow public read access to all images in cars bucket
CREATE POLICY "cars_bucket_public_read" ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'cars');

-- 2. Allow authenticated users to upload to cars bucket
CREATE POLICY "cars_bucket_authenticated_upload" ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'cars');

-- 3. Allow authenticated users to update files in cars bucket
CREATE POLICY "cars_bucket_authenticated_update" ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'cars');

-- 4. Allow authenticated users to delete files in cars bucket
CREATE POLICY "cars_bucket_authenticated_delete" ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'cars');

-- Grant necessary permissions
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;

-- Grant permissions on storage.buckets
GRANT SELECT ON storage.buckets TO anon, authenticated;

-- Verify the bucket was created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'cars';

-- Show the policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%cars%';
