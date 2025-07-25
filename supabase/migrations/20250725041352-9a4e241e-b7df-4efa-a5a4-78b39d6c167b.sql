-- Remover policies existentes que podem estar conflitando
DROP POLICY IF EXISTS "Users can upload book images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view book images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update book images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete book images" ON storage.objects;

-- Criar policy simples para o bucket book-images (público)
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'book-images');