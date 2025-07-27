import { supabase } from "@/integrations/supabase/client";

export type ImageEntity = {
  id: string;
  user_id: string;
  book_id?: string | null;
  chapter_id?: string | null;
  url: string;
  filename: string;
  alt_text: string | null;
  position_x: number | null;
  position_y: number | null;
  scale: number | null;
  text_wrap: string | null;
  layout: string | null;
  z_index: number | null;
  width: number | null;
  height: number | null;
  created_at?: string;
};

export async function listImages(params: { userId: string; chapterId?: string; bookId?: string }) {
  const { userId, chapterId, bookId } = params;
  let q = supabase.from("images").select("*").eq("user_id", userId).order("created_at", { ascending: true });
  if (chapterId) q = q.eq("chapter_id", chapterId);
  else if (bookId) q = q.eq("book_id", bookId).is("chapter_id", null);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ImageEntity[];
}

export async function updateImage(id: string, patch: Partial<ImageEntity>, userId: string) {
  const { error } = await supabase.from("images").update(patch).eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

