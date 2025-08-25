-- Move extensões do schema public para o schema extensions
-- Isso resolve o warning "Extension in Public"

-- Criar schema extensions se não existir
CREATE SCHEMA IF NOT EXISTS extensions;

-- Mover extensão citext se existir no public
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'citext' AND pg_extension.extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        -- Remover do public e recriar no extensions
        DROP EXTENSION IF EXISTS citext CASCADE;
        CREATE EXTENSION IF NOT EXISTS citext SCHEMA extensions;
    END IF;
END $$;