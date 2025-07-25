-- ===============================================
-- CORREÇÃO URGENTE: CRIAR BUCKET BOOK-IMAGES
-- Execute no Supabase SQL Editor
-- ===============================================

-- 1. CRIAR O BUCKET book-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-images', 
  'book-images', 
  false,  -- Private bucket
  52428800,  -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 2. HABILITAR RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. RECRIAR POLICIES CORRETAS
DROP POLICY IF EXISTS "Users can upload book images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view book images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update book images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete book images" ON storage.objects;

-- Policy para UPLOAD (INSERT)
CREATE POLICY "Users can upload book images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy para VISUALIZAR (SELECT)
CREATE POLICY "Users can view book images" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy para ATUALIZAR (UPDATE)
CREATE POLICY "Users can update book images" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy para DELETAR (DELETE)
CREATE POLICY "Users can delete book images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);