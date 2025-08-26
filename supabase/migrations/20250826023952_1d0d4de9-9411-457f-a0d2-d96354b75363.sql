-- Adicionar o email admin para que as funcionalidades de admin funcionem
INSERT INTO public.admin_users (email) 
VALUES ('98sdobrados89@gmail.com') 
ON CONFLICT (email) DO NOTHING;