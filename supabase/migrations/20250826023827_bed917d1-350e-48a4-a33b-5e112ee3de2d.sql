-- Corrigir a função is_admin para usar apenas admin_users (que funciona) por enquanto
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se o email do usuário atual está na tabela admin_users
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users au
    WHERE au.email = auth.email()
  ) OR EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
END;
$$;