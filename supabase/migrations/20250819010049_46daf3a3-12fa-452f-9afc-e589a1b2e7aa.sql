-- Habilitar RLS nas tabelas que estão sem proteção
ALTER TABLE IF EXISTS admin_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_emails (somente admins podem gerenciar)
CREATE POLICY "Admins can manage admin emails"
ON admin_emails
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Políticas para admin_users (somente admins podem gerenciar)  
CREATE POLICY "Admins can manage admin users"
ON admin_users
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());