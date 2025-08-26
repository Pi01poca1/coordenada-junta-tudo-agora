-- Corrigir função is_admin() que está causando erro no admin
DROP FUNCTION IF EXISTS public.is_admin();

-- Recriar função is_admin() simples usando apenas a tabela admin_users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se o email do usuário atual está na tabela admin_users
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users au
    WHERE au.email = auth.email()
  );
END;
$$;

-- Garantir que a função get_admin_users_data funcione corretamente
CREATE OR REPLACE FUNCTION public.get_admin_users_data()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  name text,
  first_name text,
  last_name text,
  role text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar estes dados';
  END IF;
  
  -- Retornar dados dos usuários combinando auth.users com profiles
  RETURN QUERY
  SELECT 
    u.id,
    u.email::text,
    u.created_at,
    u.last_sign_in_at,
    p.name,
    p.first_name,
    p.last_name,
    COALESCE(p.role, 'user'::text) as role
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  ORDER BY u.created_at DESC;
END;
$$;