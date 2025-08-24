-- Update function to include secure search path
CREATE OR REPLACE FUNCTION public.update_chapter_order(chapter_id uuid, new_order integer)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.chapters 
  SET order_index = new_order, updated_at = now() 
  WHERE id = chapter_id;
END;
$$;