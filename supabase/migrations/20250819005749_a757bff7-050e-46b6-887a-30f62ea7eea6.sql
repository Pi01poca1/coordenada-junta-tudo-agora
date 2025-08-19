-- Atualizar email admin na tabela admin_emails
DELETE FROM admin_emails;
INSERT INTO admin_emails (email) VALUES ('98sdobrados89@gmail.com');

-- Garantir que a função is_admin funciona corretamente
-- (já existe, mas verificando se está usando a tabela correta)