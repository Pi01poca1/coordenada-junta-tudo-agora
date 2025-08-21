-- Adicionar campo name na tabela profiles para armazenar o nome do autor
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name text;

-- Criar índice para melhorar performance de consultas por nome
CREATE INDEX IF NOT EXISTS profiles_name_idx ON public.profiles(name);

-- Criar uma view que combina dados de auth.users com profiles para o dashboard admin
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.last_sign_in_at,
  p.name,
  p.first_name,
  p.last_name,
  p.bio,
  p.role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;