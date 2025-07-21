import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rfxrguxoqnspsrqzzwlc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmeHJndXhvcW5zcHNycXp6d2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjUwNTIsImV4cCI6MjA2ODU0MTA1Mn0.PJ5jrYu6eXVuaVVel8fJTqRsn9FFWYMTJw2q1u1y8fc";

export const supabaseStorageClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const BUCKET_NAME = 'chapter-images';

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