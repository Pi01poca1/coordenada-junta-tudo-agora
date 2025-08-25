-- Remove the problematic RPC function since we're using direct UPDATE
DROP FUNCTION IF EXISTS public.update_chapter_order(uuid, integer);