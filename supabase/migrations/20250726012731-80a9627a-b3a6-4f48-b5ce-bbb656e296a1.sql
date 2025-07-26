-- Corrigir constraint da coluna chapter_id para permitir NULL
-- Isso permite imagens de capa (sem chapter_id) e imagens de capítulos (com chapter_id)
ALTER TABLE public.images ALTER COLUMN chapter_id DROP NOT NULL;