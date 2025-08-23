-- Security Fix 7: Move citext extension to extensions schema (if exists)
-- This addresses the "Extension in Public" warning

-- Check if citext extension exists in public schema and move it
DO $$
BEGIN
    -- Drop extension from public schema if it exists there
    IF EXISTS (
        SELECT 1 FROM pg_extension e 
        JOIN pg_namespace n ON e.extnamespace = n.oid 
        WHERE e.extname = 'citext' AND n.nspname = 'public'
    ) THEN
        DROP EXTENSION IF EXISTS citext CASCADE;
        
        -- Recreate in extensions schema if available, otherwise in public with comment
        BEGIN
            CREATE EXTENSION IF NOT EXISTS citext SCHEMA extensions;
        EXCEPTION WHEN others THEN
            -- Fallback to public schema with security note
            CREATE EXTENSION IF NOT EXISTS citext SCHEMA public;
            COMMENT ON EXTENSION citext IS 'Security Note: Should be moved to extensions schema when available';
        END;
    END IF;
END
$$;

-- Security Fix 8: Create security monitoring view for admins
CREATE OR REPLACE VIEW public.security_overview AS
SELECT 
    'failed_logins_last_24h' as metric,
    COUNT(*)::text as value,
    'Failed login attempts in last 24 hours' as description
FROM public.failed_login_attempts 
WHERE attempt_time > now() - interval '24 hours'

UNION ALL

SELECT 
    'admin_actions_last_24h' as metric,
    COUNT(*)::text as value,
    'Admin actions in last 24 hours' as description
FROM public.admin_audit_log 
WHERE created_at > now() - interval '24 hours'

UNION ALL

SELECT 
    'total_users' as metric,
    COUNT(*)::text as value,
    'Total registered users' as description
FROM public.profiles

UNION ALL

SELECT 
    'admin_users' as metric,
    COUNT(*)::text as value,
    'Total admin users' as description
FROM public.profiles 
WHERE role = 'admin';

-- Only admins can access security overview
CREATE POLICY "Admins can view security overview" 
ON public.security_overview 
FOR SELECT 
USING (is_admin());

-- Security Fix 9: Add function to detect potential security threats
CREATE OR REPLACE FUNCTION public.detect_security_threats()
RETURNS TABLE(threat_type text, severity text, description text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only admins can run threat detection
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;
    
    RETURN QUERY
    -- High frequency failed logins from same email
    SELECT 
        'frequent_failed_logins'::text as threat_type,
        'HIGH'::text as severity,
        'Email with more than 10 failed login attempts in last hour'::text as description,
        COUNT(*) as count
    FROM public.failed_login_attempts f1
    WHERE f1.attempt_time > now() - interval '1 hour'
    GROUP BY f1.email
    HAVING COUNT(*) > 10
    
    UNION ALL
    
    -- Suspicious admin activity
    SELECT 
        'excessive_admin_activity'::text as threat_type,
        'MEDIUM'::text as severity,
        'Admin with more than 50 actions in last hour'::text as description,
        COUNT(*) as count
    FROM public.admin_audit_log a1
    WHERE a1.created_at > now() - interval '1 hour'
    GROUP BY a1.admin_id
    HAVING COUNT(*) > 50;
END;
$$;