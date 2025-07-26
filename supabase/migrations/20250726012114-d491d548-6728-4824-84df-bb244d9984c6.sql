-- ===============================================
-- POLÍTICAS RLS PARA BUCKET BOOK-IMAGES (CAPAS)
-- ===============================================

-- 1. VERIFICAR SE BUCKET EXISTE E CONFIGURAR
UPDATE storage.buckets 
SET 
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'book-images';

-- 2. REMOVER POLICIES ANTIGAS DO BOOK-IMAGES (se existirem)
DROP POLICY IF EXISTS "Users can upload book covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can view book covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can update book covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete book covers" ON storage.objects;

-- 3. CRIAR POLÍTICAS CORRETAS PARA BOOK-IMAGES
-- Policy para UPLOAD (INSERT)
CREATE POLICY "Users can upload book covers" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy para VISUALIZAR (SELECT)
CREATE POLICY "Users can view book covers" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy para ATUALIZAR (UPDATE)
CREATE POLICY "Users can update book covers" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy para DELETAR (DELETE)
CREATE POLICY "Users can delete book covers" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);