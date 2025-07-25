import { supabase } from '@/integrations/supabase/client';

export const supabaseStorageClient = supabase;

export const BUCKET_NAME = 'book-images';

export const uploadImage = async (chapterId: string, file: File) => {
  const filePath = `${chapterId}/${file.name}`;
  
  const { data, error } = await supabaseStorageClient.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabaseStorageClient.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
    
  return { path: filePath, publicUrl };
};

export const deleteImage = async (path: string) => {
  const { error } = await supabaseStorageClient.storage
    .from(BUCKET_NAME)
    .remove([path]);
    
  if (error) throw error;
};