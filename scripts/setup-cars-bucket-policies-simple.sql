-- Verify storage policies for cars bucket
-- These should already be created via the Supabase Dashboard

-- Check if policies exist
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

-- Test basic operations (these should work with your policies)
-- SELECT: Public read access
-- INSERT: Authenticated upload
-- UPDATE: Authenticated update  
-- DELETE: Authenticated delete

-- If you need to recreate policies manually, use the Supabase Dashboard:
-- 1. Go to Storage > Policies
-- 2. Create policies for storage.objects table:
--    - SELECT: Allow public read access to cars bucket
--    - INSERT: Allow authenticated upload to cars bucket  
--    - UPDATE: Allow authenticated update in cars bucket
--    - DELETE: Allow authenticated delete in cars bucket
