-- Configuração robusta apenas do bucket chapter-images
UPDATE storage.buckets 
SET 
  public = true,  -- Tornar público para facilitar acesso
  file_size_limit = 52428800,  -- 50MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'chapter-images';