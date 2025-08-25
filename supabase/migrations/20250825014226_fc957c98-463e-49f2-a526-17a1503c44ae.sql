-- Primeiro, vamos limpar qualquer duplicata existente e garantir order_index únicos
WITH ranked_chapters AS (
  SELECT 
    id,
    book_id,
    ROW_NUMBER() OVER (PARTITION BY book_id ORDER BY COALESCE(order_index, created_at)) as new_order
  FROM chapters
)
UPDATE chapters 
SET order_index = ranked_chapters.new_order
FROM ranked_chapters 
WHERE chapters.id = ranked_chapters.id;

-- Agora criar constraint única para evitar duplicatas
ALTER TABLE chapters 
ADD CONSTRAINT chapters_book_order_unique 
UNIQUE (book_id, order_index);

-- Tornar order_index NOT NULL com valor padrão
ALTER TABLE chapters 
ALTER COLUMN order_index SET NOT NULL;

-- Adicionar um índice para performance
CREATE INDEX IF NOT EXISTS idx_chapters_book_order 
ON chapters (book_id, order_index);