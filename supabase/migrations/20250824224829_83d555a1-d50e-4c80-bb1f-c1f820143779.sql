-- Create function to safely update chapter order
CREATE OR REPLACE FUNCTION public.update_chapter_order(chapter_id uuid, new_order integer)
RETURNS void AS $$
BEGIN
  UPDATE public.chapters 
  SET order_index = new_order, updated_at = now() 
  WHERE id = chapter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;