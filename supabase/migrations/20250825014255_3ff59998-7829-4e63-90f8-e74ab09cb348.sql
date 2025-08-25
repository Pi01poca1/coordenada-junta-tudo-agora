-- Primeiro, vamos limpar qualquer duplicata existente
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

-- Agora criar constraint única para evitar duplicatas
ALTER TABLE chapters 
ADD CONSTRAINT chapters_book_order_unique 
UNIQUE (book_id, order_index);

-- Tornar order_index NOT NULL 
ALTER TABLE chapters 
ALTER COLUMN order_index SET NOT NULL;

-- Adicionar um índice para performance
CREATE INDEX IF NOT EXISTS idx_chapters_book_order 
ON chapters (book_id, order_index);