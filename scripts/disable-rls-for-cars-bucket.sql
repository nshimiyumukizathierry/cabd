-- Complete storage setup for CarBD platform
-- This script will create the cars bucket and set up proper policies

-- First, check what buckets currently exist
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
ORDER BY created_at;

-- Create or update the cars bucket with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cars',
  'cars', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Drop ALL existing policies for cars bucket to avoid conflicts
DROP POLICY IF EXISTS "Cars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_upload" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_update" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_read_v2" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_upload_v2" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_update_v2" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_delete_v2" ON storage.objects;
DROP POLICY IF EXISTS "Cars_bucket_public_access" ON storage.objects;

-- Wait for drops to complete
SELECT pg_sleep(1);

-- Create a single comprehensive policy for all operations
CREATE POLICY "Cars_bucket_full_access" ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'cars')
WITH CHECK (bucket_id = 'cars');

-- Verify the policy was created
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
AND policyname = 'Cars_bucket_full_access';

-- Final verification of bucket settings
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'cars';

-- Success message
SELECT 'CarBD storage setup complete! Cars bucket is now fully accessible.' as status;
