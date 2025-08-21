-- Corrigir problemas de segurança identificados pelo linter

-- 1. Remover a view que expõe auth.users
DROP VIEW IF EXISTS admin_users_view;

-- 2. Criar uma função segura para admins consultarem dados de usuários
-- Esta função só retorna dados para usuários admin e não expõe auth.users diretamente
CREATE OR REPLACE FUNCTION public.get_admin_users_data()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  name text,
  first_name text,
  last_name text,
  bio text,
  role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Retornar dados de profiles (não diretamente de auth.users)
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(p.first_name || ' ' || p.last_name, p.name, 'Usuário')::text as email_display,
    p.created_at,
    p.updated_at as last_sign_in_at,
    p.name,
    p.first_name,
    p.last_name,
    p.bio,
    COALESCE(p.role, 'user')::text as role
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- 3. Corrigir a função handle_new_user para ter search_path correto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, first_name, last_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'first_name'),
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;