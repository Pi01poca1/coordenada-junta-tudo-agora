-- Primeiro, criar a tabela admin_emails se não existir
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email text PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela admin_emails
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Política RLS para admin_emails
DROP POLICY IF EXISTS "Admins can manage admin emails" ON public.admin_emails;
CREATE POLICY "Admins can manage admin emails" 
ON public.admin_emails 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.email()));

-- Inserir o email admin se não existir
INSERT INTO public.admin_emails (email) 
VALUES ('98sdobrados89@gmail.com') 
ON CONFLICT (email) DO NOTHING;

-- Atualizar a função is_admin para funcionar corretamente
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check both email-based admin (using admin_emails table) and role-based admin
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_emails a
    WHERE a.email = auth.email()
  ) OR EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ) OR EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.email = auth.email()
  );
END;
$$;