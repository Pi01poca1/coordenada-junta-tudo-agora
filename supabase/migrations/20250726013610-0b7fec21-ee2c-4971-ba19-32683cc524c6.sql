-- Tornar o bucket chapter-images público também
UPDATE storage.buckets 
SET public = true 
WHERE id = 'chapter-images';