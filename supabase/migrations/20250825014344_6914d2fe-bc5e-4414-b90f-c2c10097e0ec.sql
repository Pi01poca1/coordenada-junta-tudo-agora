-- Primeiro, corrigir o trigger que está causando o erro
CREATE OR REPLACE FUNCTION public.update_table_of_contents()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se já existe entrada para este capítulo
  IF EXISTS (SELECT 1 FROM public.table_of_contents WHERE chapter_id = NEW.id) THEN
    -- Atualizar entrada existente
    UPDATE public.table_of_contents 
    SET updated_at = now() 
    WHERE chapter_id = NEW.id;
  ELSE
    -- Inserir nova entrada
    INSERT INTO public.table_of_contents (book_id, chapter_id, level)
    VALUES (NEW.book_id, NEW.id, 1);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Agora criar constraint única em table_of_contents para chapter_id
ALTER TABLE table_of_contents 
ADD CONSTRAINT table_of_contents_chapter_unique 
UNIQUE (chapter_id);

-- Limpar duplicatas na tabela chapters
WITH ranked_chapters AS (
  SELECT 
    id,
    book_id,
    ROW_NUMBER() OVER (PARTITION BY book_id ORDER BY 
      CASE 
        WHEN order_index IS NULL THEN 999999 
        ELSE order_index 
      END, 
      created_at
    ) as new_order
  FROM chapters
)
UPDATE chapters 
SET order_index = ranked_chapters.new_order
FROM ranked_chapters 
WHERE chapters.id = ranked_chapters.id;

-- Criar constraint única para chapters
ALTER TABLE chapters 
ADD CONSTRAINT chapters_book_order_unique 
UNIQUE (book_id, order_index);

-- Tornar order_index NOT NULL 
ALTER TABLE chapters 
ALTER COLUMN order_index SET NOT NULL;