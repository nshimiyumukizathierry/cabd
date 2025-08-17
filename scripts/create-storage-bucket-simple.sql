-- Simple storage bucket creation script that works with standard permissions
-- This script only creates what we can with standard user permissions

-- Create the cars bucket using Supabase's built-in functions
-- Note: This may need to be done via the Supabase Dashboard if permissions are restricted

-- First, let's check if the bucket exists
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'cars';

-- If the above query returns no results, the bucket doesn't exist
-- You'll need to create it via the Supabase Dashboard or use the client-side approach

-- Check current storage policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- Check if we have the necessary permissions
SELECT 
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'storage' 
  AND table_name = 'objects';
