-- Tornar o bucket book-images público para facilitar acesso
UPDATE storage.buckets 
SET public = true 
WHERE id = 'book-images';