-- Create RLS policies for userdata bucket
-- Users can only access their own folder: userdata/{user_id}/*

-- Policy: Users can read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'userdata' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'userdata' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'userdata' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'userdata' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);