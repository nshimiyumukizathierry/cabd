-- Complete storage policy fix for image uploads

-- First, ensure the cars bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('cars', 'cars', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']) 
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

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

-- Create new comprehensive policies
-- 1. Allow public read access to all images in cars bucket
CREATE POLICY "Allow public read access to cars bucket" ON storage.objects 
FOR SELECT USING (bucket_id = 'cars');

-- 2. Allow authenticated users to upload to cars bucket
CREATE POLICY "Allow authenticated upload to cars bucket" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'cars' 
  AND auth.role() = 'authenticated'
);

-- 3. Allow authenticated users to update files in cars bucket
CREATE POLICY "Allow authenticated update in cars bucket" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'cars' 
  AND auth.role() = 'authenticated'
);

-- 4. Allow authenticated users to delete files in cars bucket
CREATE POLICY "Allow authenticated delete in cars bucket" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'cars' 
  AND auth.role() = 'authenticated'
);

-- Grant necessary permissions
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;

-- Grant permissions on storage.buckets
GRANT SELECT ON storage.buckets TO anon, authenticated;

-- Verify the setup
SELECT 
  b.id as bucket_name,
  b.public as is_public,
  b.file_size_limit,
  b.allowed_mime_types,
  COUNT(o.id) as object_count
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.id = o.bucket_id
WHERE b.id = 'cars'
GROUP BY b.id, b.public, b.file_size_limit, b.allowed_mime_types;

-- Show current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
