-- ===============================================
-- CONFIGURAÇÃO COMPLETA DO SUPABASE STORAGE
-- Para bucket chapter-images existente
-- ===============================================

-- 1. Verificar se o bucket chapter-images existe e está configurado
UPDATE storage.buckets 
SET 
  public = false,  -- Private bucket para segurança
  file_size_limit = 52428800,  -- 50MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'chapter-images';

-- 2. HABILITAR RLS NO STORAGE.OBJECTS (se não estiver)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. REMOVER POLICIES ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- 4. CRIAR POLICIES ROBUSTAS PARA chapter-images
-- Policy para UPLOAD (INSERT)
CREATE POLICY "Users can upload chapter images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'chapter-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy para VISUALIZAR (SELECT)
CREATE POLICY "Users can view chapter images" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'chapter-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy para ATUALIZAR (UPDATE)
CREATE POLICY "Users can update chapter images" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'chapter-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy para DELETAR (DELETE)
CREATE POLICY "Users can delete chapter images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'chapter-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. GRANT PERMISSIONS ROBUSTAS
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;