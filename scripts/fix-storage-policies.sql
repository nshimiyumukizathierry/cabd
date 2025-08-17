-- Fix storage bucket policies to ensure images are publicly accessible

-- Ensure the cars bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cars', 'cars', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Public can view car images" ON storage.objects 
FOR SELECT USING (bucket_id = 'cars');

CREATE POLICY "Authenticated users can upload car images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'cars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update car images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'cars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete car images" ON storage.objects 
FOR DELETE USING (bucket_id = 'cars' AND auth.role() = 'authenticated');

-- Grant necessary permissions for storage
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.objects TO authenticated;

-- Verify the setup
SELECT 
  b.id as bucket_name,
  b.public as is_public,
  COUNT(o.id) as object_count
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.id = o.bucket_id
WHERE b.id = 'cars'
GROUP BY b.id, b.public;
