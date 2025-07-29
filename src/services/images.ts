import { supabase } from '@/integrations/supabase/client';

export interface ImageData {
  id: string;
  filename: string;
  url: string;
  position_x: number | null;
  position_y: number | null;
  scale: number | null;
  text_wrap: string | null;
  layout: string | null;
  z_index: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  file_size: bigint | null;
  mime_type: string | null;
  user_id: string;
  book_id: string | null;
  chapter_id: string | null;
}

export const imageService = {
  async getImages(userId: string, bookId?: string, chapterId?: string) {
    let query = supabase
      .from('images')
      .select('*')
      .eq('user_id', userId);
    
    if (bookId) query = query.eq('book_id', bookId);
    if (chapterId) query = query.eq('chapter_id', chapterId);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ImageData[];
  },

  async updateImage(imageId: string, updates: Partial<ImageData>) {
    const { data, error } = await supabase
      .from('images')
      .update(updates)
      .eq('id', imageId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ImageData;
  },

  async deleteImage(imageId: string) {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);
    
    if (error) throw error;
  },

  async resetImageProperties(imageId: string) {
    return this.updateImage(imageId, {
      position_x: 0,
      position_y: 0,
      scale: 1,
      text_wrap: 'none',
      layout: 'inline',
      z_index: 0
    });
  }
};