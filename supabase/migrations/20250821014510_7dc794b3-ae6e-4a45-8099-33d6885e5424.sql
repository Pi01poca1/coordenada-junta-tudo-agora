-- Corrigir vulnerabilidade de segurança na tabela profiles
-- Remove a política atual que permite visualização de todos os perfis
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Criar nova política mais segura que permite apenas visualização do próprio perfil
CREATE POLICY "Users can view only their own profile" ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

-- Manter política para que admins possam ver todos os perfis (para painel administrativo)
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT 
USING (is_admin());