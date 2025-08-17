-- Create storage policies for carbd-images bucket
-- Run each statement individually in Supabase SQL Editor

-- Policy 1: Allow public read access
CREATE POLICY "CarBD_public_read" ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'carbd-images');

-- Policy 2: Allow authenticated users to upload
CREATE POLICY "CarBD_authenticated_upload" ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'carbd-images');

-- Policy 3: Allow authenticated users to update
CREATE POLICY "CarBD_authenticated_update" ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'carbd-images');

-- Policy 4: Allow authenticated users to delete
CREATE POLICY "CarBD_authenticated_delete" ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'carbd-images');
