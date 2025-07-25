-- Criar apenas o bucket book-images de forma simples
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-images', 'book-images', true)
ON CONFLICT (id) DO NOTHING;